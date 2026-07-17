'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArtworkCard } from '@/components/ArtworkCard';
import { CreativeWorkCard } from '@/components/CreativeWorkCard';
import { QRCodeButton } from '@/components/QrcodeButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetchPublicArtworks } from '@/lib/artworks-api';
import { fetchCreativeWorks } from '@/lib/creative-works';
import type { ArtworkConfig, CreativeCategory, CreativeWork } from '@/lib/types';
import {
  Box,
  ChevronRight,
  Image as ImageIcon,
  Layers3,
  LoaderCircle,
  Search,
  Settings,
  Sparkles,
  X,
} from 'lucide-react';

type ExhibitId = '3d' | CreativeCategory;

const exhibits: Array<{
  id: ExhibitId;
  eyebrow: string;
  title: string;
  description: string;
  number: string;
  icon: typeof Box;
  color: string;
  softColor: string;
}> = [
  {
    id: '3d',
    eyebrow: '旋转 · 缩放 · 探索',
    title: '绘画立体区',
    description: '让画面从纸上站起来，用手指探索每一个想象的角落。',
    number: '01',
    icon: Box,
    color: '#3559e8',
    softColor: '#e8edff',
  },
  {
    id: 'collage-poetry',
    eyebrow: '文字 · 图像 · 重组',
    title: '拼贴诗创意区',
    description: '把文字与图像重新相遇，拼成属于孩子们的视觉诗篇。',
    number: '02',
    icon: Layers3,
    color: '#e7593f',
    softColor: '#ffe9dd',
  },
  {
    id: 'paper-cutting',
    eyebrow: '折叠 · 镂空 · 光影',
    title: '剪纸创意区',
    description: '一张纸、一把剪刀，在虚实与光影之间创造新世界。',
    number: '03',
    icon: Sparkles,
    color: '#c9362b',
    softColor: '#ffe4df',
  },
];

