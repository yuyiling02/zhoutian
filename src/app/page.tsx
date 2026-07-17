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
        <section className="scan-accent relative mx-auto max-w-7xl px-4 pb-8 pt-8 sm:px-6 sm:pb-12 sm:pt-12 lg:px-8">
          <div className="tech-panel relative overflow-hidden rounded-[2.25rem] px-6 py-10 sm:px-10 sm:py-14 lg:min-h-[520px] lg:px-14 lg:py-16">
            <span className="pointer-events-none absolute left-6 top-5 font-mono text-[9px] font-bold tracking-[.16em] text-[#4E6BFF]/55 sm:left-10">N 31.2304° · E 121.4737°</span>
            <span className="pointer-events-none absolute right-7 top-5 font-mono text-[9px] font-bold tracking-[.16em] text-[#4E6BFF]/45">EXHIBITION · 001</span>
            <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1.05fr_.95fr]">
              <div className="pt-5">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#4E6BFF]/15 bg-white/80 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600 shadow-sm">
                  <span className="size-2 rounded-full bg-[#4E6BFF] shadow-[0_0_10px_#4E6BFF]" />
                  DIGITAL CREATIVE GALLERY · 2026
                </div>
                <h1 className="max-w-4xl text-5xl font-black leading-[.98] tracking-[-0.06em] sm:text-7xl lg:text-[5.8rem]">数创艺境</h1>
                <p className="mt-5 text-lg font-black tracking-[.16em] text-slate-600 sm:text-2xl">数智课堂创意作品平台</p>
                <p className="mt-7 max-w-xl text-sm font-medium leading-7 text-slate-500 sm:text-base">
                  让绘画在数字空间中立体生长，让文字与纸张成为想象力的新入口。
                </p>
                <a href="#zones" className="mt-7 inline-flex items-center gap-3 text-sm font-black text-slate-900">
                  选择一个展区
                  <span className="grid size-9 place-items-center rounded-full bg-slate-950 text-white"><ArrowDown className="size-4" /></span>
                </a>
              </div>
              <HeroArtifact />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-5 sm:px-6 lg:px-8">
          <div className="relative mx-auto max-w-3xl">
            <Search className="absolute left-5 top-1/2 z-10 size-5 -translate-y-1/2 text-slate-400" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索作品名称、作者或关键词" className="h-15 rounded-[1.4rem] border-[#4E6BFF]/15 bg-white/90 pl-13 pr-12 text-base shadow-[0_14px_40px_rgba(78,107,255,.08)] focus-visible:ring-[#4E6BFF]/15" />
            {query && <button type="button" onClick={() => setQuery('')} className="absolute right-4 top-1/2 z-10 grid size-8 -translate-y-1/2 place-items-center rounded-full hover:bg-slate-100" aria-label="清除搜索"><X className="size-4" /></button>}
          </div>
        </section>

        <section id="zones" className="relative mx-auto grid max-w-7xl scroll-mt-24 gap-4 px-4 pb-14 sm:px-6 md:grid-cols-3 lg:px-8">
          {zoneDefinitions.map((zone) => {
            const active = zone.id === activeZone;
            return (
              <button
                key={zone.id}
                type="button"
                onClick={() => selectZone(zone.id)}
                className={`tech-panel group relative min-h-56 overflow-hidden rounded-[2rem] border bg-white/85 p-6 text-left outline-none transition duration-300 sm:min-h-64
                  ${active ? '-translate-y-1 shadow-[0_20px_55px_rgba(78,107,255,.13)]' : 'hover:-translate-y-1 hover:bg-white'}
                  focus-visible:ring-4 focus-visible:ring-slate-950/15`}
                style={active ? { borderColor: zone.color, boxShadow: `0 20px 55px ${zone.color}24, inset 0 0 0 1px ${zone.color}12` } : undefined}
                aria-pressed={active}
              >
                <span className="absolute right-5 top-4 font-mono text-5xl font-black tracking-[-0.08em] opacity-15" style={{ color: zone.color }}>{zone.number}</span>
                <span
                  className="mb-9 grid size-14 place-items-center rounded-2xl transition duration-300 group-hover:-translate-y-1 group-hover:rotate-[-3deg]"
                  style={{ backgroundColor: zone.softColor, color: zone.color, boxShadow: active ? `0 0 24px ${zone.color}30` : undefined }}
                >
                  <ZoneIcon name={zone.icon} className="size-7" />
                </span>
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{zone.eyebrow}</p>
                <h2 className="mt-3 text-2xl font-black tracking-[-0.035em] text-slate-950 sm:text-3xl">{zone.title}</h2>
                <p className="mt-3 max-w-sm text-sm font-medium leading-6 text-slate-600">{zone.description}</p>
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
              <p className="font-mono text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">COLLECTION · {String(activeZone === '3d' ? filtered3D.length : filteredCreative.length).padStart(3, '0')}</p>
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

function HeroArtifact() {
  return (
    <div className="relative mx-auto grid min-h-72 w-full max-w-lg place-items-center sm:min-h-96 lg:min-h-[430px]">
      <div className="absolute inset-x-[8%] bottom-[5%] h-18 rounded-[50%] border border-[#4E6BFF]/15 bg-white/80 shadow-[0_12px_35px_rgba(78,107,255,.18),0_0_55px_rgba(78,107,255,.16)]" />
      <div className="absolute inset-x-[18%] bottom-[11%] h-12 rounded-[50%] border border-[#4E6BFF]/25 bg-[#E9EEFF]/80 shadow-[inset_0_0_20px_rgba(78,107,255,.16)]" />
      <div className="hero-cube relative z-10 size-48 sm:size-64">
        <span className="hero-cube-face hero-cube-front" />
        <span className="hero-cube-face hero-cube-back" />
        <span className="hero-cube-core" />
      </div>
      <span className="absolute right-[8%] top-[8%] size-9 rotate-12 rounded-lg border border-[#4E6BFF]/30 bg-[#BFD0FF]/35 shadow-[0_0_22px_rgba(78,107,255,.2)]" />
      <span className="absolute left-[8%] top-[47%] size-6 -rotate-12 rounded-md border border-[#4E6BFF]/25 bg-white/70" />
      <span className="absolute right-[5%] top-[34%] font-mono text-[9px] leading-8 text-[#4E6BFF]/55">00<br /><strong className="text-[#4E6BFF]">01</strong><br />02<br />03</span>
    </div>
  );
}
