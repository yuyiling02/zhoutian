'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Artwork, CreativeCategory, CreativeWork } from '@/lib/types';
import type { ExhibitionZone } from '@/lib/zones';
import { getZoneDefinition, isExhibitionZone, zoneDefinitions } from '@/lib/zones';
import { ZoneIcon } from '@/components/ZoneIcon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { addArtwork, deleteArtwork, deleteStorageFile, fetchArtworks, saveArtworkOrder, saveCreativeWorks, updateArtwork, uploadFile } from '@/lib/supabase';
import { fetchCreativeWorks } from '@/lib/creative-works';
import { ArrowDown, ArrowLeft, ArrowUp, Check, Edit3, ImageIcon, ImagePlus, Layers3, LoaderCircle, Lock, LogOut, Plus, Search, Shapes, Trash2, Upload, X } from 'lucide-react';

const ADMIN_PASSWORD = 'admin123';
type EditTarget = { kind: '3d'; value: Artwork } | { kind: 'creative'; value: CreativeWork } | null;
type WorkForm = { title: string; author: string; model: string | File; thumbnail: string | File; image: File | null };
const emptyForm: WorkForm = { title: '', author: '', model: '', thumbnail: '', image: null };

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [zone, setZone] = useState<ExhibitionZone>('3d');
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [creative, setCreative] = useState<CreativeWork[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EditTarget>(null);
  const [form, setForm] = useState<WorkForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [orderDirty, setOrderDirty] = useState(false);

  const load = async () => {
    setLoading(true);
    const [threeD, images] = await Promise.allSettled([fetchArtworks(), fetchCreativeWorks()]);
    if (threeD.status === 'fulfilled') setArtworks(threeD.value);
    if (images.status === 'fulfilled') setCreative(images.value);
    if (threeD.status === 'rejected' || images.status === 'rejected') setMessage('部分数据暂时没有加载成功，请刷新重试。');
    setLoading(false);
  };

  useEffect(() => {
    setLoggedIn(localStorage.getItem('isAdmin') === 'true');
    const requested = new URLSearchParams(window.location.search).get('zone');
    if (requested && isExhibitionZone(requested)) setZone(requested);
    void load();
  }, []);

  const definition = getZoneDefinition(zone);
  const activeCreative = creative.filter((work) => work.category === zone);
  const normalized = query.trim().toLocaleLowerCase('zh-CN');
  const visibleArtworks = useMemo(() => artworks.filter((item) => `${item.title} ${item.author}`.toLocaleLowerCase('zh-CN').includes(normalized)), [artworks, normalized]);
  const visibleCreative = useMemo(() => activeCreative.filter((item) => `${item.title} ${item.author}`.toLocaleLowerCase('zh-CN').includes(normalized)), [activeCreative, normalized]);

  const switchZone = (next: ExhibitionZone) => {
    setZone(next); setQuery(''); setOrderDirty(false);
    const nextUrl = new URL(window.location.href); nextUrl.searchParams.set('zone', next); window.history.replaceState({}, '', nextUrl);
  };
  const countFor = (id: ExhibitionZone) => id === '3d' ? artworks.length : creative.filter((work) => work.category === id).length;
  const notify = (text: string) => { setMessage(text); window.setTimeout(() => setMessage(''), 3500); };
  const openAdd = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (target: EditTarget) => {
    if (!target) return;
    setEditing(target);
    setForm(target.kind === '3d'
      ? { title: target.value.title, author: target.value.author, model: target.value.modelFile, thumbnail: target.value.thumbnail, image: null }
      : { title: target.value.title, author: target.value.author, model: '', thumbnail: '', image: null });
    setDialogOpen(true);
  };

  const submit = async () => {
    if (zone === '3d' && (!form.title.trim() || !form.author.trim())) { alert('请填写作品名称和作者姓名'); return; }
    setSaving(true); setProgress(null);
    try {
      if (zone === '3d') {
        if (!editing && !(form.model instanceof File)) throw new Error('请选择 GLB 模型文件');
        const modelBytes = form.model instanceof File ? form.model.size : 0;
        const thumbBytes = form.thumbnail instanceof File ? form.thumbnail.size : 0;
        const total = modelBytes + thumbBytes;
        const uploaded = { model: 0, thumb: 0 };
        const track = (key: keyof typeof uploaded) => (bytes: number) => { uploaded[key] = bytes; if (total) setProgress(Math.round(((uploaded.model + uploaded.thumb) / total) * 100)); };
        if (total) setProgress(0);
        const [modelUrl, thumbnailUrl] = await Promise.all([
          form.model instanceof File ? uploadFile(form.model, 'models', track('model')) : Promise.resolve(form.model),
          form.thumbnail instanceof File ? uploadFile(form.thumbnail, 'thumbnails', track('thumb')) : Promise.resolve(form.thumbnail),
        ]);
        if (editing?.kind === '3d') {
          await updateArtwork(editing.value.id, { title: form.title.trim(), author: form.author.trim(), modelFile: modelUrl, thumbnail: thumbnailUrl });
          if (form.model instanceof File) void deleteStorageFile(editing.value.modelFile).catch(() => undefined);
          if (form.thumbnail instanceof File && editing.value.thumbnail) void deleteStorageFile(editing.value.thumbnail).catch(() => undefined);
        } else await addArtwork({ title: form.title.trim(), author: form.author.trim(), modelFile: modelUrl, thumbnail: thumbnailUrl });
      } else {
        const category: CreativeCategory = zone;
        let imageUrl = editing?.kind === 'creative' ? editing.value.imageUrl : '';
        if (form.image) imageUrl = await uploadFile(form.image, category, (done, total) => setProgress(Math.round((done / total) * 100)));
        if (!imageUrl) throw new Error('请选择作品照片');
        const nextWork: CreativeWork = { id: editing?.kind === 'creative' ? editing.value.id : crypto.randomUUID(), category, author: form.author.trim(), title: form.title.trim(), imageUrl, createdAt: editing?.kind === 'creative' ? editing.value.createdAt : new Date().toISOString() };
        const next = editing?.kind === 'creative' ? creative.map((work) => work.id === nextWork.id ? nextWork : work) : [...creative, nextWork];
        await saveCreativeWorks(next); setCreative(next);
        if (form.image && editing?.kind === 'creative') void deleteStorageFile(editing.value.imageUrl).catch(() => undefined);
      }
      await load(); setDialogOpen(false); setForm(emptyForm); setEditing(null); notify('作品已保存并更新到展厅。');
    } catch (error) { alert(`保存失败：${error instanceof Error ? error.message : '未知错误'}`); }
    finally { setSaving(false); setProgress(null); }
  };

  const remove3D = async (work: Artwork) => {
    if (!confirm(`确定删除“${work.title}”吗？此操作无法撤销。`)) return;
    try { await deleteArtwork(work.id); if (work.modelFile) void deleteStorageFile(work.modelFile).catch(() => undefined); if (work.thumbnail) void deleteStorageFile(work.thumbnail).catch(() => undefined); await load(); notify('作品已删除。'); } catch (error) { alert(`删除失败：${error instanceof Error ? error.message : '未知错误'}`); }
  };
  const removeCreative = async (work: CreativeWork) => {
    if (!confirm(`确定删除“${work.title || work.author || `ID ${work.id}`}”吗？此操作无法撤销。`)) return;
    try { const next = creative.filter((item) => item.id !== work.id); await saveCreativeWorks(next); setCreative(next); void deleteStorageFile(work.imageUrl).catch(() => undefined); notify('作品已删除。'); } catch (error) { alert(`删除失败：${error instanceof Error ? error.message : '未知错误'}`); }
  };
  const move = (index: number, direction: -1 | 1) => {
    if (query) return;
    if (zone === '3d') { const target = index + direction; if (target < 0 || target >= artworks.length) return; const next = [...artworks]; [next[index], next[target]] = [next[target], next[index]]; setArtworks(next); }
    else { const ids = activeCreative.map((work) => work.id); const target = index + direction; if (target < 0 || target >= ids.length) return; [ids[index], ids[target]] = [ids[target], ids[index]]; let cursor = 0; setCreative(creative.map((work) => work.category === zone ? activeCreative.find((candidate) => candidate.id === ids[cursor++]) ?? work : work)); }
    setOrderDirty(true);
  };
  const saveOrder = async () => { try { if (zone === '3d') await saveArtworkOrder(artworks.map((work) => work.id)); else await saveCreativeWorks(creative); setOrderDirty(false); notify('展示顺序已保存。'); } catch (error) { alert(`排序保存失败：${error instanceof Error ? error.message : '未知错误'}`); } };

  if (!loggedIn) return <Login password={password} setPassword={setPassword} error={loginError} login={() => { if (password === ADMIN_PASSWORD) { localStorage.setItem('isAdmin', 'true'); setLoggedIn(true); setLoginError(''); void load(); } else setLoginError('密码错误，请重试'); }} />;

  return (
    <div className="museum-grid min-h-screen text-[#172033]" style={{ '--zone': definition.color, '--zone-soft': definition.softColor } as CSSProperties}>
      <header className="museum-glass sticky top-0 z-30 border-b border-slate-900/10"><div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8"><Link href="/" className="soft-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black"><ArrowLeft className="size-4" /><span className="hidden sm:inline">返回展厅</span></Link><div className="text-center"><p className="text-sm font-black sm:text-base">数创艺境 · 作品管理中心</p><p className="hidden text-[9px] font-black tracking-[.13em] text-slate-400 sm:block">CREATIVE CLASSROOM CONTROL</p></div><Button variant="ghost" size="sm" onClick={() => { localStorage.removeItem('isAdmin'); setLoggedIn(false); }} className="soft-button rounded-full"><LogOut className="mr-2 size-4" />退出</Button></div></header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="museum-panel overflow-hidden p-6 sm:p-9"><span className="absolute right-7 top-6 text-[9px] font-black tracking-[.16em] text-slate-400">CONTROL · 001</span><div className="flex flex-col justify-between gap-7 sm:flex-row sm:items-end"><div><p className="section-label" style={{ color: definition.color }}>Unified collection manager</p><h1 className="mt-4 text-3xl font-black tracking-[-.05em] sm:text-5xl">作品管理中心</h1><p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">上传、编辑、删除和调整作品顺序，一个后台管理三个展区。</p></div><Button onClick={openAdd} className="h-12 rounded-full px-6 font-black shadow-[0_5px_0_rgba(23,32,51,.12)]" style={{ backgroundColor: definition.color, color: definition.foreground }}><Plus className="mr-2 size-5" />添加{zone === '3d' ? '3D' : '图片'}作品</Button></div></section>

        <section className="mt-5 grid gap-3 md:grid-cols-3">{zoneDefinitions.map((item) => { const active = item.id === zone; return <button key={item.id} type="button" onClick={() => switchZone(item.id)} className="zone-card flex items-center gap-3 rounded-2xl p-4 text-left" style={{ '--zone': item.color, '--zone-soft': item.softColor } as CSSProperties} aria-pressed={active}><span className="zone-icon grid size-11 place-items-center rounded-xl"><ZoneIcon name={item.icon} className="size-5" /></span><span className="min-w-0 flex-1"><span className="block truncate font-black">{item.title}</span><span className="text-xs text-slate-500">{countFor(item.id)} 件作品</span></span></button>; })}</section>

        <section className="mt-5 grid gap-3 sm:grid-cols-3"><StatCard icon={<Layers3 className="size-5" />} label="作品总数" value={artworks.length + creative.length} color="#172033" /><StatCard icon={<ZoneIcon name="paint-space" className="size-5" />} label="3D 作品" value={artworks.length} color="#3C5CFF" /><StatCard icon={<ImageIcon className="size-5" />} label="图片作品" value={creative.length} color="#E83E6F" /></section>

        <section className="admin-surface mt-5 rounded-[2rem] p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-2xl font-black">{definition.title}</h2><p className="mt-1 text-sm text-slate-500">可编辑资料、调整展示顺序或删除作品</p></div><div className="flex gap-2"><div className="relative flex-1 sm:w-72"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索作品或作者" className="h-11 rounded-full border-slate-900/10 pl-10" />{query && <button type="button" onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="size-4" /></button>}</div>{orderDirty && <Button onClick={() => void saveOrder()} className="rounded-full bg-slate-950 font-black text-white"><Check className="mr-2 size-4" />保存排序</Button>}</div></div>
          {message && <div className="mt-5 rounded-xl border border-emerald-600/15 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">{message}</div>}
          {loading ? <div className="grid min-h-72 place-items-center text-slate-500"><LoaderCircle className="size-8 animate-spin" /></div> : zone === '3d' ? <ArtworkList items={visibleArtworks} allItems={artworks} query={query} move={move} edit={(work) => openEdit({ kind: '3d', value: work })} remove={remove3D} /> : <CreativeList items={visibleCreative} allItems={activeCreative} query={query} zone={zone} move={move} edit={(work) => openEdit({ kind: 'creative', value: work })} remove={removeCreative} />}
        </section>
      </main>

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditing(null); setForm(emptyForm); } }}><DialogContent className="max-w-lg rounded-[1.75rem] border border-slate-900/10 bg-[#F5F2E9]"><DialogHeader><div className="mb-2 grid size-11 place-items-center rounded-2xl shadow-[4px_4px_0_rgba(23,32,51,.1)]" style={{ backgroundColor: definition.softColor, color: definition.color }}><ZoneIcon name={definition.icon} className="size-5" /></div><DialogTitle className="text-2xl font-black">{editing ? '编辑作品' : '添加作品'}</DialogTitle></DialogHeader><div className="space-y-4 py-3"><Field label={zone === '3d' ? '作品名称 *' : '作品名称（可选）'}><Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="h-12 rounded-xl bg-white" /></Field><Field label={zone === '3d' ? '作者姓名 *' : '作者姓名（可选）'}><Input value={form.author} onChange={(event) => setForm({ ...form, author: event.target.value })} className="h-12 rounded-xl bg-white" /></Field>{zone === '3d' ? <><FileField id="model" label={`GLB 模型 ${editing ? '（不选则保留）' : '*'}`} accept=".glb,.gltf" value={form.model} onChange={(file) => setForm({ ...form, model: file })} /><FileField id="thumb" label="缩略图（可选）" accept="image/jpeg,image/png,image/webp" value={form.thumbnail} onChange={(file) => setForm({ ...form, thumbnail: file })} /></> : <FileField id="creative-image" label={`作品照片 ${editing ? '（不选则保留）' : '*'}`} accept="image/jpeg,image/png,image/webp" value={form.image} onChange={(file) => setForm({ ...form, image: file instanceof File ? file : null })} />}{progress !== null && <div><div className="mb-1 flex justify-between text-xs font-bold text-slate-500"><span>正在上传</span><span>{progress}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: definition.color }} /></div></div>}</div><DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)} className="soft-button rounded-full">取消</Button><Button onClick={() => void submit()} disabled={saving} className="rounded-full px-6 font-black shadow-[0_4px_0_rgba(23,32,51,.12)]" style={{ backgroundColor: definition.color, color: definition.foreground }}>{saving && <LoaderCircle className="mr-2 size-4 animate-spin" />}{saving ? '保存中…' : '保存作品'}</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}

