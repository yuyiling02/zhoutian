'use client';

import Image from 'next/image';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { CreativeWork } from '@/lib/types';
import { categoryLabel } from '@/lib/creative-works';
import { Expand, Scissors, Sparkles } from 'lucide-react';

interface CreativeWorkCardProps {
  work: CreativeWork;
  priority?: boolean;
}

export function CreativeWorkCard({ work, priority = false }: CreativeWorkCardProps) {
  const isCollage = work.category === 'collage-poetry';

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="group w-full overflow-hidden rounded-[1.75rem] border border-black/8 bg-white text-left
            shadow-[0_12px_40px_rgba(57,43,30,0.08)] transition duration-300
            hover:-translate-y-1.5 hover:shadow-[0_20px_55px_rgba(57,43,30,0.14)]
            focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ff6b4a]/25"
          aria-label={`查看作品：${work.title || work.author}`}
        >
          <div className="relative aspect-[4/5] overflow-hidden bg-[#e9e1d7]">
            <Image
              src={work.imageUrl}
              alt={work.title || `${work.author}的作品`}
              fill
              priority={priority}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition duration-500 group-hover:scale-[1.035]"
            />
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/55 to-transparent" />
            <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-[#2d2822] shadow-sm backdrop-blur">
              {isCollage ? '拼贴诗' : '剪纸'}
            </div>
            <span className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-black/30 text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
              <Expand className="size-4" />
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 px-5 py-4">
            <div className="min-w-0">
              <h3 className="truncate text-lg font-black text-[#2d2822]">
                {work.title || '无题作品'}
              </h3>
              <p className="mt-1 text-sm text-[#756b60]">创作者 · {work.author}</p>
            </div>
            <span className={`grid size-10 shrink-0 place-items-center rounded-2xl ${isCollage ? 'bg-[#fff0aa] text-[#8c6500]' : 'bg-[#ffe1dd] text-[#c73a2b]'}`}>
              {isCollage ? <Sparkles className="size-5" /> : <Scissors className="size-5" />}
            </span>
          </div>
        </button>
      </DialogTrigger>

      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto border-0 bg-[#f8f2e9] p-3 shadow-2xl sm:p-5">
        <DialogTitle className="sr-only">{work.title || `${work.author}的作品`}</DialogTitle>
        <div className="relative min-h-[50vh] overflow-hidden rounded-2xl bg-[#e9e1d7] sm:min-h-[65vh]">
          <Image
            src={work.imageUrl}
            alt={work.title || `${work.author}的作品`}
            fill
            sizes="90vw"
            className="object-contain"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-1 pt-3">
          <div>
            <p className="text-xl font-black text-[#2d2822]">{work.title || '无题作品'}</p>
            <p className="mt-1 text-sm text-[#756b60]">创作者 · {work.author}</p>
          </div>
          <span className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-bold text-[#554b41]">
            {categoryLabel(work.category)}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
