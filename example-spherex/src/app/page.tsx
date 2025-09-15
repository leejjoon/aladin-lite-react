'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { SurveyOptions } from 'aladin-lite-react';
import { DEFAULT_HIPS_SURVEY, SPECTRAL_CHANNEL_URL_TEMPLATE, SPECTRAL_CHANNEL_URL_FORMAT } from '@/config';

const AladinViewer = dynamic(() => import('@/components/AladinViewer'), {
  ssr: false,
});

export default function HomePage() {
  const [isAladinReady, setIsAladinReady] = useState(false);
  const [target, setTarget] = useState('M31');
  const [fov, setFov] = useState(60);
  const [layers, setLayers] = useState<SurveyOptions[]>([DEFAULT_HIPS_SURVEY]);
  const [selectedChannel, setSelectedChannel] = useState<{ band: string; channel: number } | null>(null);

  // Local state for cut inputs, initialized from config
  const [minCutInput, setMinCutInput] = useState<string | number>(DEFAULT_HIPS_SURVEY.options?.minCut ?? '0.0');
  const [maxCutInput, setMaxCutInput] = useState<string | number>(DEFAULT_HIPS_SURVEY.options?.maxCut ?? '1.0');

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

  const handleShowRgb = () => {
    const minCut = parseFloat(minCutInput as string);
    const maxCut = parseFloat(maxCutInput as string);
    const newOptions = { ...DEFAULT_HIPS_SURVEY.options };
    if (!isNaN(minCut) && !isNaN(maxCut)) {
      newOptions.minCut = minCut;
      newOptions.maxCut = maxCut;
    }
    setLayers([{ ...DEFAULT_HIPS_SURVEY, options: newOptions }]);
    setSelectedChannel(null);
  };

  const handleChannelClick = (band: string, channel: number) => {
    const channelString = String(channel).padStart(3, '0');
    const url = SPECTRAL_CHANNEL_URL_TEMPLATE
      .replace('{band}', band)
      .replace('{channel:03d}', channelString);

    const minCut = parseFloat(minCutInput as string);
    const maxCut = parseFloat(maxCutInput as string);
    const newOptions: SurveyOptions['options'] = { imgFormat: SPECTRAL_CHANNEL_URL_FORMAT };
    if (!isNaN(minCut) && !isNaN(maxCut)) {
      newOptions.minCut = minCut;
      newOptions.maxCut = maxCut;
    }

    const newLayer: SurveyOptions = {
      id: `SPH-${band}-${channel}`,
      name: `S ${band} ${channel}`,
      url,
      frame: 'equatorial',
      order: 10,
      options: newOptions,
    };

    setLayers([newLayer]);
    setSelectedChannel({ band, channel });
  };

  const handleApplyCuts = () => {
    const minCut = parseFloat(minCutInput as string);
    const maxCut = parseFloat(maxCutInput as string);
    if (!isNaN(minCut) && !isNaN(maxCut)) {
      setLayers(prev => 
        prev.map(layer => ({
          ...layer,
          options: { ...layer.options, minCut, maxCut }
        }))
      );
    }
  };

  useEffect(() => {
    const currentBaseLayer = layers[0];
    if (currentBaseLayer?.options) {
      setMinCutInput(currentBaseLayer.options.minCut ?? '');
      setMaxCutInput(currentBaseLayer.options.maxCut ?? '');
    }
  }, [layers]);

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Left Sidebar */}
      <aside className="w-72 bg-gray-800 p-4 flex flex-col space-y-6 overflow-y-auto custom-scrollbar">
        <div>
          <h2 className="text-lg font-bold text-cyan-400">Surveys</h2>
          <p className="text-sm text-gray-400 mt-2">Last Survey ID: 2025W25_2A</p>
          <button
            className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            onClick={handleShowRgb}
          >
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
                  {spectralChannels[band as keyof typeof spectralChannels].map((channel) => {
                    const isSelected = selectedChannel?.band === band && selectedChannel?.channel === channel;
                    return (
                      <button
                        key={channel}
                        className={`text-sm py-1 px-2 rounded ${
                          isSelected
                            ? 'bg-cyan-500 text-white'
                            : 'bg-gray-700 hover:bg-gray-600 text-white'
                        }`}
                        onClick={() => handleChannelClick(band, channel)}
                      >
                        {channel}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-lg font-bold mb-2 text-cyan-400">Base Layer Cuts</h3>
          <div className="space-y-2">
            <div className="flex space-x-2">
              <div>
                <label htmlFor="min-cut-input" className="block text-sm font-medium">Min Cut</label>
                <input
                  id="min-cut-input"
                  type="number"
                  step="0.01"
                  value={minCutInput}
                  onChange={(e) => setMinCutInput(e.target.value)}
                  className="bg-gray-700 text-white rounded px-2 py-1 w-full text-sm"
                  disabled={!isAladinReady}
                />
              </div>
              <div>
                <label htmlFor="max-cut-input" className="block text-sm font-medium">Max Cut</label>
                <input
                  id="max-cut-input"
                  type="number"
                  step="0.01"
                  value={maxCutInput}
                  onChange={(e) => setMaxCutInput(e.target.value)}
                  className="bg-gray-700 text-white rounded px-2 py-1 w-full text-sm"
                  disabled={!isAladinReady}
                />
              </div>
            </div>
            <button
              onClick={handleApplyCuts}
              disabled={!isAladinReady}
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
            >
              Apply Cuts
            </button>
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
