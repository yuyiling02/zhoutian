import { Box, Layers3, Scissors } from 'lucide-react';
import type { ZoneIconName } from '@/lib/zones';

interface ZoneIconProps {
  name: ZoneIconName;
  className?: string;
}

export function ZoneIcon({ name, className }: ZoneIconProps) {
  if (name === 'collage') return <Layers3 className={className} />;
  if (name === 'scissors') return <Scissors className={className} />;
  return <Box className={className} />;
}
