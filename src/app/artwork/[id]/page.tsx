import ArtworkDetailClient from './ArtworkDetailClient';

export async function generateStaticParams() {
  // 静态托管需要预生成路由，作品内容始终由客户端从 Supabase 实时获取。
  const ids: number[] = [];
  for (let i = 1; i <= 50; i++) {
    ids.push(i);
  }
  return ids.map((id) => ({ id: id.toString() }));
}

interface ArtworkDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ArtworkDetailPage({ params }: ArtworkDetailPageProps) {
  const { id: idStr } = await params;
  const id = Number(idStr);

  return <ArtworkDetailClient artworkId={id} />;
}
