'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { CreativeWork } from '@/lib/types';
import { fetchCreativeWorks } from '@/lib/creative-works';
import { getZoneDefinition } from '@/lib/zones';
import { ZoneIcon } from '@/components/ZoneIcon';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, ImageOff, LoaderCircle, Share2 } from 'lucide-react';

export default function CreativeDetailClient() {
  const [work, setWork] = useState<CreativeWork>();
  const [loading, setLoading] = useState(true);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('id');
    let cancelled = false;
    fetchCreativeWorks()
      .then((items) => { if (!cancelled) setWork(items.find((item) => item.id === id)); })
      .catch(() => undefined)
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <CreativeState loading label="正在打开作品…" />;
  if (!work) return <CreativeState label="这件作品暂时找不到" />;

  const zone = getZoneDefinition(work.category);
  const zoneStyle = { '--zone': zone.color, '--zone-soft': zone.softColor } as CSSProperties;
  const title = work.title.trim();
  const author = work.author.trim();
  const primaryLabel = title || author;
  const share = async () => {
    const url = window.location.href;
    const shareTitle = [author, title].filter(Boolean).join(' · ') || `${zone.title}作品`;
    if (navigator.share) {
      try { await navigator.share({ title: shareTitle, text: `看看数创艺境的${zone.title}作品`, url }); return; } catch { return; }
    }
    await navigator.clipboard.writeText(url);
    setShared(true);
    window.setTimeout(() => setShared(false), 1800);
  };

  return (
    <div className="museum-grid min-h-screen text-[#172033]" style={zoneStyle}>
      <header className="museum-glass sticky top-0 z-40 border-b border-slate-900/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="soft-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black"><ArrowLeft className="size-4" />返回展厅</Link>
          <span className="hidden items-center gap-2 text-[10px] font-black uppercase tracking-[.16em] sm:flex" style={{ color: zone.color }}><ZoneIcon name={zone.icon} className="size-4" />Creative artwork</span>
          <Button variant="outline" onClick={share} className="soft-button rounded-full">{shared ? <Check className="mr-2 size-4 text-emerald-600" /> : <Share2 className="mr-2 size-4" />}{shared ? '已复制' : '分享'}</Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-7">
          <div className="zone-pill mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black"><ZoneIcon name={zone.icon} className="size-4" />{zone.title}</div>
          {primaryLabel && <h1 className="text-4xl font-black tracking-[-.055em] sm:text-6xl">{primaryLabel}</h1>}
          {title && author && <p className="mt-3 text-base font-medium text-slate-500">创作者 · <span className="font-black text-[#172033]">{author}</span></p>}
        </div>

        <section className="detail-stage relative overflow-hidden rounded-[2rem] p-2 sm:p-4">
          <div className="relative min-h-[60vh] w-full overflow-hidden rounded-[1.5rem]" style={{ backgroundColor: zone.softColor }}><Image src={work.imageUrl} alt={title || (author ? `${author}的作品` : '作品图片')} fill priority sizes="100vw" className="object-contain" /></div>
          <span className="absolute bottom-5 left-5 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.13em] shadow-sm backdrop-blur" style={{ color: zone.color }}>Original work · {zone.number}</span>
        </section>

        {primaryLabel && <section className={`mt-7 grid gap-4 ${title && author ? 'sm:grid-cols-2' : ''}`}>
          <div className="museum-panel p-6"><p className="text-[10px] font-black uppercase tracking-[.16em]" style={{ color: zone.color }}>{title ? 'The artwork' : 'The creator'}</p><h2 className="mt-3 text-2xl font-black">{primaryLabel}</h2><p className="mt-2 text-sm text-slate-500">{title ? `${zone.title} · 图片作品` : '数创艺境参展创作者'}</p></div>
          {title && author && <div className="museum-panel p-6"><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#3C5CFF]">The creator</p><h2 className="mt-3 text-2xl font-black">{author}</h2><p className="mt-2 text-sm text-slate-500">数创艺境参展创作者</p></div>}
        </section>}
      </main>
    </div>
  );
}

function CreativeState({ label, loading = false }: { label: string; loading?: boolean }) {
  return <div className="museum-grid grid min-h-screen place-items-center px-5 text-center"><div><span className="mx-auto grid size-16 place-items-center rounded-3xl bg-[#FFE5ED] text-[#E83E6F] shadow-[6px_6px_0_rgba(232,62,111,.14)]">{loading ? <LoaderCircle className="size-7 animate-spin" /> : <ImageOff className="size-7" />}</span><h1 className="mt-5 text-2xl font-black">{label}</h1>{!loading && <Link href="/" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#172033] px-5 py-3 text-sm font-black text-white"><ArrowLeft className="size-4" />返回展厅</Link>}</div></div>;
}
