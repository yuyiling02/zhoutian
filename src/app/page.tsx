'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
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
import { ArrowDown, ArrowUpRight, ImageIcon, LoaderCircle, Search, Sparkles, X } from 'lucide-react';

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
    <div className="museum-grid min-h-screen overflow-hidden text-[#172033]">
      <MuseumHeader />
      <main>
        <section className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 sm:pb-14 sm:pt-10 lg:px-8">
          <div className="museum-panel relative overflow-hidden px-6 py-9 sm:px-10 sm:py-12 lg:min-h-[500px] lg:px-14 lg:py-14">
            <div className="absolute right-6 top-5 flex items-center gap-2 text-[10px] font-black tracking-[.16em] text-slate-400">
              <span className="size-2 rounded-full bg-[#4DBE83]" />OPEN FOR IDEAS
            </div>
            <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1.08fr_.92fr]">
              <div className="pt-5">
                <p className="section-label text-[#3C5CFF]">数字创意展 · 2026</p>
                <h1 className="mt-7 max-w-3xl text-5xl font-black leading-[.96] tracking-[-0.065em] sm:text-7xl lg:text-[5.7rem]">
                  数创艺境
                  <span className="mt-3 block text-[.34em] leading-tight tracking-[.12em] text-slate-500">数智课堂创意作品平台</span>
                </h1>
                <p className="mt-7 max-w-xl text-base font-medium leading-8 text-slate-600 sm:text-lg">
                  把画、文字和纸张放进数字空间。每一件作品，都保留孩子独有的手感与想象。
                </p>
                <a href="#zones" className="soft-button mt-8 inline-flex items-center gap-3 rounded-full px-5 py-3 text-sm font-black">
                  选择创意分区 <ArrowDown className="size-4" />
                </a>
              </div>
              <HeroPlayground />
            </div>
          </div>
        </section>

        <section id="zones" className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-14 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div><p className="section-label">Three creative rooms</p><h2 className="mt-3 text-3xl font-black tracking-[-.045em] sm:text-4xl">从一个喜欢的入口开始</h2></div>
            <p className="max-w-sm text-sm leading-6 text-slate-500">三个分区，三种颜色，也代表三种不同的创作方式。</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {zoneDefinitions.map((zone) => {
              const active = zone.id === activeZone;
              const zoneStyle = { '--zone': zone.color, '--zone-soft': zone.softColor } as CSSProperties;
              return (
                <button key={zone.id} type="button" onClick={() => selectZone(zone.id)} className="zone-card group relative min-h-64 overflow-hidden rounded-[1.8rem] p-6 text-left outline-none focus-visible:ring-4 focus-visible:ring-slate-950/15" style={zoneStyle} aria-pressed={active}>
                  <span className="absolute right-5 top-4 text-6xl font-black tracking-[-.08em] opacity-[.08]">{zone.number}</span>
                  <span className="zone-icon mb-10 grid size-14 place-items-center rounded-2xl"><ZoneIcon name={zone.icon} className="size-7" /></span>
                  <p className="text-[10px] font-black uppercase tracking-[.16em]" style={{ color: zone.color }}>{zone.eyebrow}</p>
                  <h3 className="mt-3 text-2xl font-black tracking-[-.035em] sm:text-[1.7rem]">{zone.title}</h3>
                  <p className="mt-3 max-w-sm text-sm font-medium leading-6 text-slate-600">{zone.description}</p>
                  <span className="zone-arrow absolute bottom-5 right-5 inline-flex items-center gap-1 text-xs font-black">{countFor(zone.id)} 件作品 <ArrowUpRight className="size-4" /></span>
                </button>
              );
            })}
          </div>
        </section>

        <section id="gallery" className="scroll-mt-20 border-y border-slate-900/10 bg-[#FFFDF8]/90">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8" style={{ '--zone': activeDefinition.color, '--zone-soft': activeDefinition.softColor } as CSSProperties}>
            <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <div className="flex items-center gap-3">
                  <span className="zone-pill grid size-11 place-items-center rounded-2xl"><ZoneIcon name={activeDefinition.icon} className="size-5" /></span>
                  <p className="text-[10px] font-black uppercase tracking-[.18em]" style={{ color: activeDefinition.color }}>{activeDefinition.eyebrow}</p>
                </div>
                <h2 className="mt-4 text-4xl font-black tracking-[-.055em] sm:text-5xl">{activeDefinition.title}</h2>
                <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-slate-600 sm:text-base">{activeDefinition.description}</p>
              </div>
              <div className="relative w-full lg:w-80">
                <Search className="absolute left-4 top-1/2 z-10 size-4 -translate-y-1/2 text-slate-400" />
                <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索作品或作者" className="h-12 rounded-full border-slate-900/12 bg-white pl-11 pr-11 shadow-none focus-visible:ring-2" />
                {query && <button type="button" onClick={() => setQuery('')} className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full hover:bg-slate-100" aria-label="清除搜索"><X className="size-4" /></button>}
              </div>
            </div>

            {loading ? (
              <div className="grid min-h-80 place-items-center text-center text-slate-500"><div><LoaderCircle className="mx-auto mb-3 size-8 animate-spin" />正在布置展厅…</div></div>
            ) : activeZone === '3d' ? (
              filtered3D.length > 0 ? <div className="mt-11 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">{filtered3D.map((artwork, index) => <Link key={artwork.id} href={`/artwork?id=${artwork.id}`} prefetch={false} className="rounded-[1.75rem] outline-none focus-visible:ring-4" style={{ '--tw-ring-color': `${activeDefinition.color}35` } as CSSProperties}><ArtworkCard artwork={artwork} priority={index === 0} /></Link>)}</div> : <EmptyGallery query={query} />
            ) : filteredCreative.length > 0 ? (
              <div className="mt-11 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">{filteredCreative.map((work, index) => <CreativeWorkCard key={work.id} work={work} priority={index === 0} />)}</div>
            ) : <EmptyGallery query={query} />}
          </div>
        </section>
      </main>

      <footer className="bg-[#172033] px-4 py-9 text-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-2xl bg-[#FFD769] text-[#172033]"><Sparkles className="size-5" /></span><div><p className="font-black">数创艺境</p><p className="mt-0.5 text-xs text-white/50">让每一种想象，都有自己的形状</p></div></div>
          <p className="text-[10px] font-black uppercase tracking-[.18em] text-white/45">Make · Imagine · Share</p>
        </div>
      </footer>
    </div>
  );
}

