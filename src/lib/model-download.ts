type ProgressListener = (loaded: number, total: number) => void;

interface DownloadTask {
  promise: Promise<ArrayBuffer>;
  listeners: Set<ProgressListener>;
  loaded: number;
  total: number;
}

const downloadTasks = new Map<string, DownloadTask>();
const downloadChunkSize = 4 * 1024 * 1024;
const maxChunkAttempts = 3;

export function preloadModelFile(url: string): Promise<ArrayBuffer> {
  return getDownloadTask(url).promise;
}

export async function loadModelFile(
  url: string,
  onProgress?: ProgressListener,
): Promise<ArrayBuffer> {
  const task = getDownloadTask(url);

  if (onProgress) {
    task.listeners.add(onProgress);
    onProgress(task.loaded, task.total);
  }

  try {
    return await task.promise;
  } finally {
    if (onProgress) task.listeners.delete(onProgress);
  }
}

export function releaseModelFile(url: string): void {
  downloadTasks.delete(url);
}

function getDownloadTask(url: string): DownloadTask {
  const existingTask = downloadTasks.get(url);
  if (existingTask) return existingTask;

  const listeners = new Set<ProgressListener>();
  const task: DownloadTask = {
    listeners,
    loaded: 0,
    total: 0,
    promise: Promise.resolve(new ArrayBuffer(0)),
  };

  task.promise = downloadModel(url, (loaded, total) => {
    task.loaded = loaded;
    task.total = total;
    task.listeners.forEach((listener) => listener(loaded, total));
  }).catch((error: unknown) => {
    downloadTasks.delete(url);
    throw error;
  });

  downloadTasks.set(url, task);
  return task;
}

async function downloadModel(
  url: string,
  onProgress: ProgressListener,
): Promise<ArrayBuffer> {
  const total = await getModelSize(url);

  if (total > downloadChunkSize) {
    return downloadModelInChunks(url, total, onProgress);
  }

  const response = await fetch(url, { cache: 'force-cache' });
  if (!response.ok) {
    throw new Error(`模型下载失败：${response.status}`);
  }

  const responseTotal = Number(response.headers.get('content-length')) || total;
  if (!response.body) {
    const buffer = await response.arrayBuffer();
    onProgress(buffer.byteLength, buffer.byteLength);
    return buffer;
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let loaded = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.byteLength;
    onProgress(loaded, responseTotal);
  }

  const merged = new Uint8Array(loaded);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }

  onProgress(loaded, responseTotal || loaded);
  return merged.buffer;
}

async function getModelSize(url: string): Promise<number> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      cache: 'force-cache',
    });
    if (!response.ok) return 0;
    return Number(response.headers.get('content-length')) || 0;
  } catch {
    return 0;
  }
}

async function downloadModelInChunks(
  url: string,
  total: number,
  onProgress: ProgressListener,
): Promise<ArrayBuffer> {
  const merged = new Uint8Array(total);
  let loaded = 0;

  for (let start = 0; start < total; start += downloadChunkSize) {
    const end = Math.min(start + downloadChunkSize - 1, total - 1);
    const chunk = await downloadChunk(url, start, end);

    // 如果存储服务忽略 Range 并直接返回完整文件，也可以正常使用。
    if (chunk.byteLength === total && start === 0) {
      onProgress(total, total);
      const fullFile = new ArrayBuffer(total);
      new Uint8Array(fullFile).set(chunk);
      return fullFile;
    }

    const expectedLength = end - start + 1;
    if (chunk.byteLength !== expectedLength) {
      throw new Error(`模型分块大小异常：${chunk.byteLength}/${expectedLength}`);
    }

    merged.set(chunk, start);
    loaded += chunk.byteLength;
    onProgress(loaded, total);
  }

  return merged.buffer;
}

async function downloadChunk(url: string, start: number, end: number): Promise<Uint8Array> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxChunkAttempts; attempt++) {
    try {
      const response = await fetch(url, {
        cache: 'force-cache',
        headers: { Range: `bytes=${start}-${end}` },
      });

      if (!response.ok) {
        throw new Error(`模型分块下载失败：${response.status}`);
      }

      return new Uint8Array(await response.arrayBuffer());
    } catch (error: unknown) {
      lastError = error;
      if (attempt < maxChunkAttempts) {
        await wait(attempt * 1000);
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error('模型分块下载失败');
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => globalThis.setTimeout(resolve, milliseconds));
}
