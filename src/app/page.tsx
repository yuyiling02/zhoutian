'use client';

import { useState, useEffect } from 'react';
import { ArtworkCard } from '@/components/ArtworkCard';
import { SearchBar } from '@/components/SearchBar';
import { Artwork, ArtworkConfig } from '@/lib/types';
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from '@/components/ui/empty';
import { Search, Sparkles, Settings } from 'lucide-react';
import { QRCodeButton } from '@/components/QrcodeButton';

import config from '@/../public/config.json';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [artworks, setArtworks] = useState<ArtworkConfig>(config);

  useEffect(() => {
    const savedArtworks = localStorage.getItem('artworks');
    if (savedArtworks) {
      try {
        setArtworks(JSON.parse(savedArtworks));
      } catch {
        setArtworks(config);
      }
    }
  }, []);

  const filteredArtworks = artworks.filter((artwork) =>
    artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artwork.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-pink-400 to-purple-400">
      <div className="absolute inset-0 bg-black/5" />
      
      <div className="relative max-w-6xl mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex justify-between items-center mb-8">
            <div className="flex gap-3">
              <QRCodeButton />
            </div>
            <a
              href="/admin"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 
                rounded-full text-white text-sm font-medium border border-white/30 
                backdrop-blur-sm transition-all duration-300"
            >
              <Settings className="w-4 h-4" />
              管理作品
            </a>
          </div>

          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full 
              bg-white/20 backdrop-blur-sm border border-white/30 mb-4">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white mb-3">
            ✨ 3D魔法作品展示 ✨
          </h1>
          <p className="text-white/80 text-lg mb-8">
            探索充满童趣与科技感的3D艺术世界
          </p>

          <div className="max-w-md mx-auto mb-6">
            <SearchBar onSearch={setSearchQuery} />
          </div>

          <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 
            backdrop-blur-sm rounded-full text-white/80 text-sm border border-white/20">
            <Sparkles className="w-4 text-yellow-300" />
            {searchQuery ? (
              <>找到 <strong className="text-white">{filteredArtworks.length}</strong> 个魔法作品</>
            ) : (
              <>共 <strong className="text-yellow-300">{artworks.length}</strong> 个魔法作品</>
            )}
          </span>
        </header>

        <main className="min-h-[500px]">
          {filteredArtworks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArtworks.map((artwork) => (
                <ArtworkCard key={artwork.id} artwork={artwork} />
              ))}
            </div>
          ) : (
            <Empty className="py-20 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/10">
              <EmptyHeader>
                <EmptyMedia variant="icon" className="bg-white/20">
                  <Search className="h-8 w-8 text-white" />
                </EmptyMedia>
                <EmptyTitle className="text-white">未找到魔法作品</EmptyTitle>
                <EmptyDescription className="text-white/70">
                  搜索中没有找到 "{searchQuery}" 相关的作品<br/>
                  试试搜索其他关键词？
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </main>

        <footer className="text-center mt-12 py-8">
          <p className="text-sm text-white/70 flex items-center justify-center gap-2">
            <Sparkles className="w-4 text-yellow-300" />
            扫描二维码访问，开启你的魔法3D之旅
            <Sparkles className="w-4 text-yellow-300" />
          </p>
        </footer>
      </div>
    </div>
  );
}
