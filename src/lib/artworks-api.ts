import type { Artwork, ArtworkConfig } from '@/lib/types';

const supabaseUrl = 'https://wqpmslbgntcifjzksbxl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxcG1zbGJnbnRjaWZqemtzYnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMjI5ODksImV4cCI6MjA5OTU5ODk4OX0.NDW-I0AEWaUVS8um8bBsPr7LrWu8m-msxRLpZsDx720';

interface ArtworkRow {
  id: number;
  title: string;
  author: string | null;
  model_file: string;
  thumbnail: string | null;
}

const requestHeaders = {
  apikey: supabaseAnonKey,
  authorization: `Bearer ${supabaseAnonKey}`,
};

export async function fetchPublicArtworks(): Promise<ArtworkConfig> {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/artworks?select=id,title,author,model_file,thumbnail&order=id.asc`,
    { headers: requestHeaders },
  );

  if (!response.ok) {
    throw new Error('作品列表加载失败');
  }

  const rows: unknown = await response.json();
  if (!Array.isArray(rows)) {
    throw new Error('作品列表格式错误');
  }

  return rows.filter(isArtworkRow).map(mapArtworkRow);
}

export async function fetchPublicArtworkById(id: number): Promise<Artwork> {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/artworks?select=id,title,author,model_file,thumbnail&id=eq.${id}&limit=1`,
    { headers: requestHeaders },
  );

  if (!response.ok) {
    throw new Error('作品加载失败');
  }

  const rows: unknown = await response.json();
  if (!Array.isArray(rows) || !isArtworkRow(rows[0])) {
    throw new Error('作品不存在');
  }

  return mapArtworkRow(rows[0]);
}

function isArtworkRow(value: unknown): value is ArtworkRow {
  if (typeof value !== 'object' || value === null) return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === 'number' &&
    typeof row.title === 'string' &&
    (typeof row.author === 'string' || row.author === null) &&
    typeof row.model_file === 'string' &&
    (typeof row.thumbnail === 'string' || row.thumbnail === null)
  );
}

function mapArtworkRow(row: ArtworkRow): Artwork {
  return {
    id: row.id,
    title: row.title,
    author: row.author || '未知作者',
    modelFile: row.model_file,
    thumbnail: row.thumbnail || '',
  };
}
