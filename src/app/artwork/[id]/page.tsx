import { Artwork } from '@/lib/types';
import ArtworkDetailClient from './ArtworkDetailClient';

import config from '@/../public/config.json';

export async function generateStaticParams() {
  // 预生成足够多的 ID（1-50），实际数据由客户端从 Supabase 获取
  const ids = new Set<number>();
  config.forEach((a) => ids.add(a.id));
  for (let i = 1; i <= 50; i++) {
    ids.add(i);
  }
  return Array.from(ids).map((id) => ({ id: id.toString() }));
}

interface ArtworkDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ArtworkDetailPage({ params }: ArtworkDetailPageProps) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  const artwork = config.find((item) => item.id === id) as Artwork;

  return <ArtworkDetailClient initialArtwork={artwork} artworkId={id} />;
}
