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
import { Search, Sparkles, Settings, ArrowLeft, Share2, Check, RotateCcw, RefreshCw } from 'lucide-react';
import { QRCodeButton } from '@/components/QrcodeButton';
import { Button } from '@/components/ui/button';
import { ModelViewer } from '@/components/ModelViewer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { fetchArtworks } from '@/lib/supabase';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [artworks, setArtworks] = useState<ArtworkConfig>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [shareSuccess, setShareSuccess] = useState(false);

  useEffect(() => {
    loadArtworks();
  }, []);

  const loadArtworks = async () => {
    setLoading(true);
    try {
      const data = await fetchArtworks();
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

  const handleShare = async (artwork: Artwork) => {
    const url = `${window.location.origin}/artwork/${artwork.id}`;
    const title = `${artwork.author} - ${artwork.title}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `查看 ${artwork.author} 的魔法作品《${artwork.title}》`,
          url,
        });
      } catch (err) {
        console.log('分享取消:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      } catch (err) {
        window.prompt('链接:', url);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-pink-400 to-purple-400">
      <div className="absolute inset-0 bg-black/5" />

      <div className="relative max-w-6xl mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex justify-between items-center mb-8">
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
                  rounded-full text-white text-sm font-medium border border-white/30
                  backdrop-blur-sm transition-all duration-300"
              >
                <Settings className="w-4 h-4" />
                管理作品
              </a>
            </div>
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
          {loading ? (
            <div className="text-center py-20">
              <RefreshCw className="h-10 w-10 mx-auto mb-4 text-white/70 animate-spin" />
              <p className="text-white/70">加载作品列表...</p>
            </div>
          ) : filteredArtworks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArtworks.map((artwork) => (
                <Dialog key={artwork.id} open={selectedArtwork?.id === artwork.id} onOpenChange={(open) => {
                  if (open) {
                    setSelectedArtwork(artwork);
                  } else {
                    setSelectedArtwork(null);
                  }
                }}>
                  <DialogTrigger asChild>
                    <ArtworkCard artwork={artwork} />
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-md
                    border border-white/30 rounded-3xl shadow-2xl p-0">
                    {selectedArtwork && (
                      <>
                        <DialogHeader className="p-6 pb-4">
                          <div className="flex items-center justify-between">
                            <DialogTitle className="text-xl font-bold text-[#1a1a2e] flex items-center gap-2">
                              <Sparkles className="size-5 text-purple-500" />
                              {selectedArtwork.title}
                            </DialogTitle>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleShare(selectedArtwork)}
                              className={`gap-1.5 px-3 py-1.5 rounded-xl
                                hover:bg-white/20 text-white/80 hover:text-white
                                transition-all duration-300
                                ${shareSuccess ? 'text-green-300 bg-green-500/20' : ''}`}
                            >
                              {shareSuccess ? (
                                <>
                                  <Check className="h-3 w-3" />
                                  <span className="text-xs">已复制</span>
                                </>
                              ) : (
                                <>
                                  <Share2 className="h-3 w-3" />
                                  <span className="text-xs">分享</span>
                                </>
                              )}
                            </Button>
                          </div>
                          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                            <Sparkles className="size-3 text-pink-300" />
                            创作者：{selectedArtwork.author}
                          </p>
                        </DialogHeader>

                        <div className="relative w-full aspect-video max-h-[500px]
                          rounded-2xl overflow-hidden mx-6 mb-6
                          border-2 border-white/20">
                          <ModelViewer modelUrl={selectedArtwork.modelFile} />

                          <div className="absolute bottom-3 right-3 flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.location.reload()}
                              className="w-10 h-10 rounded-full p-0
                                bg-white/10 backdrop-blur-sm border border-white/20
                                text-white hover:bg-white/20 hover:border-white/40
                                transition-all duration-300"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="mx-6 mb-6 space-y-4">
                          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4
                            border border-white/20">
                            <h2 className="text-base font-bold text-[#1a1a2e] mb-3 flex items-center gap-2">
                              <Sparkles className="size-4 text-yellow-300" />
                              作品信息
                            </h2>
                            <div className="space-y-2 text-sm text-gray-600">
                              <p className="flex items-center gap-2">
                                <span className="font-medium text-gray-800">作品名称：</span>
                                <span className="text-purple-600 font-semibold">{selectedArtwork.title}</span>
                              </p>
                              <p className="flex items-center gap-2">
                                <span className="font-medium text-gray-800">创作者：</span>
                                <span className="text-pink-600 font-semibold">{selectedArtwork.author}</span>
                              </p>
                              <div className="flex items-start gap-2 p-2
                                bg-white/10 rounded-xl mt-3">
                                <Sparkles className="size-3 text-blue-400 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-gray-500">
                                  操作提示：拖动手指旋转模型，双指捏合缩放，双指拖动平移
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <Button
                              onClick={() => setSelectedArtwork(null)}
                              variant="outline"
                              className="flex-1 py-3 rounded-xl
                                border-2 border-gray-200 hover:border-gray-300">
                              <ArrowLeft className="h-4 w-4 mr-2" />
                              返回列表
                            </Button>
                            <Button
                              onClick={() => handleShare(selectedArtwork)}
                              className="flex-1 py-3 rounded-xl
                                bg-white/20 hover:bg-white/30
                                text-[#1a1a2e]
                                border border-white/20 hover:border-white/40
                                transition-all duration-300 font-semibold">
                              <Share2 className="h-4 w-4 mr-2" />
                              分享作品
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </DialogContent>
                </Dialog>
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
