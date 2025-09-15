'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { SurveyOptions } from 'aladin-lite-react';

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

export default function HomePage() {
  const [isAladinReady, setIsAladinReady] = useState(false);
  const [target, setTarget] = useState('M31');
  const [fov, setFov] = useState(60);
  const [layers, setLayers] = useState<SurveyOptions[]>([baseLayer]);

  const handleOnReady = useCallback(() => {
    setIsAladinReady(true);
  }, []);

  const generateChannels = (start: number, count: number) => {
    return Array.from({ length: count }, (_, i) => start + i);
  };

  const spectralChannels = {
    B1: generateChannels(1, 17),
    B2: generateChannels(18, 17),
    B3: generateChannels(35, 17),
    B4: generateChannels(52, 17),
    B5: generateChannels(69, 17),
    B6: generateChannels(86, 17),
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Left Sidebar */}
      <aside className="w-72 bg-gray-800 p-4 flex flex-col space-y-6 overflow-y-auto custom-scrollbar">
        <div>
          <h2 className="text-lg font-bold text-cyan-400">Surveys</h2>
          <p className="text-sm text-gray-400 mt-2">Last Survey ID: 2025W25_2A</p>
          <button className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
            Show RGB
          </button>
        </div>

        <div className="flex-grow">
          <h2 className="text-lg font-bold text-cyan-400">Spectral Channels</h2>
          <div className="grid grid-cols-6 gap-2 mt-4">
            {Object.keys(spectralChannels).map((band) => (
              <div key={band}>
                <div className="font-bold text-center text-cyan-500 pb-2">{band}</div>
                <div className="flex flex-col space-y-1">
                  {spectralChannels[band as keyof typeof spectralChannels].map((channel) => (
                    <button
                      key={channel}
                      className="bg-gray-700 hover:bg-gray-600 text-white text-sm py-1 px-2 rounded"
                    >
                      {channel}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <div className="text-sm">Selected Channel: <span className="font-bold text-cyan-400">None</span></div>
          <div className="flex items-center justify-between mt-4">
            <label htmlFor="week-plans-toggle" className="text-sm">Show Week Plans</label>
            <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
              <input type="checkbox" name="toggle" id="week-plans-toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
              <label htmlFor="week-plans-toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-700 cursor-pointer"></label>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <div className="relative flex-1">
          <AladinViewer
            layers={layers}
            target={target}
            fov={fov}
            onReady={handleOnReady}
            onZoomChanged={setFov}
          />
        </div>
      </main>
    </div>
  );
}
