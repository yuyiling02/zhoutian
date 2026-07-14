import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wqpmslbgntcifjzksbxl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxcG1zbGJnbnRjaWZqemtzYnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMjI5ODksImV4cCI6MjA5OTU5ODk4OX0.NDW-I0AEWaUVS8um8bBsPr7LrWu8m-msxRLpZsDx720';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/** 从 Supabase 获取所有作品 */
export async function fetchArtworks() {
  const { data, error } = await supabase
    .from('artworks')
    .select('*')
    .order('id', { ascending: true });

  if (error) throw error;
  return data.map(mapArtwork);
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
  const { error } = await supabase.from('artworks').delete().eq('id', id);
  if (error) throw error;
}

/** 上传文件到 Supabase Storage，返回公开 URL */
export async function uploadFile(
  file: File,
  folder: 'models' | 'thumbnails',
): Promise<string> {
  const extension = file.name.split('.').pop() || '';
  const safeFileName = `${Date.now()}.${extension}`;
  const fileName = `${folder}/${safeFileName}`;
  const { error: uploadError } = await supabase.storage
    .from('artworks')
    .upload(fileName, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data: publicUrl } = supabase.storage
    .from('artworks')
    .getPublicUrl(fileName);

  return publicUrl.publicUrl;
}

/** 删除 Storage 文件 */
export async function deleteStorageFile(url: string) {
  // 从公开 URL 中提取文件路径
  const prefix = `${supabaseUrl}/storage/v1/object/public/artworks/`;
  if (!url.startsWith(prefix)) return;
  const filePath = url.slice(prefix.length);
  await supabase.storage.from('artworks').remove([filePath]);
}

// 数据库行 → Artwork 类型映射
function mapArtwork(data: any): import('./types').Artwork {
  return {
    id: data.id,
    title: data.title,
    author: data.author || '未知作者',
    modelFile: data.model_file,
    thumbnail: data.thumbnail || '',
  };
}
