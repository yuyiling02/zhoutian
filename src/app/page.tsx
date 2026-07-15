'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArtworkCard } from '@/components/ArtworkCard';
import { SearchBar } from '@/components/SearchBar';
import { ArtworkConfig } from '@/lib/types';
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from '@/components/ui/empty';
import { Search, Sparkles, Settings, RefreshCw } from 'lucide-react';
import { QRCodeButton } from '@/components/QrcodeButton';
import { Button } from '@/components/ui/button';
import { fetchPublicArtworks } from '@/lib/artworks-api';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [artworks, setArtworks] = useState<ArtworkConfig>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArtworks();
  }, []);

  const loadArtworks = async () => {
    setLoading(true);
    try {
      const data = await fetchPublicArtworks();
      setArtworks(data);
    } catch {
      setArtworks([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredArtworks = artworks.filter((artwork) =>
    artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artwork.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-pink-400 to-purple-400">
      <div className="pointer-events-none absolute inset-0 bg-black/5" />

      <div className="relative max-w-6xl mx-auto px-3 py-5 sm:px-4 sm:py-8">
        <header className="mb-8 text-center sm:mb-12">
          <div className="mb-6 flex items-center justify-between gap-2 sm:mb-8">
            <div className="flex gap-3">
              <QRCodeButton />
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={loadArtworks}
                disabled={loading}
                className="gap-2 px-3 py-2 rounded-full
                  bg-white/10 hover:bg-white/20 text-white/80 hover:text-white
                  border border-white/20 backdrop-blur-sm
                  transition-all duration-300"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <a
                href="/admin"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30
                  rounded-full text-white text-sm font-medium border border-white/30 px-3 sm:px-4
                  backdrop-blur-sm transition-all duration-300"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">管理作品</span>
              </a>
            </div>
          </div>

          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full
              bg-white/20 backdrop-blur-sm border border-white/30 mb-4">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white mb-3 sm:text-4xl">
            ✨ 3D魔法作品展示 ✨
          </h1>
          <p className="mb-6 text-sm text-white/80 sm:mb-8 sm:text-lg">
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
          {loading ? (
            <div className="text-center py-20">
              <RefreshCw className="h-10 w-10 mx-auto mb-4 text-white/70 animate-spin" />
              <p className="text-white/70">加载作品列表...</p>
            </div>
          ) : filteredArtworks.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredArtworks.map((artwork, index) => (
                <Link
                  key={artwork.id}
                  href={`/artwork/${artwork.id}`}
                  prefetch={false}
                  aria-label={`查看作品：${artwork.title}`}
                  className="block min-w-0 rounded-3xl focus-visible:outline-none
                    focus-visible:ring-4 focus-visible:ring-white/70"
                >
                    <ArtworkCard artwork={artwork} priority={index === 0} />
                </Link>
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
