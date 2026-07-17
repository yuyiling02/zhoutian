'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { CreativeCategory, CreativeWork } from '@/lib/types';
import { categoryLabel, fetchCreativeWorks } from '@/lib/creative-works';
import { deleteStorageFile, saveCreativeWorks, uploadFile } from '@/lib/supabase';
import {
  ArrowLeft,
  Check,
  Edit3,
  ImagePlus,
  Layers3,
  LoaderCircle,
  Lock,
  LogOut,
  Plus,
  Scissors,
  Trash2,
} from 'lucide-react';

const adminPassword = 'admin123';

interface CreativeForm {
  category: CreativeCategory;
  title: string;
  author: string;
  image: File | null;
}

const initialForm: CreativeForm = {
  category: 'collage-poetry',
  title: '',
  author: '',
  image: null,
};

export default function CreativeAdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [works, setWorks] = useState<CreativeWork[]>([]);
  const [activeCategory, setActiveCategory] = useState<CreativeCategory>('collage-poetry');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CreativeWork | null>(null);
  const [form, setForm] = useState<CreativeForm>(initialForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setLoggedIn(localStorage.getItem('isAdmin') === 'true');
    loadWorks();
  }, []);

  const loadWorks = async () => {
    setLoading(true);
    try {
      setWorks(await fetchCreativeWorks());
    } catch {
      setMessage('作品清单加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const visibleWorks = useMemo(
    () => works.filter((work) => work.category === activeCategory),
    [works, activeCategory],
  );

  const login = () => {
    if (password !== adminPassword) {
      setLoginError('密码错误，请重试');
      return;
    }
    localStorage.setItem('isAdmin', 'true');
    setLoggedIn(true);
    setLoginError('');
  };

  const logout = () => {
    localStorage.removeItem('isAdmin');
    setLoggedIn(false);
    setPassword('');
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ ...initialForm, category: activeCategory });
    setDialogOpen(true);
  };

  const openEdit = (work: CreativeWork) => {
    setEditing(work);
    setForm({ category: work.category, title: work.title, author: work.author, image: null });
    setDialogOpen(true);
  };

  const submit = async () => {
    if (!form.author.trim()) {
      setMessage('请填写作者姓名');
      return;
    }
    if (!editing && !form.image) {
      setMessage('请选择作品照片');
      return;
    }

    setSaving(true);
    try {
      const imageUrl = form.image
        ? await uploadFile(form.image, form.category)
        : editing?.imageUrl ?? '';
      const nextWork: CreativeWork = {
        id: editing?.id ?? globalThis.crypto.randomUUID(),
        category: form.category,
        title: form.title.trim(),
        author: form.author.trim(),
        imageUrl,
        createdAt: editing?.createdAt ?? new Date().toISOString(),
      };
      const nextWorks = editing
        ? works.map((work) => (work.id === editing.id ? nextWork : work))
        : [nextWork, ...works];

      await saveCreativeWorks(nextWorks);
      if (form.image && editing?.imageUrl) {
        deleteStorageFile(editing.imageUrl).catch(() => {});
      }
      setWorks(nextWorks);
      setActiveCategory(form.category);
      setDialogOpen(false);
      setMessage(editing ? '作品已更新' : '作品已加入展区');
    } catch (error: unknown) {
      setMessage(`保存失败：${error instanceof Error ? error.message : '请稍后重试'}`);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (work: CreativeWork) => {
    if (!window.confirm(`确定删除“${work.title || work.author}”吗？`)) return;
    const nextWorks = works.filter((item) => item.id !== work.id);
    try {
      await saveCreativeWorks(nextWorks);
      deleteStorageFile(work.imageUrl).catch(() => {});
      setWorks(nextWorks);
      setMessage('作品已删除');
    } catch (error: unknown) {
      setMessage(`删除失败：${error instanceof Error ? error.message : '请稍后重试'}`);
    }
  };

  if (!loggedIn) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f6f0e7] px-4">
        <div className="w-full max-w-sm rounded-[2rem] border border-black/8 bg-white p-7 shadow-[0_24px_80px_rgba(57,43,30,.15)]">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#2d2822] text-white"><Lock className="size-6" /></span>
          <h1 className="mt-5 text-center text-2xl font-black text-[#2d2822]">创意展区管理</h1>
          <p className="mt-2 text-center text-sm text-[#7a7066]">使用作品管理密码登录</p>
          <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && login()} placeholder="管理员密码" className="mt-6 h-12 rounded-xl" />
          {loginError && <p className="mt-2 text-sm font-medium text-red-600">{loginError}</p>}
          <Button onClick={login} className="mt-4 h-12 w-full rounded-xl bg-[#2d2822] text-white hover:bg-black">登录</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f0e7] text-[#2d2822]">
      <header className="sticky top-0 z-30 border-b border-black/8 bg-[#f6f0e7]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-black"><ArrowLeft className="size-4" />3D 作品管理</Link>
          <h1 className="text-lg font-black">拼贴诗与剪纸管理</h1>
          <Button variant="ghost" size="sm" onClick={logout} className="rounded-full"><LogOut className="mr-2 size-4" />退出</Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-[#2d2822] p-6 text-white sm:p-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-black tracking-[0.18em] text-white/55">CREATIVE WORKS</p>
              <h2 className="mt-2 text-3xl font-black">图片作品管理</h2>
              <p className="mt-2 text-sm text-white/60">选择展区后上传照片，首页会自动更新。</p>
            </div>
            <Button onClick={openAdd} className="h-12 rounded-full bg-[#ff6b4a] px-6 font-black text-white hover:bg-[#f05738]"><Plus className="mr-2 size-5" />添加图片作品</Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 rounded-2xl bg-white p-2 shadow-sm">
          {(['collage-poetry', 'paper-cutting'] as const).map((category) => {
            const active = activeCategory === category;
            return (
              <button key={category} type="button" onClick={() => setActiveCategory(category)} className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-black transition ${active ? 'bg-[#2d2822] text-white' : 'text-[#756b60] hover:bg-[#f5efe7]'}`}>
                {category === 'collage-poetry' ? <Layers3 className="size-4" /> : <Scissors className="size-4" />}
                {categoryLabel(category)}
                <span className={`rounded-full px-2 py-0.5 text-xs ${active ? 'bg-white/15' : 'bg-[#eee6dc]'}`}>{works.filter((work) => work.category === category).length}</span>
              </button>
            );
          })}
        </div>

        {message && <div className="mt-5 flex items-center gap-2 rounded-xl border border-black/8 bg-white px-4 py-3 text-sm font-bold"><Check className="size-4 text-emerald-600" />{message}</div>}

        {loading ? (
          <div className="grid min-h-72 place-items-center"><LoaderCircle className="size-8 animate-spin" /></div>
        ) : visibleWorks.length === 0 ? (
          <div className="mt-6 grid min-h-72 place-items-center rounded-[2rem] border border-dashed border-black/15 bg-white/50 text-center">
            <div><ImagePlus className="mx-auto size-10 text-[#8b8075]" /><p className="mt-3 font-black">这个展区还没有作品</p><p className="mt-1 text-sm text-[#81766c]">点击“添加图片作品”开始布展</p></div>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleWorks.map((work) => (
              <article key={work.id} className="overflow-hidden rounded-[1.5rem] border border-black/8 bg-white shadow-sm">
                <div className="relative aspect-[4/3] bg-[#e9e1d7]"><Image src={work.imageUrl} alt={work.title || `${work.author}的作品`} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" /></div>
                <div className="p-4">
                  <h3 className="truncate text-lg font-black">{work.title || '无题作品'}</h3>
                  <p className="mt-1 text-sm text-[#776d63]">创作者 · {work.author}</p>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(work)} className="flex-1 rounded-xl"><Edit3 className="mr-2 size-4" />编辑</Button>
                    <Button variant="outline" size="sm" onClick={() => remove(work)} className="rounded-xl text-red-600 hover:text-red-700"><Trash2 className="size-4" /></Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg rounded-[1.75rem] border-0 bg-[#fffaf3]">
          <DialogHeader><DialogTitle className="text-xl font-black">{editing ? '编辑图片作品' : '添加图片作品'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-3">
            <div>
              <label className="mb-2 block text-sm font-black">所属展区</label>
              <div className="grid grid-cols-2 gap-2">
                {(['collage-poetry', 'paper-cutting'] as const).map((category) => (
                  <button key={category} type="button" onClick={() => setForm((value) => ({ ...value, category }))} className={`rounded-xl border px-3 py-3 text-sm font-black ${form.category === category ? 'border-[#2d2822] bg-[#2d2822] text-white' : 'border-black/10 bg-white'}`}>{categoryLabel(category)}</button>
                ))}
              </div>
            </div>
            <div><label className="mb-2 block text-sm font-black">作者姓名 *</label><Input value={form.author} onChange={(event) => setForm((value) => ({ ...value, author: event.target.value }))} placeholder="输入作者姓名" className="h-12 rounded-xl bg-white" /></div>
            <div><label className="mb-2 block text-sm font-black">作品名称</label><Input value={form.title} onChange={(event) => setForm((value) => ({ ...value, title: event.target.value }))} placeholder="可不填，默认显示“无题作品”" className="h-12 rounded-xl bg-white" /></div>
            <div><label className="mb-2 block text-sm font-black">作品照片 {editing ? '（不选则保留原图）' : '*'}</label><Input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setForm((value) => ({ ...value, image: event.target.files?.[0] ?? null }))} className="h-12 rounded-xl bg-white file:mr-3 file:border-0 file:bg-transparent file:font-bold" />{form.image && <p className="mt-2 truncate text-xs text-[#756b60]">已选择：{form.image.name}</p>}</div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">取消</Button><Button onClick={submit} disabled={saving} className="rounded-xl bg-[#ff6b4a] text-white hover:bg-[#ed5838]">{saving && <LoaderCircle className="mr-2 size-4 animate-spin" />}{editing ? '保存修改' : '加入展区'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
