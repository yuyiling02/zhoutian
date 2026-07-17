'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { Artwork } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Box, Check, LoaderCircle, RotateCcw, Share2 } from 'lucide-react';
import { fetchPublicArtworkById } from '@/lib/artworks-api';
import { preloadModelFile } from '@/lib/model-download';

const ModelViewer = dynamic(() => import('@/components/ModelViewer').then((value) => value.ModelViewer), {
  ssr: false,
  loading: () => <div className="grid h-full min-h-80 place-items-center bg-[#E9EEFF]"><div className="text-center text-slate-500"><LoaderCircle className="mx-auto mb-3 size-8 animate-spin text-[#4E6BFF]" />正在准备 3D 查看器…</div></div>,
});

export default function ArtworkDetailClient({ artworkId }: { artworkId: number }) {
  const [artwork, setArtwork] = useState<Artwork>();
  const [loading, setLoading] = useState(true);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchPublicArtworkById(artworkId).then((value) => {
      if (cancelled) return;
      setArtwork(value);
      preloadModelFile(value.modelFile).catch(() => undefined);
    }).catch(() => undefined).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [artworkId]);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: `${artwork?.author} · ${artwork?.title}`, text: '看看这件童创艺境的 3D 作品', url }); return; } catch { return; }
    }
    await navigator.clipboard.writeText(url);
    setShared(true);
    window.setTimeout(() => setShared(false), 1800);
  };

  if (loading) return <DetailState label="正在打开作品…" loading />;
  if (!artwork) return <DetailState label="这件作品暂时找不到" />;

  return (
    <div className="museum-grid min-h-screen bg-[#F7F7F4] text-slate-950">
      <header className="museum-glass sticky top-0 z-40 border-b border-slate-900/8">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-black transition hover:bg-slate-950/5"><ArrowLeft className="size-4" />返回展厅</Link>
          <span className="hidden items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[.16em] text-slate-500 sm:flex"><Box className="size-4 text-[#4E6BFF]" />Interactive collection</span>
          <Button variant="outline" onClick={share} className="rounded-full border-slate-900/10 bg-white"><>{shared ? <Check className="mr-2 size-4 text-emerald-600" /> : <Share2 className="mr-2 size-4" />}{shared ? '已复制' : '分享'}</></Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-7 grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
          <div><div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#E9EEFF] px-3 py-1.5 text-xs font-black text-[#4E6BFF]"><Box className="size-4" />绘画立体区</div><h1 className="text-4xl font-black tracking-[-.05em] sm:text-6xl">{artwork.title}</h1><p className="mt-3 text-base font-medium text-slate-500">创作者 · <span className="font-black text-slate-800">{artwork.author}</span></p></div>
          <div className="max-w-sm rounded-2xl border border-slate-900/8 bg-white/80 p-4 text-sm leading-6 text-slate-500 shadow-sm"><strong className="text-slate-900">怎么玩：</strong>拖动旋转，滚轮或双指缩放，右键或双指平移。</div>
        </div>

        <section className="relative aspect-[4/5] min-h-[400px] overflow-hidden rounded-[2rem] border border-slate-900/10 bg-[#E9EEFF] shadow-[0_30px_90px_rgba(39,58,130,.16)] sm:aspect-[4/3] lg:aspect-[16/9]">
          <ModelViewer modelUrl={artwork.modelFile} />
          <Button variant="outline" size="icon" onClick={() => window.location.reload()} aria-label="重新加载模型" className="absolute right-4 top-4 z-20 rounded-full border-white/70 bg-white/85 shadow-sm backdrop-blur"><RotateCcw className="size-4" /></Button>
        </section>

        <section className="mt-7 grid gap-4 sm:grid-cols-2">
          <div className="museum-panel p-6"><p className="font-mono text-[10px] font-black uppercase tracking-[.16em] text-[#4E6BFF]">Artwork</p><h2 className="mt-3 text-2xl font-black">{artwork.title}</h2><p className="mt-2 text-sm text-slate-500">绘画立体区 · 可交互数字作品</p></div>
          <div className="museum-panel p-6"><p className="font-mono text-[10px] font-black uppercase tracking-[.16em] text-[#4E6BFF]">Creator</p><h2 className="mt-3 text-2xl font-black">{artwork.author}</h2><p className="mt-2 text-sm text-slate-500">童创艺境参展创作者</p></div>
        </section>
      </main>
    </div>
  );
}

function DetailState({ label, loading = false }: { label: string; loading?: boolean }) {
  return <div className="museum-grid grid min-h-screen place-items-center bg-[#F7F7F4] px-5 text-center"><div><span className="mx-auto grid size-16 place-items-center rounded-3xl bg-[#E9EEFF] text-[#4E6BFF]">{loading ? <LoaderCircle className="size-7 animate-spin" /> : <Box className="size-7" />}</span><h1 className="mt-5 text-2xl font-black">{label}</h1>{!loading && <Link href="/" className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white"><ArrowLeft className="size-4" />返回展厅</Link>}</div></div>;
}
