'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { CreativeWork } from '@/lib/types';
import { getZoneDefinition } from '@/lib/zones';
import { Expand } from 'lucide-react';
import { ZoneIcon } from '@/components/ZoneIcon';

interface CreativeWorkCardProps { work: CreativeWork; priority?: boolean; }

export function CreativeWorkCard({ work, priority = false }: CreativeWorkCardProps) {
  const zone = getZoneDefinition(work.category);
  const title = work.title.trim();
  const author = work.author.trim();
  const primaryLabel = title || author;
  return (
    <Link href={`/creative?id=${encodeURIComponent(work.id)}`} className="group block overflow-hidden rounded-[1.75rem] border border-slate-900/12 bg-white outline-none transition duration-300 hover:-translate-y-1.5 hover:border-[var(--zone)] focus-visible:ring-4" style={{ '--tw-ring-color': `${zone.color}35`, '--zone': zone.color, boxShadow: `0 10px 0 ${zone.color}14` } as CSSProperties}>
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
        <Image src={work.imageUrl} alt={title || (author ? `${author}的作品` : '作品图片')} fill priority={priority} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition duration-500 group-hover:scale-[1.035]" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/55 to-transparent" />
        <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-xs font-black text-slate-900 shadow-sm backdrop-blur"><ZoneIcon name={zone.icon} className="size-3.5" />{zone.shortLabel}</span>
        <span className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-slate-950/35 text-white opacity-0 backdrop-blur transition group-hover:opacity-100"><Expand className="size-4" /></span>
      </div>
      <div className={`flex items-center gap-3 px-5 py-4 ${primaryLabel ? 'justify-between' : 'justify-end'}`}>
        <div className="min-w-0 py-0.5">
          {primaryLabel && <h3 className="truncate text-lg font-black tracking-tight text-slate-950">{primaryLabel}</h3>}
          {title && author && <p className="mt-1 truncate text-sm text-slate-500">创作者 · {author}</p>}
        </div>
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl" style={{ backgroundColor: zone.softColor, color: zone.color }}><ZoneIcon name={zone.icon} className="size-5" /></span>
      </div>
    </Link>
  );
}
