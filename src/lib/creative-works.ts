import type { CreativeCategory, CreativeWork } from './types';

const creativeWorksUrl =
  'https://wqpmslbgntcifjzksbxl.supabase.co/storage/v1/object/public/artworks/settings/creative-works.json';

export async function fetchCreativeWorks(): Promise<CreativeWork[]> {
  const response = await fetch(`${creativeWorksUrl}?v=${Date.now()}`, { cache: 'no-store' });
  if (response.status === 404) return [];
  if (!response.ok) throw new Error('创意作品加载失败');

  const value: unknown = await response.json();
  if (!Array.isArray(value)) return [];
  return value.filter(isCreativeWork);
}

export function categoryLabel(category: CreativeCategory): string {
  return category === 'collage-poetry' ? '拼贴诗创意区' : '剪纸创意区';
}

function isCreativeWork(value: unknown): value is CreativeWork {
  if (typeof value !== 'object' || value === null) return false;
  const work = value as Record<string, unknown>;
  return (
    typeof work.id === 'string' &&
    (work.category === 'collage-poetry' || work.category === 'paper-cutting') &&
    typeof work.author === 'string' &&
    typeof work.title === 'string' &&
    typeof work.imageUrl === 'string' &&
    typeof work.createdAt === 'string'
  );
}
