'use client';

import Link from 'next/link';
import { Settings, Sparkles } from 'lucide-react';
import { QRCodeButton } from '@/components/QRCodeButton';
import { Button } from '@/components/ui/button';

interface MuseumHeaderProps {
  compact?: boolean;
}

export function MuseumHeader({ compact = false }: MuseumHeaderProps) {
  return (
    <header className="museum-glass sticky top-0 z-40 border-b border-slate-900/8">
      <div className={`mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 ${compact ? 'py-3' : 'py-4'}`}>
        <Link href="/" className="group flex items-center gap-3" aria-label="返回童创艺境首页">
          <span className="relative grid size-11 place-items-center rounded-2xl bg-slate-950 text-white shadow-[0_12px_30px_rgba(15,23,42,.18)] transition group-hover:-translate-y-0.5">
            <Sparkles className="size-5" />
            <span className="absolute -right-1 -top-1 size-3 rounded-full bg-[#F5B82E] ring-2 ring-[#F7F7F4]" />
          </span>
          <div>
            <p className="text-lg font-black tracking-[-0.04em] text-slate-950">童创艺境</p>
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-slate-500">Young Art Museum</p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <QRCodeButton className="h-10 rounded-full bg-white px-3 text-slate-900 shadow-sm hover:bg-white sm:px-4" />
          <Link href="/admin" aria-label="进入作品管理">
            <Button variant="ghost" size="icon" className="size-10 rounded-full border border-slate-900/10 bg-white/75 text-slate-700 hover:bg-white hover:text-slate-950">
              <Settings className="size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
