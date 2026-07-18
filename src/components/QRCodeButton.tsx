'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Check, Copy, QrCode, Smartphone, X } from 'lucide-react';

export function QRCodeButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState('https://yuyiling02.github.io/');
  useEffect(() => setUrl(window.location.href), []);
  const copy = async () => { await navigator.clipboard.writeText(url); setCopied(true); window.setTimeout(() => setCopied(false), 1800); };
  return <>
    <Button variant="outline" onClick={() => setOpen(true)} className={`${className ?? ''} rounded-full font-black hover:bg-white`}><QrCode className="mr-2 size-4" />扫码查看</Button>
    {open && <div className="fixed inset-0 z-50 grid place-items-center bg-[#172033]/60 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}><div role="dialog" aria-modal="true" className="museum-panel w-full max-w-sm p-6" onClick={(event) => event.stopPropagation()}>
      <div className="flex items-start justify-between"><div><span className="grid size-11 place-items-center rounded-2xl bg-[#FFD769] text-[#172033] shadow-[4px_4px_0_rgba(23,32,51,.12)]"><Smartphone className="size-5" /></span><h2 className="mt-4 text-2xl font-black tracking-tight">手机扫码参观</h2><p className="mt-1 text-sm text-slate-500">二维码会打开当前页面</p></div><button type="button" onClick={() => setOpen(false)} className="grid size-9 place-items-center rounded-full hover:bg-slate-950/5" aria-label="关闭"><X className="size-5" /></button></div>
      <div className="my-6 grid place-items-center rounded-3xl border border-slate-900/8 bg-white p-5 shadow-inner"><QRCodeSVG value={url} size={230} level="H" includeMargin fgColor="#0F172A" /></div>
      <Button onClick={copy} className="h-12 w-full rounded-full bg-[#172033] font-black text-white hover:bg-[#24304A]">{copied ? <Check className="mr-2 size-4" /> : <Copy className="mr-2 size-4" />}{copied ? '链接已复制' : '复制访问链接'}</Button>
    </div></div>}
  </>;
}
