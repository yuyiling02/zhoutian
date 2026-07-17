import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://yuyiling02.github.io'),
  title: {
    default: '童创艺境｜学生创意作品展',
    template: '%s｜童创艺境',
  },
  description: '汇集绘画立体、拼贴诗与剪纸作品的学生创意线上展馆。',
  keywords: ['学生作品展', '3D作品', '拼贴诗', '剪纸', '创意美术'],
  authors: [{ name: '童创艺境' }],
  generator: 'Next.js',
  openGraph: {
    title: '童创艺境｜学生创意作品展',
    description: '三种材料，三种表达，同一份想象力。',
    siteName: '童创艺境',
    locale: 'zh_CN',
    type: 'website',
    images: [{ url: '/og.png', width: 1728, height: 907, alt: '童创艺境学生创意作品展' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '童创艺境｜学生创意作品展',
    description: '三种材料，三种表达，同一份想象力。',
    images: ['/og.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';

  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {isDev && <Inspector />}
        {children}
      </body>
    </html>
  );
}
