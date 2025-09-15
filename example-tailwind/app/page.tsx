'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { SurveyOptions } from 'aladin-lite-react';

const AladinViewer = dynamic(() => import('@/components/AladinViewer'), {
  ssr: false,
});

const baseLayer: SurveyOptions = {
  id: 'P/DSS2/color',
  name: 'DSS Colored',
  url: 'P/DSS2/color',
  frame: 'equatorial',
  order: 9,
  options: { opacity: 1.0, minCut: 0.0, maxCut: 1.0 },
};

const overlayLayerTemplate: SurveyOptions = {
  id: 'P/2MASS/color',
  name: '2MASS',
  url: 'P/2MASS/color',
  frame: 'equatorial',
  order: 9,
  options: { opacity: 0.5, minCut: 0.0, maxCut: 1.0 },
};

export default function HomePage() {
  const [isAladinReady, setIsAladinReady] = useState(false);
  const [target, setTarget] = useState('M31');
  const [fov, setFov] = useState(1);
  const [layers, setLayers] = useState<SurveyOptions[]>([baseLayer]);
  const [showOverlay, setShowOverlay] = useState(false);

  // Local state for cut inputs
  const [minCutInput, setMinCutInput] = useState<string | number>(baseLayer.options?.minCut ?? '');
  const [maxCutInput, setMaxCutInput] = useState<string | number>(baseLayer.options?.maxCut ?? '');
  const [overlayMinCutInput, setOverlayMinCutInput] = useState<string | number>(overlayLayerTemplate.options?.minCut ?? '');
  const [overlayMaxCutInput, setOverlayMaxCutInput] = useState<string | number>(overlayLayerTemplate.options?.maxCut ?? '');

  const handleOnReady = useCallback(() => setIsAladinReady(true), []);

  const updateLayerOptions = (layerId: string, newOptions: Partial<SurveyOptions['options']>) => {
    setLayers(prev =>
      prev.map(layer =>
        layer.id === layerId
          ? { ...layer, options: { ...layer.options, ...newOptions } }
          : layer
      )
    );
  };

  const handleOverlayToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setShowOverlay(isChecked);
    if (isChecked) {
      setLayers(prev => [...prev, overlayLayerTemplate]);
    } else {
      setLayers(prev => prev.filter(l => l.id !== overlayLayerTemplate.id));
    }
  };

  const handleApplyBaseCuts = () => {
    const minCut = parseFloat(minCutInput as string);
    const maxCut = parseFloat(maxCutInput as string);
    if (!isNaN(minCut) && !isNaN(maxCut)) {
      updateLayerOptions(baseLayer.id, { minCut, maxCut });
    }
  };

  const handleApplyOverlayCuts = () => {
    const minCut = parseFloat(overlayMinCutInput as string);
    const maxCut = parseFloat(overlayMaxCutInput as string);
    if (!isNaN(minCut) && !isNaN(maxCut)) {
      updateLayerOptions(overlayLayerTemplate.id, { minCut, maxCut });
    }
  };
  
  // Update input fields if layer props change from another source
  useEffect(() => {
    const baseLayerOptions = layers.find(l => l.id === baseLayer.id)?.options;
    if (baseLayerOptions) {
      setMinCutInput(baseLayerOptions.minCut ?? '');
      setMaxCutInput(baseLayerOptions.maxCut ?? '');
    }
    const overlayLayerOptions = layers.find(l => l.id === overlayLayerTemplate.id)?.options;
    if (overlayLayerOptions) {
      setOverlayMinCutInput(overlayLayerOptions.minCut ?? '');
      setOverlayMaxCutInput(overlayLayerOptions.maxCut ?? '');
    }
  }, [layers]);

  const baseLayerOptions = layers.find(l => l.id === baseLayer.id)?.options || {};
  const overlayLayerOptions = layers.find(l => l.id === overlayLayerTemplate.id)?.options || {};

  return (
    <div className="flex h-screen">
      <aside className="w-72 bg-gray-800 p-4 text-white overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Controls</h2>
        
        <div className="mb-4">
          <label htmlFor="target-input" className="block text-sm font-medium mb-1">Target</label>
          <div className="flex">
            <input
              id="target-input"
              type="text"
              defaultValue="M31"
              onKeyDown={(e) => { if (e.key === 'Enter') setTarget(e.currentTarget.value); }}
              className="bg-gray-700 text-white rounded-l px-2 py-1 w-full text-sm"
              disabled={!isAladinReady}
            />
            <button
              onClick={() => setTarget((document.getElementById('target-input') as HTMLInputElement).value)}
              disabled={!isAladinReady}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-r text-sm"
            >
              Go
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="fov-slider" className="block text-sm font-medium">Field of View: {fov.toFixed(2)}°</label>
          <input
            id="fov-slider"
            type="range" min="0.01" max="90" step="0.01"
            value={fov}
            onChange={(e) => setFov(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            disabled={!isAladinReady}
          />
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-lg font-bold mb-2">Base Layer (DSS)</h3>
          <div className="mb-2">
            <label htmlFor="base-opacity-slider" className="block text-sm font-medium">Opacity: {baseLayerOptions.opacity?.toFixed(2)}</label>
            <input
              id="base-opacity-slider"
              type="range" min="0" max="1" step="0.01"
              value={baseLayerOptions.opacity ?? 1}
              onChange={(e) => updateLayerOptions(baseLayer.id, { opacity: parseFloat(e.target.value) })}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              disabled={!isAladinReady}
            />
          </div>
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
              onClick={handleApplyBaseCuts}
              disabled={!isAladinReady}
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
            >
              Apply Cuts
            </button>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4 mt-4">
          <h3 className="text-lg font-bold mb-2">Overlay Layer (2MASS)</h3>
          <div className="flex items-center mb-2">
            <input
              id="overlay-toggle"
              type="checkbox"
              checked={showOverlay}
              onChange={handleOverlayToggle}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              disabled={!isAladinReady}
            />
            <label htmlFor="overlay-toggle" className="ml-2 block text-sm">Show Overlay</label>
          </div>
          {showOverlay && (
            <div className="space-y-2">
              <div>
                <label htmlFor="overlay-opacity-slider" className="block text-sm font-medium">Opacity: {overlayLayerOptions.opacity?.toFixed(2)}</label>
                <input
                  id="overlay-opacity-slider"
                  type="range" min="0" max="1" step="0.01"
                  value={overlayLayerOptions.opacity ?? 0.5}
                  onChange={(e) => updateLayerOptions(overlayLayerTemplate.id, { opacity: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  disabled={!isAladinReady}
                />
              </div>
              <div className="flex space-x-2">
                <div>
                  <label htmlFor="overlay-min-cut-input" className="block text-sm font-medium">Min Cut</label>
                  <input
                    id="overlay-min-cut-input"
                    type="number"
                    step="0.01"
                    value={overlayMinCutInput}
                    onChange={(e) => setOverlayMinCutInput(e.target.value)}
                    className="bg-gray-700 text-white rounded px-2 py-1 w-full text-sm"
                    disabled={!isAladinReady}
                  />
                </div>
                <div>
                  <label htmlFor="overlay-max-cut-input" className="block text-sm font-medium">Max Cut</label>
                  <input
                    id="overlay-max-cut-input"
                    type="number"
                    step="0.01"
                    value={overlayMaxCutInput}
                    onChange={(e) => setOverlayMaxCutInput(e.target.value)}
                    className="bg-gray-700 text-white rounded px-2 py-1 w-full text-sm"
                    disabled={!isAladinReady}
                  />
                </div>
              </div>
              <button
                onClick={handleApplyOverlayCuts}
                disabled={!isAladinReady}
                className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
              >
                Apply Cuts
              </button>
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
