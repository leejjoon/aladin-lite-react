'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { SurveyOptions, useThrottledCallback } from 'aladin-lite-react';

const AladinViewer = dynamic(() => import('@/components/AladinViewer'), {
  ssr: false,
});

const baseLayer: SurveyOptions = {
  id: 'DSS',
  name: 'DSS Colored',
  url: 'P/DSS2/color',
  frame: 'equatorial',
  order: 9,
};

const overlayLayerTemplate: SurveyOptions = {
  id: '2MASS',
  name: '2MASS',
  url: 'P/2MASS/color',
  frame: 'equatorial',
  order: 9,
  options: { opacity: 0.5 },
};

export default function HomePage() {
  const [isAladinReady, setIsAladinReady] = useState(false);
  const [target, setTarget] = useState('');
  const [fov, setFov] = useState(60);
  const [layers, setLayers] = useState<SurveyOptions[]>([baseLayer]);
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(0.5);

  const handleGotoClick = () => {
    setTarget('M31');
  };

  const handleOnReady = useCallback(() => {
    setIsAladinReady(true);
  }, []);

  const handleOverlayToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setShowOverlay(isChecked);
    if (isChecked) {
      setLayers(prev => [...prev, { ...overlayLayerTemplate, options: { ...overlayLayerTemplate.options, opacity: overlayOpacity } }]);
    } else {
      setLayers(prev => prev.filter(l => l.id !== overlayLayerTemplate.id));
    }
  };

  const handleOpacityChange = (opacity: number) => {
    setOverlayOpacity(opacity);
    setLayers(prev => prev.map(layer => {
      if (layer.id === overlayLayerTemplate.id) {
        return { ...layer, options: { ...layer.options, opacity } };
      }
      return layer;
    }));
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
        <div className="mt-4">
          <h3 className="text-lg font-bold mb-2">Layers</h3>
          <div className="flex items-center">
            <input
              id="overlay-toggle"
              type="checkbox"
              checked={showOverlay}
              onChange={handleOverlayToggle}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              disabled={!isAladinReady}
            />
            <label htmlFor="overlay-toggle" className="ml-2 block text-sm">
              Show 2MASS Overlay
            </label>
          </div>
          {showOverlay && (
            <div className="mt-2">
              <label htmlFor="opacity-slider" className="block text-sm font-medium">Opacity: {overlayOpacity.toFixed(2)}</label>
              <input
                id="opacity-slider"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={overlayOpacity}
                onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                disabled={!isAladinReady}
              />
            </div>
          )}
        </div>
      </aside>
      <main className="flex-1">
        <AladinViewer
          layers={layers}
          target={target}
          fov={fov}
          onReady={handleOnReady}
          onZoomChanged={setFov}
        />
      </main>
    </div>
  );
}
