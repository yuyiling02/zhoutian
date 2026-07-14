'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ModelViewer } from '@/components/ModelViewer';
import { Artwork } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Share2, Sparkles, Check, RotateCcw, RefreshCw } from 'lucide-react';
import { fetchArtworkById } from '@/lib/supabase';

interface ArtworkDetailClientProps {
  initialArtwork: Artwork | undefined;
  artworkId: number;
}

export default function ArtworkDetailClient({ initialArtwork, artworkId }: ArtworkDetailClientProps) {
  const [artwork, setArtwork] = useState<Artwork | undefined>(initialArtwork);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [loading, setLoading] = useState(!initialArtwork);

  useEffect(() => {
    if (initialArtwork) {
      setLoading(false);
      return;
    }

    const loadArtwork = async () => {
      setLoading(true);
      try {
        const data = await fetchArtworkById(artworkId);
        setArtwork(data);
      } catch {
        // 保持 undefined，显示「作品不存在」
      } finally {
        setLoading(false);
      }
    };

    loadArtwork();
  }, [artworkId, initialArtwork]);

  const handleShare = async () => {
    const url = window.location.href;
    const title = artwork ? `${artwork.author} - ${artwork.title}` : '3D魔法作品展示';

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `查看 ${artwork?.author} 的魔法作品《${artwork?.title}》`,
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
        try {
          const textarea = document.createElement('textarea');
          textarea.value = url;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          setShareSuccess(true);
          setTimeout(() => setShareSuccess(false), 2000);
        } catch (fallbackErr) {
          window.prompt('链接:', url);
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        }}>
        <div className="text-center">
          <RefreshCw className="h-8 w-8 mx-auto mb-4 text-white animate-spin" />
          <div className="text-white text-lg">加载中...</div>
        </div>
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradient-shift 15s ease infinite',
        }}>
        <style>{`
          @keyframes gradient-shift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
        <div className="text-center px-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-4">
            <Sparkles className="size-8 text-white" />
          </div>
          <p className="text-white font-semibold text-lg">作品不存在</p>
          <Link href="/">
            <Button variant="outline"
              className="mt-6 px-6 py-3 rounded-xl
                border-2 border-white/30 hover:border-white
                hover:bg-white/10 text-white
                transition-all duration-300">
              <ArrowLeft className="size-4 mr-2" />
              返回首页
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradient-shift 15s ease infinite',
      }}>
      <style>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/10 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm
              border border-white/20 group-hover:bg-white/30
              transition-all duration-300">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <span className="text-xs sm:text-sm text-white/80 group-hover:text-white transition-colors">
              返回列表
            </span>
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className={`gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl
              hover:bg-white/20 text-white/80 hover:text-white
              transition-all duration-300
              ${shareSuccess ? 'text-green-300 bg-green-500/20' : ''}`}
          >
            {shareSuccess ? (
              <>
                <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">已复制</span>
              </>
            ) : (
              <>
                <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">分享</span>
              </>
            )}
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-5 sm:py-8 md:py-12">
        <div className="mb-4 sm:mb-6 md:mb-8 text-center">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
            <Sparkles className="size-4 sm:size-5 text-yellow-300" />
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
              {artwork.title}
            </h1>
            <Sparkles className="size-4 sm:size-5 text-yellow-300" />
          </div>
          <p className="text-xs sm:text-sm md:text-base text-white/70 flex items-center justify-center gap-1.5 sm:gap-2">
            <Sparkles className="size-3 sm:size-4 text-pink-300" />
            创作者：{artwork.author}
          </p>
        </div>

        <div className="relative w-full aspect-square sm:aspect-[4/3] md:aspect-[16/10] lg:aspect-[16/9]
          max-h-[400px] sm:max-h-[500px] lg:max-h-[600px]
          rounded-3xl overflow-hidden
          border-2 border-white/20"
          style={{
            boxShadow: '0 20px 50px -10px rgba(0,0,0,0.3), 0 0 30px rgba(255,255,255,0.1)'
          }}>
          <ModelViewer modelUrl={artwork.modelFile} />

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

        <div className="mt-5 sm:mt-8 md:mt-12 space-y-5 sm:space-y-6">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-4 sm:p-6 md:p-8
            border border-white/20">
            <h2 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <Sparkles className="size-4 sm:size-5 text-yellow-300" />
              作品信息
            </h2>
            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-white/70">
              <p className="flex items-center gap-2">
                <span className="font-medium text-white/90">作品名称：</span>
                <span className="text-yellow-300 font-semibold">{artwork.title}</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="font-medium text-white/90">创作者：</span>
                <span className="text-pink-300 font-semibold">{artwork.author}</span>
              </p>
              <div className="flex items-start gap-2 p-2 sm:p-3
                bg-white/10 rounded-xl mt-3">
                <Sparkles className="size-3 sm:size-4 text-blue-300 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] sm:text-xs text-white/60">
                  操作提示：拖动手指旋转模型，双指捏合缩放，双指拖动平移
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link href="/" className="flex-1">
              <Button variant="outline"
                className="w-full py-3 sm:py-4 rounded-2xl
                  border-2 border-white/30 hover:border-white
                  hover:bg-white/10 text-white
                  transition-all duration-300 font-semibold text-sm sm:text-base">
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                查看更多作品
              </Button>
            </Link>
            <Button
              onClick={handleShare}
              className="flex-1 py-3 sm:py-4 rounded-2xl
                bg-white/20 hover:bg-white/30
                text-white
                border border-white/20 hover:border-white/40
                transition-all duration-300 font-semibold
                text-sm sm:text-base hover:-translate-y-1">
              <Share2 className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
              分享作品
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
