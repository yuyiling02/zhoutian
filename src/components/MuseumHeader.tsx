'use client';

import Link from 'next/link';
import { Shapes, Settings } from 'lucide-react';
import { QRCodeButton } from '@/components/QRCodeButton';
import { Button } from '@/components/ui/button';

interface MuseumHeaderProps {
  compact?: boolean;
}

export function MuseumHeader({ compact = false }: MuseumHeaderProps) {
  return (
    <header className="museum-glass sticky top-0 z-40 border-b border-slate-900/10">
      <div className={`mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 ${compact ? 'py-3' : 'py-4'}`}>
        <Link href="/" className="group flex items-center gap-3" aria-label="返回数创艺境首页">
          <span className="relative grid size-11 place-items-center rounded-2xl border border-slate-900/12 bg-[#172033] text-white shadow-[4px_4px_0_#FFD769] transition group-hover:-rotate-3">
            <Shapes className="size-5" />
            <span className="absolute -right-1 -top-1 size-2.5 rounded-full bg-[#E83E6F] ring-2 ring-[#F5F2E9]" />
          </span>
          <div>
            <p className="text-lg font-black tracking-[-0.04em] text-[#172033]">数创艺境</p>
            <p className="text-[9px] font-black tracking-[0.13em] text-slate-500">CREATIVE CLASSROOM LAB</p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <QRCodeButton className="soft-button h-10 rounded-full px-3 text-slate-900 sm:px-4" />
          <Link href="/admin" aria-label="进入作品管理">
            <Button variant="ghost" size="icon" className="soft-button size-10 rounded-full text-slate-700 hover:bg-white hover:text-slate-950">
              <Settings className="size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
