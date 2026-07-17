'use client';

import { useEffect, useState } from 'react';
import ArtworkDetailClient from './[id]/ArtworkDetailClient';

export default function ArtworkQueryClient() {
  const [artworkId, setArtworkId] = useState<number | null>(null);

  useEffect(() => {
    const id = Number(new URLSearchParams(window.location.search).get('id'));
    setArtworkId(Number.isInteger(id) && id > 0 ? id : 0);
  }, []);

  if (artworkId === null) {
    return (
      <div
        className="flex min-h-screen items-center justify-center text-lg text-white"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        }}
      >
        正在加载作品...
      </div>
    );
  }

  return <ArtworkDetailClient artworkId={artworkId} />;
}
