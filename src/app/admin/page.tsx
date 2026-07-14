'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Plus, Edit, ArrowLeft, Sparkles, Upload, FileText, Image as ImageIcon, AlertTriangle, Lock, LogOut, Check, X, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Artwork, ArtworkConfig } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { QRCodeButton } from '@/components/QrcodeButton';
import { fetchArtworks, addArtwork, updateArtwork, deleteArtwork, uploadFile, deleteStorageFile } from '@/lib/supabase';

const ADMIN_PASSWORD = 'admin123';

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [artworks, setArtworks] = useState<ArtworkConfig>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);

  const [formData, setFormData] = useState<{
    title: string;
    author: string;
    modelFile: string | File;
    thumbnail: string | File;
  }>({
    title: '',
    author: '',
    modelFile: '',
    thumbnail: '',
  });

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const savedLogin = localStorage.getItem('isAdmin');
    if (savedLogin === 'true') {
      setLoggedIn(true);
    }
    loadArtworks();
  }, []);

  const loadArtworks = async () => {
    setLoading(true);
    try {
      const data = await fetchArtworks();
      setArtworks(data);
    } catch {
      setMsg('❌ 无法连接到数据库');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('isAdmin', 'true');
      setLoggedIn(true);
      setLoginError('');
      loadArtworks();
    } else {
      setLoginError('密码错误，请重试');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    setLoggedIn(false);
    setPassword('');
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      alert('请输入作品名称');
      return;
    }

    setSaving(true);
    const modelFile = formData.modelFile;
    const thumbFile = formData.thumbnail;

    try {
      // ————— 上传文件到 Supabase Storage —————
      let modelUrl = '';
      let thumbUrl = '';

      if (modelFile instanceof File) {
        modelUrl = await uploadFile(modelFile, 'models');
      } else {
        modelUrl = modelFile;
      }

      if (thumbFile instanceof File) {
        thumbUrl = await uploadFile(thumbFile, 'thumbnails');
      } else {
        thumbUrl = thumbFile;
      }

      // ————— 增/改到 Supabase 数据库 —————
      if (editingArtwork) {
        // 删掉旧 Storage 文件（如果换了文件）
        if (modelFile instanceof File && editingArtwork.modelFile) {
          deleteStorageFile(editingArtwork.modelFile).catch(() => {});
        }
        if (thumbFile instanceof File && editingArtwork.thumbnail) {
          deleteStorageFile(editingArtwork.thumbnail).catch(() => {});
        }

        await updateArtwork(editingArtwork.id, {
          title: formData.title.trim(),
          author: formData.author.trim() || '未知作者',
          modelFile: modelUrl,
          thumbnail: thumbUrl,
        });
      } else {
        await addArtwork({
          title: formData.title.trim(),
          author: formData.author.trim() || '未知作者',
          modelFile: modelUrl,
          thumbnail: thumbUrl,
        });
      }

      await loadArtworks(); // 刷新列表
      setDialogOpen(false);
      resetForm();
      setMsg('✅ 保存成功！');
    } catch (error) {
      alert(`保存失败：${(error as Error).message}`);
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(''), 4000);
    }
  };

  const handleDelete = async (artwork: Artwork) => {
    if (!confirm(`确定要删除作品 "${artwork.title}" 吗？`)) {
      return;
    }

    try {
      await deleteArtwork(artwork.id);

      // 清理 Storage 文件
      if (artwork.modelFile) deleteStorageFile(artwork.modelFile).catch(() => {});
      if (artwork.thumbnail) deleteStorageFile(artwork.thumbnail).catch(() => {});

      await loadArtworks();
      setMsg('✅ 删除成功！');
    } catch (error) {
      alert(`删除失败：${(error as Error).message}`);
    } finally {
      setTimeout(() => setMsg(''), 4000);
    }
  };

  const handleEdit = (artwork: Artwork) => {
    setEditingArtwork(artwork);
    setFormData({
      author: artwork.author === '未知作者' ? '' : artwork.author,
      title: artwork.title,
      modelFile: artwork.modelFile,
      thumbnail: artwork.thumbnail,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingArtwork(null);
    setFormData({
      author: '',
      title: '',
      modelFile: '',
      thumbnail: '',
    });
  };

  const handleModelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, modelFile: file });
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, thumbnail: file });
    }
  };

  if (!loggedIn) {
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
        <Card className="w-full max-w-md bg-white/90 backdrop-blur-md border border-white/30
          rounded-3xl shadow-2xl overflow-hidden">
          <CardHeader className="pb-6 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500
              flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30">
              <Lock className="size-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#1a1a2e]">
              管理员登录
            </CardTitle>
            <p className="text-sm text-gray-500 mt-2">
              请输入管理员密码以访问管理面板
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="请输入密码"
                className="h-14 text-lg bg-white/50 border-2 border-purple-200
                  focus:border-purple-500 focus:ring-purple-500/10
                  rounded-2xl text-[#1a1a2e]"
              />
              {loginError && (
                <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                  <AlertTriangle className="size-4" />
                  {loginError}
                </p>
              )}
            </div>
            <Button
              onClick={handleLogin}
              disabled={!password}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500
                hover:from-purple-600 hover:to-pink-600
                text-white rounded-2xl shadow-lg shadow-purple-500/30
                hover:shadow-xl hover:shadow-purple-500/40
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-300 font-semibold text-lg"
            >
              <Lock className="size-5 mr-2" />
              登录
            </Button>
          </CardContent>
        </Card>
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

      <header className="backdrop-blur-md bg-white/10 border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm
              border border-white/20 group-hover:bg-white/30
              transition-all duration-300">
              <ArrowLeft className="h-5 w-5 text-white group-hover:text-white" />
            </div>
            <span className="text-sm text-white/80 group-hover:text-white transition-colors">
              返回首页
            </span>
          </Link>

          <h1 className="text-xl font-bold text-white flex items-center gap-2 flex-shrink-0">
            <Sparkles className="size-6 text-yellow-300" />
            作品管理中心
          </h1>

          <div className="flex items-center gap-3 flex-shrink-0">
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button
                  className="gap-3 px-6 py-3
                    bg-white/20 hover:bg-white/30 rounded-2xl
                    text-white font-semibold
                    border border-white/20 hover:border-white/40
                    shadow-lg hover:shadow-xl
                    transition-all duration-300"
                >
                  <Plus className="h-5 w-5" />
                  添加作品
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-md bg-white/95 backdrop-blur-md
                border border-white/30 rounded-3xl shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-[#1a1a2e] flex items-center gap-2">
                    <Sparkles className="size-5 text-purple-500" />
                    {editingArtwork ? '编辑作品' : '添加作品'}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-6">
                  <div>
                    <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
                      作品名称 *
                    </label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="输入作品名称"
                      className="h-12 rounded-xl border-2 border-gray-200 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
                      作者
                    </label>
                    <Input
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      placeholder="输入作者名称（可选）"
                      className="h-12 rounded-xl border-2 border-gray-200 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
                      3D模型文件
                    </label>
                    <div className="relative">
                      <Input
                        type="file"
                        accept=".glb,.gltf"
                        onChange={handleModelFileChange}
                        className="hidden"
                        id="model-upload"
                      />
                      <label htmlFor="model-upload" className="flex items-center justify-center gap-2
                        h-14 rounded-xl border-2 border-dashed border-gray-300
                        hover:border-purple-500 hover:bg-purple-50 cursor-pointer
                        transition-all duration-300">
                        <Upload className="size-5 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {formData.modelFile instanceof File
                            ? formData.modelFile.name
                            : editingArtwork
                              ? `点击更换文件 (当前: ${formData.modelFile})`
                              : '点击或拖拽上传GLB文件'}
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
                      缩略图
                    </label>
                    <div className="relative">
                      <Input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={handleThumbnailChange}
                        className="hidden"
                        id="thumbnail-upload"
                      />
                      <label htmlFor="thumbnail-upload" className="flex items-center justify-center gap-2
                        h-14 rounded-xl border-2 border-dashed border-gray-300
                        hover:border-purple-500 hover:bg-purple-50 cursor-pointer
                        transition-all duration-300">
                        <ImageIcon className="size-5 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {formData.thumbnail instanceof File
                            ? formData.thumbnail.name
                            : editingArtwork
                              ? `点击更换图片 (当前: ${formData.thumbnail})`
                              : '点击或拖拽上传图片'}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <DialogFooter className="mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    className="rounded-xl border-2 border-gray-200 hover:border-gray-300"
                  >
                    <X className="h-4 w-4 mr-2" />
                    取消
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    {saving ? (
                      <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />保存中...</>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        {editingArtwork ? '保存修改' : '添加作品'}
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2 px-4 py-2 rounded-xl
                hover:bg-red-500/20 text-white/80 hover:text-red-200
                transition-all duration-300"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm">退出</span>
            </Button>
            <QRCodeButton />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {msg && (
          <div className={`mb-6 p-4 rounded-2xl text-sm flex items-center gap-2 backdrop-blur-md ${
            msg.includes('✅')
              ? 'bg-green-500/20 text-green-200 border border-green-500/30'
              : 'bg-red-500/20 text-red-200 border border-red-500/30'
          }`}>
            {msg.includes('✅') ? <Check className="size-4" /> : <AlertTriangle className="size-4" />}
            {msg}
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-white/70">
            共 <strong className="text-white">{artworks.length}</strong> 个作品
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={loadArtworks}
            disabled={loading}
            className="rounded-xl border-2 border-white/30 bg-white/10
              text-white hover:bg-white/20 hover:border-white/50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-white/70">
            <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin" />
            加载中...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artworks.map((artwork) => (
              <Card key={artwork.id}
                className="bg-white/20 backdrop-blur-md border border-white/20
                  rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300
                  hover:-translate-y-1">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-5 text-yellow-300" />
                      <CardTitle className="text-lg font-bold text-white">
                        {artwork.title}
                      </CardTitle>
                    </div>
                    <Badge className="bg-white/20 text-white border border-white/20">
                      ID: {artwork.id}
                    </Badge>
                  </div>
                  <p className="text-sm text-white/70 mt-1 flex items-center gap-1">
                    <Sparkles className="size-3 text-pink-300" />
                    作者：{artwork.author || '未知作者'}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="text-xs text-white/60 space-y-2 p-3
                    bg-white/10 rounded-xl">
                    <p className="truncate flex items-center gap-1">
                      <FileText className="size-3 text-blue-300" />
                      模型：{artwork.modelFile}
                    </p>
                    <p className="truncate flex items-center gap-1">
                      <ImageIcon className="size-3 text-purple-300" />
                      缩略图：{artwork.thumbnail}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(artwork)}
                      className="gap-2 px-4 py-2 rounded-xl
                        border-2 border-white/30 bg-white/10
                        text-white hover:bg-white/20 hover:border-white/50
                        transition-all duration-300"
                    >
                      <Edit className="h-4 w-4" />
                      编辑
                    </Button>

                    <Link href={`/artwork/${artwork.id}`} className="flex-1">
                      <Button variant="outline" size="sm"
                        className="w-full py-2 rounded-xl
                          border-2 border-white/30 bg-white/10
                          hover:bg-white/20 hover:border-white/50 text-white
                          transition-all duration-300">
                        <Sparkles className="size-4 mr-2" />
                        查看
                      </Button>
                    </Link>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(artwork)}
                      className="gap-2 px-4 py-2 rounded-xl
                        border-2 border-red-300/50 bg-red-500/10
                        text-red-200 hover:bg-red-500/20 hover:border-red-300
                        transition-all duration-300"
                    >
                      <Trash2 className="h-4 w-4" />
                      删除
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && artworks.length === 0 && (
          <div className="text-center py-20 bg-white/10 backdrop-blur-sm rounded-3xl
            border border-white/10">
            <Sparkles className="size-12 text-yellow-300 mx-auto mb-4 animate-pulse" />
            <p className="text-white/70 text-lg">
              暂无作品，点击上方按钮添加作品
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
