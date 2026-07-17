'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Artwork } from '@/lib/types';
import { Box, Move3D, Sparkles } from 'lucide-react';

interface ArtworkCardProps {
  artwork: Artwork;
  priority?: boolean;
}

export function ArtworkCard({ artwork, priority = false }: ArtworkCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <article className="group w-full overflow-hidden rounded-[1.75rem] border border-black/8 bg-white
      shadow-[0_12px_40px_rgba(57,43,30,0.08)] transition duration-300
      hover:-translate-y-1.5 hover:shadow-[0_20px_55px_rgba(57,43,30,0.14)]">
      <div className="relative aspect-[4/5] overflow-hidden bg-[#e8edff]">
        {artwork.thumbnail && !imageError ? (
          <Image
            src={artwork.thumbnail}
            alt={artwork.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.035]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="grid size-full place-items-center bg-[radial-gradient(circle_at_top_left,#fff_0,#e8edff_45%,#cdd7ff_100%)]">
            <div className="text-center text-[#3559e8]">
              <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-white/75 shadow-sm">
                <Sparkles className="size-7" />
              </span>
              <p className="mt-4 max-w-52 font-black">{artwork.title}</p>
            </div>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/55 to-transparent" />
        <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-[#2d2822] shadow-sm backdrop-blur">
          <Box className="size-3.5 text-[#3559e8]" />
          可互动 3D
        </span>
        <span className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-black/30 text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
          <Move3D className="size-4" />
        </span>
      </div>
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-black text-[#2d2822]">{artwork.title}</h3>
          <p className="mt-1 text-sm text-[#756b60]">创作者 · {artwork.author}</p>
        </div>
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[#e8edff] text-[#3559e8]">
          <Box className="size-5" />
        </span>
      </div>
    </article>
  );
}
