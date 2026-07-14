'use client';

import { forwardRef, useEffect, useState, type ComponentPropsWithoutRef } from 'react';
import Image from 'next/image';
import { Artwork } from '@/lib/types';
import { Sparkles } from 'lucide-react';
import { preloadModel } from '@/components/ModelViewer';

interface ArtworkCardProps extends ComponentPropsWithoutRef<'button'> {
  artwork: Artwork;
}

export const ArtworkCard = forwardRef<HTMLButtonElement, ArtworkCardProps>(function ArtworkCard(
  { artwork, className, ...buttonProps },
  ref,
) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  useEffect(() => {
    if (isHovered) {
      preloadModel(artwork.modelFile).catch(() => {});
    }
  }, [isHovered, artwork.modelFile]);

  return (
    <button
      ref={ref}
      type="button"
      className={`group block w-full cursor-pointer text-left ${className ?? ''}`}
      {...buttonProps}
    >
      <div
        className="relative aspect-square w-full overflow-hidden rounded-3xl 
          bg-white/20 backdrop-blur-md border border-white/20
          transition-all duration-500 ease-out
          hover:shadow-2xl hover:shadow-white/20
          hover:-translate-y-3"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {artwork.thumbnail && !imageError ? (
          <Image
            src={artwork.thumbnail}
            alt={`${artwork.title}`}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={artwork.id <= 6}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-white/20 flex items-center justify-center mb-3">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <p className="text-base text-white font-semibold">{artwork.title}</p>
              {artwork.author && (
                <p className="text-sm text-white/60 mt-1">by {artwork.author}</p>
              )}
            </div>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent 
          opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <h3 className="text-white text-lg font-bold truncate">
                {artwork.title}
              </h3>
            </div>
            {artwork.author && (
              <p className="text-white/70 text-sm truncate">
                创作者：{artwork.author}
              </p>
            )}
          </div>
        </div>
        
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 px-2 py-1 
            bg-white/20 backdrop-blur-sm rounded-full
            text-[10px] text-white/80 border border-white/20">
            <Sparkles className="w-3" />
            3D作品
          </span>
        </div>
        
        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="w-2 h-2 rounded-full bg-yellow-300 animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-pink-300 animate-pulse delay-100" />
          <div className="w-2 h-2 rounded-full bg-blue-300 animate-pulse delay-200" />
        </div>
      </div>
    </button>
  );
});
