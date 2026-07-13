'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Artwork } from '@/lib/types';
import { Sparkles } from 'lucide-react';
import { preloadModel } from '@/components/ModelViewer';

interface ArtworkCardProps {
  artwork: Artwork;
}

export function ArtworkCard({ artwork }: ArtworkCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  useEffect(() => {
    if (isHovered) {
      preloadModel(artwork.modelFile).catch(() => {});
    }
  }, [isHovered, artwork.modelFile]);

  return (
    <Link href={`/artwork/${artwork.id}`} className="group block">
      <div
        className="relative aspect-square w-full overflow-hidden rounded-3xl 
          bg-white/85 backdrop-blur-sm border border-white/30
          transition-all duration-300 ease-out
          hover:shadow-2xl hover:shadow-[#4FACFE]/30
          hover:-translate-y-2 hover:rotate-[2deg]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          boxShadow: isHovered 
            ? '0 20px 40px -10px rgba(79, 172, 254, 0.3), 0 0 20px rgba(157, 80, 187, 0.2)'
            : '0 10px 30px -5px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* 光晕效果 */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
          pointer-events-none`}
          style={{
            background: 'radial-gradient(circle at center, rgba(79, 172, 254, 0.1) 0%, transparent 70%)'
          }}
        />
        
        {/* 缩略图 */}
        {!imageError ? (
          <Image
            src={artwork.thumbnail}
            alt={`${artwork.title}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={artwork.id <= 6}
            onError={() => setImageError(true)}
          />
        ) : (
          // 占位图（当缩略图不存在时）
          <div className="w-full h-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(79, 172, 254, 0.2) 0%, rgba(157, 80, 187, 0.2) 100%)'
            }}>
            <div className="text-center">
              <div className="text-5xl mb-3 animate-pulse">🎨</div>
              <p className="text-base text-[#2D3748] font-medium">{artwork.title}</p>
              {artwork.author && (
                <p className="text-sm text-[#718096] mt-1">by {artwork.author}</p>
              )}
            </div>
          </div>
        )}
        
        {/* 悬停信息层 */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#2D3748]/70 via-[#2D3748]/20 to-transparent 
          opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="size-5 text-[#4FACFE]" />
              <h3 className="text-white text-lg font-bold truncate">
                {artwork.title}
              </h3>
            </div>
            {artwork.author && (
              <p className="text-white/80 text-sm truncate">
                创作者：{artwork.author}
              </p>
            )}
          </div>
        </div>
        
        {/* 始终显示的底部信息（移动端） */}
        <div className="absolute bottom-0 left-0 right-0 p-4 
          bg-gradient-to-r from-[#4FACFE]/90 to-[#9D50BB]/90
          backdrop-blur-sm sm:hidden rounded-b-3xl">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-white" />
            <h3 className="text-white text-sm font-bold truncate">
              {artwork.title}
            </h3>
          </div>
          {artwork.author && (
            <p className="text-white/90 text-xs mt-1 truncate">
              by {artwork.author}
            </p>
          )}
        </div>
        
        {/* 科技光点装饰 */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 
          transition-opacity duration-500 pointer-events-none">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-[#4FACFE] animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-[#9D50BB] animate-pulse delay-100" />
            <div className="w-2 h-2 rounded-full bg-[#FEE140] animate-pulse delay-200" />
          </div>
        </div>
      </div>
    </Link>
  );
}