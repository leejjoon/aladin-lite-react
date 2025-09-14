'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { AladinViewerApi } from '@/components/AladinViewer';

const AladinViewer = dynamic(() => import('@/components/AladinViewer'), {
  ssr: false,
});

export default function HomePage() {
  // Use a ref to store the API object from the child component.
  // A ref is better than state here because the API object itself is stable.
  const aladinApiRef = useRef<AladinViewerApi | null>(null);
  const [isAladinReady, setIsAladinReady] = useState(false);

  const handleGotoClick = () => {
    aladinApiRef.current?.gotoObject('M31');
  };

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-800 p-4 text-white">
        <h2 className="text-xl font-bold mb-4">Controls</h2>
        <button
          onClick={handleGotoClick}
          disabled={!isAladinReady}
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          Go to M31
        </button>
      </aside>
      <main className="flex-1">
        <AladinViewer
          onReady={() => setIsAladinReady(true)}
          onApiReady={(api) => {
            aladinApiRef.current = api;
          }}
        />
      </main>
    </div>
  );
}
