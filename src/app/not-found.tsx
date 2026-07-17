import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function NotFound() { return <div className="museum-grid grid min-h-screen place-items-center bg-[#F7F7F4] px-5 text-center"><div><p className="font-mono text-8xl font-black tracking-[-.08em] text-[#4E6BFF]">404</p><span className="mx-auto mt-5 grid size-14 place-items-center rounded-2xl bg-[#FFF4CF] text-[#D28A00]"><Sparkles className="size-6" /></span><h1 className="mt-5 text-3xl font-black">这个展厅还没开放</h1><p className="mt-2 text-sm text-slate-500">页面可能已移动，回到首页继续参观吧。</p><Link href="/" className="mt-7 inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white"><ArrowLeft className="size-4" />返回数创艺境</Link></div></div>; }
