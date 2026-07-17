'use client';

import { useEffect } from 'react';
import { LoaderCircle } from 'lucide-react';

export default function LegacyCreativeAdmin() {
  useEffect(() => { window.location.replace('/admin?zone=collage-poetry'); }, []);
  return <div className="museum-grid grid min-h-screen place-items-center bg-[#F7F7F4]"><div className="text-center text-slate-500"><LoaderCircle className="mx-auto mb-3 size-7 animate-spin" />正在进入统一管理中心…</div></div>;
}
