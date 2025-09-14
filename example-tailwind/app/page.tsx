'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

const AladinViewer = dynamic(() => import('@/components/AladinViewer'), {
  ssr: false,
});

export default function HomePage() {
  const [isAladinReady, setIsAladinReady] = useState(false);
  const [target, setTarget] = useState('');
  const [fov, setFov] = useState(60);

  const handleGotoClick = () => {
    setTarget('M31');
  };

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-800 p-4 text-white">
        <h2 className="text-xl font-bold mb-4">Controls</h2>
        <button
          onClick={handleGotoClick}
          disabled={!isAladinReady}
          className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          Go to M31
        </button>
        <div className="mt-4">
          <label htmlFor="fov-slider" className="block text-sm font-medium">Field of View: {fov.toFixed(2)}°</label>
          <input
            id="fov-slider"
            type="range"
            min="0.01"
            max="90"
            step="0.01"
            value={fov}
            onChange={(e) => setFov(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            disabled={!isAladinReady}
          />
        </div>
      </aside>
      <main className="flex-1">
        <AladinViewer
          target={target}
          fov={fov}
          onReady={() => setIsAladinReady(true)}
        />
      </main>
    </div>
  );
}
