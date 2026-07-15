import type { ArtworkConfig } from '@/lib/types';

export const artworkOrderFilePath = 'settings/artwork-order.json';

const artworkOrderUrl =
  'https://wqpmslbgntcifjzksbxl.supabase.co/storage/v1/object/public/artworks/settings/artwork-order.json';

export async function fetchArtworkOrder(): Promise<number[]> {
  try {
    const response = await fetch(`${artworkOrderUrl}?v=${Date.now()}`, {
      cache: 'no-store',
    });

    if (!response.ok) return [];

    const value: unknown = await response.json();
    if (!Array.isArray(value)) return [];

    return value.filter(
      (id): id is number => typeof id === 'number' && Number.isInteger(id),
    );
  } catch {
    return [];
  }
}

export function sortArtworksByOrder(
  artworks: ArtworkConfig,
  order: number[],
): ArtworkConfig {
  if (order.length === 0) return artworks;

  const positions = new Map(order.map((id, index) => [id, index]));
  return [...artworks].sort((left, right) => {
    const leftPosition = positions.get(left.id);
    const rightPosition = positions.get(right.id);

    if (leftPosition === undefined && rightPosition === undefined) {
      return left.id - right.id;
    }
    if (leftPosition === undefined) return 1;
    if (rightPosition === undefined) return -1;
    return leftPosition - rightPosition;
  });
}