function Login({ password, setPassword, error, login }: { password: string; setPassword: (value: string) => void; error: string; login: () => void }) { return <div className="museum-grid grid min-h-screen place-items-center p-4"><div className="museum-panel w-full max-w-md p-7 sm:p-9"><div className="flex items-center justify-between"><span className="grid size-14 place-items-center rounded-2xl bg-[#172033] text-white shadow-[5px_5px_0_#FFD769]"><Lock className="size-6" /></span><Shapes className="size-8 text-[#E83E6F]" /></div><p className="section-label mt-8 text-[#3C5CFF]">Digital museum control</p><h1 className="mt-4 text-3xl font-black tracking-[-.04em]">数创艺境管理登录</h1><p className="mt-2 text-sm text-slate-500">登录后可以管理三个展区的全部作品。</p><Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') login(); }} placeholder="输入管理员密码" className="mt-7 h-13 rounded-xl bg-white" />{error && <p className="mt-2 text-sm font-bold text-red-600">{error}</p>}<Button onClick={login} disabled={!password} className="mt-4 h-12 w-full rounded-full bg-[#172033] font-black text-white shadow-[0_5px_0_rgba(23,32,51,.14)] hover:bg-[#24304A]"><Lock className="mr-2 size-4" />进入管理中心</Button><Link href="/" className="mt-5 flex items-center justify-center gap-2 text-sm font-bold text-slate-500"><ArrowLeft className="size-4" />返回展厅</Link></div></div>; }

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) { return <article className="admin-surface rounded-2xl p-5"><div className="flex items-center justify-between"><span className="grid size-10 place-items-center rounded-xl" style={{ backgroundColor: `${color}16`, color }}>{icon}</span><span className="text-[9px] font-black tracking-[.16em] text-slate-400">LIVE DATA</span></div><p className="mt-5 text-sm font-bold text-slate-500">{label}</p><p className="mt-1 text-3xl font-black tracking-[-.04em]">{value}<span className="ml-1 text-xs font-bold text-slate-400">件</span></p></article>; }

