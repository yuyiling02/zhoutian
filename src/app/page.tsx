'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArtworkCard } from '@/components/ArtworkCard';
import { CreativeWorkCard } from '@/components/CreativeWorkCard';
import { MuseumHeader } from '@/components/MuseumHeader';
import { ZoneIcon } from '@/components/ZoneIcon';
import { Input } from '@/components/ui/input';
import { fetchPublicArtworks } from '@/lib/artworks-api';
import { fetchCreativeWorks } from '@/lib/creative-works';
import type { ArtworkConfig, CreativeWork } from '@/lib/types';
import { getZoneDefinition, zoneDefinitions, type ExhibitionZone } from '@/lib/zones';
import { ArrowDown, ChevronRight, ImageIcon, LoaderCircle, Search, Sparkles, X } from 'lucide-react';

export default function Home() {
  const [activeZone, setActiveZone] = useState<ExhibitionZone>('3d');
  const [query, setQuery] = useState('');
  const [artworks, setArtworks] = useState<ArtworkConfig>([]);
  const [creativeWorks, setCreativeWorks] = useState<CreativeWork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([fetchPublicArtworks(), fetchCreativeWorks()]).then((results) => {
      if (cancelled) return;
      if (results[0].status === 'fulfilled') setArtworks(results[0].value);
      if (results[1].status === 'fulfilled') setCreativeWorks(results[1].value);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const normalizedQuery = query.trim().toLocaleLowerCase('zh-CN');
  const activeDefinition = getZoneDefinition(activeZone);
  const filtered3D = useMemo(
    () => artworks.filter((artwork) => `${artwork.title} ${artwork.author}`.toLocaleLowerCase('zh-CN').includes(normalizedQuery)),
    [artworks, normalizedQuery],
  );
  const filteredCreative = useMemo(
    () => creativeWorks.filter((work) => work.category === activeZone && `${work.title} ${work.author}`.toLocaleLowerCase('zh-CN').includes(normalizedQuery)),
    [creativeWorks, activeZone, normalizedQuery],
  );

  const countFor = (zone: ExhibitionZone) => zone === '3d'
    ? artworks.length
    : creativeWorks.filter((work) => work.category === zone).length;

  const selectZone = (zone: ExhibitionZone) => {
    setActiveZone(zone);
    setQuery('');
    globalThis.setTimeout(() => document.getElementById('gallery')?.scrollIntoView({ block: 'start' }), 0);
  };

  return (
    <div className="museum-grid min-h-screen overflow-hidden text-slate-950">
      <MuseumHeader />

      <main>
        <section className="scan-accent relative mx-auto max-w-7xl px-4 pb-12 pt-14 sm:px-6 sm:pb-16 sm:pt-20 lg:px-8 lg:pt-24">
          <div className="pointer-events-none absolute right-[-7rem] top-10 size-72 rounded-full border-[48px] border-[#E9EEFF]/65 shadow-[0_0_80px_rgba(78,107,255,.2)] sm:size-96" />
          <span className="pointer-events-none absolute left-5 top-7 font-mono text-[9px] font-bold tracking-[.16em] text-[#4E6BFF]/55 sm:left-7">N 31.2304° · E 121.4737°</span>
          <div className="relative grid items-end gap-10 lg:grid-cols-[1.28fr_.72fr]">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/80 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600 shadow-sm">
                <span className="size-2 rounded-full bg-[#4E6BFF]" />
                DIGITAL CREATIVE GALLERY · 2026
              </div>
              <h1 className="max-w-4xl text-5xl font-black leading-[.98] tracking-[-0.06em] sm:text-7xl lg:text-[5.7rem]">
                数创艺境
                <span className="mt-3 block text-xl font-bold tracking-[.18em] text-slate-500 sm:text-2xl lg:text-3xl">数智课堂创意作品平台</span>
              </h1>
            </div>
            <div className="relative pb-1 lg:pb-3">
              <p className="max-w-xl text-base font-medium leading-8 text-slate-600 sm:text-lg">
                让绘画在数字空间中立体生长，让文字与纸张成为想象力的新入口。每一件作品，都是孩子对未来独一无二的回答。
              </p>
              <a href="#zones" className="mt-7 inline-flex items-center gap-3 text-sm font-black text-slate-900">
                选择一个展区
                <span className="grid size-9 place-items-center rounded-full bg-slate-950 text-white"><ArrowDown className="size-4" /></span>
              </a>
            </div>
          </div>
        </section>

        <section id="zones" className="relative mx-auto grid max-w-7xl scroll-mt-24 gap-4 px-4 pb-16 sm:px-6 md:grid-cols-3 lg:px-8">
          {zoneDefinitions.map((zone) => {
            const active = zone.id === activeZone;
            return (
              <button
                key={zone.id}
                type="button"
                onClick={() => selectZone(zone.id)}
                className={`tech-panel group relative min-h-64 overflow-hidden rounded-[2rem] border p-6 text-left outline-none transition duration-300 sm:min-h-72
                  ${active ? '-translate-y-1 shadow-[0_24px_70px_rgba(15,23,42,.18)]' : 'border-slate-900/8 bg-white/80 hover:-translate-y-1 hover:border-slate-900/15 hover:bg-white'}
                  focus-visible:ring-4 focus-visible:ring-slate-950/15`}
                style={active ? { backgroundColor: zone.color, color: zone.foreground, borderColor: zone.color } : undefined}
                aria-pressed={active}
              >
                <span className={`absolute right-5 top-3 font-mono text-6xl font-black tracking-[-0.08em] ${active ? 'opacity-15' : 'text-slate-950 opacity-[.045]'}`}>{zone.number}</span>
                <span
                  className="mb-11 grid size-14 place-items-center rounded-2xl transition duration-300 group-hover:-translate-y-1 group-hover:rotate-[-3deg]"
                  style={{ backgroundColor: active ? 'rgba(255,255,255,.18)' : zone.softColor, color: active ? zone.foreground : zone.color }}
                >
                  <ZoneIcon name={zone.icon} className="size-7" />
                </span>
                <p className={`font-mono text-[10px] font-black uppercase tracking-[0.18em] ${active ? 'opacity-70' : 'text-slate-500'}`}>{zone.eyebrow}</p>
                <h2 className="mt-3 text-2xl font-black tracking-[-0.035em] sm:text-3xl">{zone.title}</h2>
                <p className={`mt-3 max-w-sm text-sm font-medium leading-6 ${active ? 'opacity-75' : 'text-slate-600'}`}>{zone.description}</p>
                <div className="absolute bottom-5 right-5 flex items-center gap-2 text-xs font-black">
                  {countFor(zone.id)} 件作品
                  <ChevronRight className="size-4 transition group-hover:translate-x-1" />
                </div>
              </button>
            );
          })}
        </section>

        <section id="gallery" className="scroll-mt-20 border-t border-[#4E6BFF]/10 bg-white/65">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
              <div>
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-2xl" style={{ backgroundColor: activeDefinition.softColor, color: activeDefinition.color }}>
                    <ZoneIcon name={activeDefinition.icon} className="size-5" />
                  </span>
                  <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: activeDefinition.color }}>{activeDefinition.eyebrow}</p>
                </div>
                <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] sm:text-5xl">{activeDefinition.title}</h2>
                <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-slate-600 sm:text-base">{activeDefinition.description}</p>
              </div>
              <div className="relative w-full md:max-w-sm">
                <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索作品名称或作者" className="h-14 rounded-full border-slate-900/10 bg-white pl-12 pr-11 shadow-sm focus-visible:ring-slate-900/10" />
                {query && <button type="button" onClick={() => setQuery('')} className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full hover:bg-slate-100" aria-label="清除搜索"><X className="size-4" /></button>}
              </div>
            </div>

            {loading ? (
              <div className="grid min-h-80 place-items-center"><div className="text-center text-slate-500"><LoaderCircle className="mx-auto mb-3 size-8 animate-spin" />正在布置展厅…</div></div>
            ) : activeZone === '3d' ? (
              filtered3D.length > 0 ? (
                <div className="mt-11 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered3D.map((artwork, index) => <Link key={artwork.id} href={`/artwork?id=${artwork.id}`} prefetch={false} className="rounded-[1.75rem] outline-none focus-visible:ring-4 focus-visible:ring-[#4E6BFF]/25"><ArtworkCard artwork={artwork} priority={index === 0} /></Link>)}
                </div>
              ) : <EmptyGallery query={query} />
            ) : filteredCreative.length > 0 ? (
              <div className="mt-11 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCreative.map((work, index) => <CreativeWorkCard key={work.id} work={work} priority={index === 0} />)}
              </div>
            ) : <EmptyGallery query={query} />}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-slate-950 px-4 py-9 text-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3"><Sparkles className="size-5 text-[#4E6BFF]" /><div><p className="font-black">数创艺境</p><p className="mt-0.5 text-xs text-white/45">数智课堂创意作品平台</p></div></div>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/45">Make · Imagine · Share</p>
        </div>
      </footer>
    </div>
  );
}

function EmptyGallery({ query }: { query: string }) {
  return (
    <div className="mt-11 grid min-h-80 place-items-center rounded-[2rem] border border-dashed border-slate-900/15 bg-white/60 px-6 text-center">
      <div><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-slate-100 text-slate-500"><ImageIcon className="size-6" /></span><h3 className="mt-4 text-xl font-black">{query ? '没有找到相关作品' : '这个展区正在布展'}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{query ? '换一个作者名或作品名试试看。' : '进入管理中心上传作品后，这里会自动更新。'}</p></div>
    </div>
  );
}
