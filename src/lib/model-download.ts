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
  // 单次 GET 比多次缓存 Range 请求更适合移动端 Safari。Supabase/CDN 的
  // HEAD 响应有时只报告部分长度，因此直接从实际下载响应读取文件大小。
  // 允许浏览器复用已经完整下载的 GLB；首次仍会从网络获取，重复打开会快很多。
  const response = await fetch(url, { cache: 'default' });
  if (!response.ok) {
    throw new Error(`模型下载失败：${response.status}`);
  }

  const responseTotal = Number(response.headers.get('content-length')) || 0;
  if (!response.body || responseTotal <= 0) {
    const buffer = await response.arrayBuffer();
    onProgress(buffer.byteLength, responseTotal || buffer.byteLength);
    return buffer;
  }

  // 直接写入一个预分配缓冲区，在保留实时进度的同时避免“先存全部分片、
  // 再复制合并”造成的双倍内存峰值。这对 25–36MB 的手机端 GLB 很关键。
  const reader = response.body.getReader();
  const merged = new Uint8Array(responseTotal);
  let loaded = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (loaded + value.byteLength > merged.byteLength) {
      throw new Error('模型文件大小与服务器响应不一致');
    }
    merged.set(value, loaded);
    loaded += value.byteLength;
    onProgress(loaded, responseTotal);
  }

  if (loaded !== responseTotal) {
    throw new Error(`模型下载不完整：${loaded}/${responseTotal}`);
  }

  onProgress(loaded, responseTotal);
  return merged.buffer;
}
