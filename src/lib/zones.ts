import type { CreativeCategory } from './types';

export type ExhibitionZone = '3d' | CreativeCategory;
export type ZoneIconName = 'paint-space' | 'poetry' | 'scissors';

export interface ZoneDefinition {
  id: ExhibitionZone;
  number: string;
  shortLabel: string;
  title: string;
  eyebrow: string;
  description: string;
  icon: ZoneIconName;
  color: string;
  softColor: string;
  foreground: string;
}

export const zoneDefinitions: ZoneDefinition[] = [
  {
    id: '3d',
    number: '01',
    shortLabel: '立体',
    title: '绘画立体区',
    eyebrow: '旋转 · 缩放 · 探索',
    description: '让画面从纸上站起来，用手指探索每一个想象的角落。',
    icon: 'paint-space',
    color: '#3C5CFF',
    softColor: '#E9EDFF',
    foreground: '#FFFFFF',
  },
  {
    id: 'collage-poetry',
    number: '02',
    shortLabel: '拼贴诗',
    title: '拼贴诗创意区',
    eyebrow: '文字 · 图像 · 重组',
    description: '让文字与图像重新相遇，拼成属于孩子们的视觉诗篇。',
    icon: 'poetry',
    color: '#E88722',
    softColor: '#FFF0D8',
    foreground: '#FFFFFF',
  },
  {
    id: 'paper-cutting',
    number: '03',
    shortLabel: '剪纸',
    title: '剪纸创意区',
    eyebrow: '折叠 · 镂空 · 光影',
    description: '一张纸、一把剪刀，在虚实与光影之间创造新世界。',
    icon: 'scissors',
    color: '#E83E6F',
    softColor: '#FFE5ED',
    foreground: '#FFFFFF',
  },
];

export function getZoneDefinition(id: ExhibitionZone): ZoneDefinition {
  return zoneDefinitions.find((zone) => zone.id === id) ?? zoneDefinitions[0];
}

export function isExhibitionZone(value: string | null): value is ExhibitionZone {
  return value === '3d' || value === 'collage-poetry' || value === 'paper-cutting';
}
