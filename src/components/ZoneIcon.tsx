import { BookOpenText, Palette, Scissors } from 'lucide-react';
import type { ZoneIconName } from '@/lib/zones';

interface ZoneIconProps {
  name: ZoneIconName;
  className?: string;
}

export function ZoneIcon({ name, className }: ZoneIconProps) {
  if (name === 'poetry') return <BookOpenText className={className} />;
  if (name === 'scissors') return <Scissors className={className} />;
  return <Palette className={className} />;
}
