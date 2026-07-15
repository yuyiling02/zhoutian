import { createClient } from '@supabase/supabase-js';
import { artworkOrderFilePath, fetchArtworkOrder, sortArtworksByOrder } from './artwork-order';

const supabaseProjectId = 'wqpmslbgntcifjzksbxl';
const supabaseUrl = `https://${supabaseProjectId}.supabase.co`;
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxcG1zbGJnbnRjaWZqemtzYnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMjI5ODksImV4cCI6MjA5OTU5ODk4OX0.NDW-I0AEWaUVS8um8bBsPr7LrWu8m-msxRLpZsDx720';
const resumableUploadThreshold = 6 * 1024 * 1024;
const resumableChunkSize = 6 * 1024 * 1024;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface ArtworkRow {
  id: number;
  title: string;
  author: string | null;
  model_file: string;
  thumbnail: string | null;
}

/** 从 Supabase 获取所有作品 */
export async function fetchArtworks() {
  const { data, error } = await supabase
    .from('artworks')
    .select('*')
    .order('id', { ascending: true });

  if (error) throw error;
  const artworks = data.map(mapArtwork);
  const order = await fetchArtworkOrder();
  return sortArtworksByOrder(artworks, order);
}

/** 保存首页与管理页共用的作品展示顺序 */
export async function saveArtworkOrder(ids: number[]): Promise<void> {
  const file = new Blob([JSON.stringify(ids)], { type: 'application/json' });
  const { error: removeError } = await supabase.storage
    .from('artworks')
    .remove([artworkOrderFilePath]);

  if (removeError) throw removeError;

  const { error } = await supabase.storage
    .from('artworks')
    .upload(artworkOrderFilePath, file, {
      cacheControl: '0',
      contentType: 'application/json',
      upsert: false,
    });

  if (error) throw error;
}

/** 从 Supabase 获取单个作品 */
export async function fetchArtworkById(id: number) {
  const { data, error } = await supabase
    .from('artworks')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return mapArtwork(data);
}

/** 添加作品 */
export async function addArtwork(artwork: {
  title: string;
  author: string;
  modelFile: string;
  thumbnail: string;
}) {
  const { data, error } = await supabase
    .from('artworks')
    .insert({
      title: artwork.title,
      author: artwork.author,
      model_file: artwork.modelFile,
      thumbnail: artwork.thumbnail,
    })
    .select()
    .single();

  if (error) throw error;
  return mapArtwork(data);
}

/** 更新作品 */
export async function updateArtwork(
  id: number,
  artwork: {
    title?: string;
    author?: string;
    modelFile?: string;
    thumbnail?: string;
  },
) {
  const { data, error } = await supabase
    .from('artworks')
    .update({
      title: artwork.title,
      author: artwork.author,
      model_file: artwork.modelFile,
      thumbnail: artwork.thumbnail,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapArtwork(data);
}

/** 删除作品 */
export async function deleteArtwork(id: number) {
  const { data, error } = await supabase
    .from('artworks')
    .delete()
    .eq('id', id)
    .select('id');
  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error('数据库没有删除任何记录，请检查删除权限');
  }
}

/** 上传文件到 Supabase Storage，返回公开 URL */
export async function uploadFile(
  file: File,
  folder: 'models' | 'thumbnails',
  onProgress?: (bytesUploaded: number, bytesTotal: number) => void,
): Promise<string> {
  const extension = file.name.split('.').pop() || '';
  const uniqueId = globalThis.crypto.randomUUID();
  const safeFileName = `${Date.now()}-${uniqueId}.${extension}`;
  const fileName = `${folder}/${safeFileName}`;

  onProgress?.(0, file.size);

  if (file.size > resumableUploadThreshold) {
    await uploadLargeFile(file, fileName, onProgress);
  } else {
    const { error: uploadError } = await supabase.storage
      .from('artworks')
      .upload(fileName, file, {
        cacheControl: '3600',
        contentType: file.type || undefined,
        upsert: false,
      });

    if (uploadError) throw uploadError;
    onProgress?.(file.size, file.size);
  }

  const { data: publicUrl } = supabase.storage
    .from('artworks')
    .getPublicUrl(fileName);

  return publicUrl.publicUrl;
}

async function uploadLargeFile(
  file: File,
  fileName: string,
  onProgress?: (bytesUploaded: number, bytesTotal: number) => void,
): Promise<void> {
  const { Upload } = await import('tus-js-client');
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token ?? supabaseAnonKey;

  await new Promise<void>((resolve, reject) => {
    const upload = new Upload(file, {
      endpoint: `https://${supabaseProjectId}.storage.supabase.co/storage/v1/upload/resumable`,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        apikey: supabaseAnonKey,
        authorization: `Bearer ${accessToken}`,
      },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      chunkSize: resumableChunkSize,
      metadata: {
        bucketName: 'artworks',
        objectName: fileName,
        contentType: file.type || 'model/gltf-binary',
        cacheControl: '3600',
      },
      onProgress,
      onError: reject,
      onSuccess: () => resolve(),
    });

    upload.start();
  });
}

/** 删除 Storage 文件 */
export async function deleteStorageFile(url: string) {
  // 从公开 URL 中提取文件路径
  const prefix = `${supabaseUrl}/storage/v1/object/public/artworks/`;
  if (!url.startsWith(prefix)) return;
  const filePath = url.slice(prefix.length);
  const { error } = await supabase.storage.from('artworks').remove([filePath]);
  if (error) throw error;
}

// 数据库行 → Artwork 类型映射
function mapArtwork(data: ArtworkRow): import('./types').Artwork {
  return {
    id: data.id,
    title: data.title,
    author: data.author || '未知作者',
    modelFile: data.model_file,
    thumbnail: data.thumbnail || '',
  };
}