function HeroPlayground() {
  return (
    <div className="playground mx-auto min-h-80 w-full max-w-lg sm:min-h-[410px]">
      <div className="play-tile left-[10%] top-[18%] size-28 bg-[#3C5CFF] text-white sm:size-36"><ZoneIcon name="paint-space" className="size-12 sm:size-16" /></div>
      <div className="play-tile right-[8%] top-[9%] size-24 bg-[#FFF0D8] text-[#E88722] sm:size-32"><ZoneIcon name="poetry" className="size-10 sm:size-14" /></div>
      <div className="play-tile bottom-[8%] right-[24%] size-24 bg-[#FFE5ED] text-[#E83E6F] sm:size-32"><ZoneIcon name="scissors" className="size-10 sm:size-14" /></div>
      <span className="absolute bottom-[19%] left-[5%] rounded-full border border-slate-900/15 bg-white px-3 py-1.5 text-[10px] font-black tracking-[.12em] text-slate-500">IDEA LAB · 03</span>
    </div>
  );
}

function EmptyGallery({ query }: { query: string }) {
  return (
    <div className="mt-11 grid min-h-72 place-items-center rounded-[1.75rem] border border-dashed border-slate-900/20 bg-[#F7F4EB] px-6 text-center">
      <div><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-white text-slate-500 shadow-sm"><ImageIcon className="size-6" /></span><h3 className="mt-4 text-xl font-black">{query ? '没有找到相关作品' : '这个展区正在布展'}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{query ? '换一个作者名或作品名试试看。' : '进入管理中心上传作品后，这里会自动更新。'}</p></div>
    </div>
  );
}