export default function Home() {
  const [activeExhibit, setActiveExhibit] = useState<ExhibitId>('3d');
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
    return () => {
      cancelled = true;
    };
  }, []);

  const activeMeta = exhibits.find((exhibit) => exhibit.id === activeExhibit) ?? exhibits[0];
  const normalizedQuery = query.trim().toLocaleLowerCase('zh-CN');
  const filtered3D = useMemo(
    () => artworks.filter((artwork) =>
      `${artwork.title} ${artwork.author}`.toLocaleLowerCase('zh-CN').includes(normalizedQuery)),
    [artworks, normalizedQuery],
  );
  const filteredCreative = useMemo(
    () => creativeWorks.filter((work) =>
      work.category === activeExhibit &&
      `${work.title} ${work.author}`.toLocaleLowerCase('zh-CN').includes(normalizedQuery)),
    [creativeWorks, activeExhibit, normalizedQuery],
  );

  const countFor = (id: ExhibitId): number => {
    if (id === '3d') return artworks.length;
    return creativeWorks.filter((work) => work.category === id).length;
  };

  const selectExhibit = (id: ExhibitId) => {
    setActiveExhibit(id);
    setQuery('');
    globalThis.setTimeout(() => {
      document.getElementById('exhibit-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#f6f0e7] text-[#2d2822]">
      <div className="pointer-events-none fixed inset-0 opacity-[0.22] [background-image:radial-gradient(#7c6f62_0.7px,transparent_0.7px)] [background-size:18px_18px]" />

      <header className="relative z-20 border-b border-black/8 bg-[#f6f0e7]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-11 rotate-[-4deg] place-items-center rounded-2xl bg-[#2d2822] text-white shadow-lg">
              <Sparkles className="size-5" />
            </span>
            <div>
              <p className="text-lg font-black tracking-tight">童创艺境</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#85796e]">Young Art Lab</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <QRCodeButton className="h-10 rounded-full bg-white px-3 text-[#2d2822] shadow-sm hover:bg-white sm:px-4" />
            <Link href="/admin" aria-label="进入作品管理">
              <Button variant="ghost" size="icon" className="size-10 rounded-full border border-black/10 bg-white/70 hover:bg-white">
                <Settings className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-6 sm:pb-14 sm:pt-20 lg:px-8">
          <div className="grid items-end gap-8 lg:grid-cols-[1.25fr_0.75fr]">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-xs font-bold text-[#665c52] shadow-sm">
                <span className="size-2 rounded-full bg-[#ef5d42]" />
                三种材料 · 三种表达 · 同一份想象力
              </div>
              <h1 className="max-w-4xl text-5xl font-black leading-[0.98] tracking-[-0.055em] sm:text-7xl lg:text-[5.6rem]">
                小小创作者的
                <span className="mt-2 block text-[#ef5d42]">想象力展馆</span>
              </h1>
            </div>
            <div className="pb-2 lg:pb-3">
              <p className="max-w-xl text-base font-medium leading-8 text-[#71665b] sm:text-lg">
                从会旋转的立体画，到文字与图像交织的拼贴诗，再到光影流动的剪纸作品——每一种表达，都值得被认真看见。
              </p>
              <div className="mt-6 flex items-center gap-3 text-sm font-black">
                向下选择展区
                <span className="grid size-8 place-items-center rounded-full bg-[#2d2822] text-white">
                  <ChevronRight className="size-4 rotate-90" />
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-16 sm:px-6 md:grid-cols-3 lg:px-8">
          {exhibits.map((exhibit) => {
            const Icon = exhibit.icon;
            const active = activeExhibit === exhibit.id;
            return (
              <button
                key={exhibit.id}
                type="button"
                onClick={() => selectExhibit(exhibit.id)}
                className={`group relative min-h-64 overflow-hidden rounded-[2rem] border p-6 text-left transition duration-300 sm:min-h-72
                  ${active ? 'border-transparent shadow-[0_22px_60px_rgba(57,43,30,0.18)] -translate-y-1' : 'border-black/8 bg-white/70 hover:-translate-y-1 hover:bg-white'}`}
                style={active ? { backgroundColor: exhibit.color, color: 'white' } : undefined}
              >
                <span className={`absolute right-5 top-4 text-6xl font-black tracking-tighter ${active ? 'text-white/15' : 'text-black/[0.045]'}`}>
                  {exhibit.number}
                </span>
                <span
                  className="mb-12 grid size-12 place-items-center rounded-2xl"
                  style={{ backgroundColor: active ? 'rgba(255,255,255,.18)' : exhibit.softColor, color: active ? 'white' : exhibit.color }}
                >
                  <Icon className="size-6" />
                </span>
                <p className={`text-xs font-black tracking-[0.15em] ${active ? 'text-white/70' : 'text-[#8a7f75]'}`}>{exhibit.eyebrow}</p>
                <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">{exhibit.title}</h2>
                <p className={`mt-3 max-w-sm text-sm font-medium leading-6 ${active ? 'text-white/75' : 'text-[#756b60]'}`}>{exhibit.description}</p>
                <div className="absolute bottom-5 right-5 flex items-center gap-2 text-xs font-black">
                  {countFor(exhibit.id)} 件作品
                  <ChevronRight className="size-4 transition group-hover:translate-x-1" />
                </div>
              </button>
            );
          })}
        </section>

        <section id="exhibit-content" className="scroll-mt-4 border-t border-black/8 bg-[#fffaf3]">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-black tracking-[0.18em]" style={{ color: activeMeta.color }}>{activeMeta.eyebrow}</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">{activeMeta.title}</h2>
                <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-[#756b60] sm:text-base">{activeMeta.description}</p>
              </div>
              <div className="relative w-full md:max-w-sm">
                <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#887b70]" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="搜索作品名称或作者"
                  className="h-13 rounded-full border-black/10 bg-white pl-12 pr-11 text-[#2d2822] shadow-sm placeholder:text-[#9a8f85] focus-visible:ring-[#ef5d42]/25"
                />
                {query && (
                  <button type="button" onClick={() => setQuery('')} className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full hover:bg-black/5" aria-label="清除搜索">
                    <X className="size-4" />
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="grid min-h-72 place-items-center">
                <div className="text-center text-[#776d63]">
                  <LoaderCircle className="mx-auto mb-3 size-8 animate-spin" />
                  正在布置展厅…
                </div>
              </div>
            ) : activeExhibit === '3d' ? (
              filtered3D.length > 0 ? (
                <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered3D.map((artwork, index) => (
                    <Link key={artwork.id} href={`/artwork?id=${artwork.id}`} prefetch={false} className="block min-w-0 rounded-[1.75rem] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3559e8]/25">
                      <ArtworkCard artwork={artwork} priority={index === 0} />
                    </Link>
                  ))}
                </div>
              ) : <EmptyGallery hasQuery={Boolean(query)} />
            ) : filteredCreative.length > 0 ? (
              <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCreative.map((work, index) => <CreativeWorkCard key={work.id} work={work} priority={index === 0} />)}
              </div>
            ) : <EmptyGallery hasQuery={Boolean(query)} />}
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-black/8 bg-[#2d2822] px-4 py-9 text-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <Sparkles className="size-5 text-[#ff765d]" />
            <p className="font-black">童创艺境 · 学生创意作品展</p>
          </div>
          <p className="text-sm text-white/55">扫码访问，把每一份想象力带在身边</p>
        </div>
      </footer>
    </div>
  );
}

function EmptyGallery({ hasQuery }: { hasQuery: boolean }) {
  return (
    <div className="mt-10 grid min-h-80 place-items-center rounded-[2rem] border border-dashed border-black/15 bg-white/45 px-6 text-center">
      <div>
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#efe7dc] text-[#76695e]">
          <ImageIcon className="size-6" />
        </span>
        <h3 className="mt-4 text-xl font-black">{hasQuery ? '没有找到相关作品' : '这个展区正在布展'}</h3>
        <p className="mt-2 text-sm leading-6 text-[#7b7066]">{hasQuery ? '换一个作者名或作品名试试看。' : '进入管理中心上传照片后，作品会自动出现在这里。'}</p>
      </div>
    </div>
  );
}
