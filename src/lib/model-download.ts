type ProgressListener = (loaded: number, total: number) => void;

interface DownloadTask {
  promise: Promise<ArrayBuffer>;
  listeners: Set<ProgressListener>;
  loaded: number;
  total: number;
}

const downloadTasks = new Map<string, DownloadTask>();

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
  const response = await fetch(url, { cache: 'force-cache' });
  if (!response.ok) {
    throw new Error(`模型下载失败：${response.status}`);
  }

  const total = Number(response.headers.get('content-length')) || 0;
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
    onProgress(loaded, total);
  }

  const merged = new Uint8Array(loaded);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }

  onProgress(loaded, total || loaded);
  return merged.buffer;
}