function ArtworkList({ items, allItems, query, move, edit, remove }: { items: Artwork[]; allItems: Artwork[]; query: string; move: (index: number, direction: -1 | 1) => void; edit: (work: Artwork) => void; remove: (work: Artwork) => void }) { if (!items.length) return <Empty />; return <div className="mt-6 space-y-3">{items.map((work) => { const index = allItems.findIndex((item) => item.id === work.id); return <article key={work.id} className="grid gap-4 rounded-2xl border border-slate-900/10 bg-white p-4 transition hover:border-[#3C5CFF]/30 sm:grid-cols-[72px_1fr_auto] sm:items-center"><div className="relative size-18 overflow-hidden rounded-xl bg-[#E9EDFF]">{work.thumbnail ? <Image src={work.thumbnail} alt="" fill sizes="72px" className="object-cover" /> : <span className="grid size-full place-items-center text-[#3C5CFF]"><ZoneIcon name="paint-space" className="size-6" /></span>}</div><div className="min-w-0"><h3 className="truncate font-black">{work.title}</h3><p className="mt-1 truncate text-sm text-slate-500">{work.author} · ID {work.id}</p></div><RowActions index={index} length={allItems.length} query={query} move={move} edit={() => edit(work)} remove={() => remove(work)} /></article>; })}</div>; }
function CreativeList({ items, allItems, query, zone, move, edit, remove }: { items: CreativeWork[]; allItems: CreativeWork[]; query: string; zone: CreativeCategory; move: (index: number, direction: -1 | 1) => void; edit: (work: CreativeWork) => void; remove: (work: CreativeWork) => void }) { const def = getZoneDefinition(zone); if (!items.length) return <Empty />; return <div className="mt-6 grid gap-4 md:grid-cols-2">{items.map((work) => { const index = allItems.findIndex((item) => item.id === work.id); const title = work.title.trim(); const author = work.author.trim(); const primaryLabel = title || author; return <article key={work.id} className="overflow-hidden rounded-2xl border border-slate-900/10 bg-white transition" style={{ boxShadow: `0 6px 0 ${def.color}10` }}><div className="relative aspect-[16/9]" style={{ backgroundColor: def.softColor }}><Image src={work.imageUrl} alt={title || (author ? `${author}的作品` : '作品图片')} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" /></div><div className="p-4">{primaryLabel && <h3 className="truncate font-black">{primaryLabel}</h3>}{title && author && <p className="mt-1 truncate text-sm text-slate-500">{author}</p>}<p className={`${primaryLabel ? 'mt-1' : ''} truncate text-xs text-slate-400`}>ID {work.id}</p><div className="mt-4"><RowActions index={index} length={allItems.length} query={query} move={move} edit={() => edit(work)} remove={() => remove(work)} /></div></div></article>; })}</div>; }
function RowActions({ index, length, query, move, edit, remove }: { index: number; length: number; query: string; move: (index: number, direction: -1 | 1) => void; edit: () => void; remove: () => void }) { return <div className="flex items-center gap-2"><Button variant="outline" size="icon" disabled={Boolean(query) || index <= 0} onClick={() => move(index, -1)} className="rounded-full" aria-label="上移"><ArrowUp className="size-4" /></Button><Button variant="outline" size="icon" disabled={Boolean(query) || index >= length - 1} onClick={() => move(index, 1)} className="rounded-full" aria-label="下移"><ArrowDown className="size-4" /></Button><Button variant="outline" onClick={edit} className="rounded-full"><Edit3 className="mr-2 size-4" />编辑</Button><Button variant="outline" size="icon" onClick={remove} className="rounded-full text-red-600 hover:text-red-700" aria-label="删除"><Trash2 className="size-4" /></Button></div>; }
function Empty() { return <div className="mt-6 grid min-h-64 place-items-center rounded-2xl border border-dashed border-slate-900/15 bg-slate-50 text-center"><div><ImagePlus className="mx-auto size-8 text-slate-400" /><p className="mt-3 font-black">没有找到作品</p><p className="mt-1 text-sm text-slate-500">可以清除搜索或添加一件新作品。</p></div></div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-2 block text-sm font-black">{label}</span>{children}</label>; }
function FileField({ id, label, accept, value, onChange }: { id: string; label: string; accept: string; value: string | File | null; onChange: (value: string | File) => void }) { const selected = value instanceof File ? value.name : value ? '已保留现有文件' : '点击选择文件'; const handle = (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (file) onChange(file); }; return <Field label={label}><Input id={id} type="file" accept={accept} onChange={handle} className="hidden" /><label htmlFor={id} className="flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-900/15 bg-white px-4 text-center text-sm font-bold text-slate-500 transition hover:border-[var(--zone)] hover:bg-[var(--zone-soft)]"><Upload className="size-4 shrink-0" /><span className="truncate">{selected}</span></label></Field>; }
