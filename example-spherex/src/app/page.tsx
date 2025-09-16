'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { SurveyOptions } from 'aladin-lite-react';
import { 
  DEFAULT_HIPS_SURVEY, 
  SPECTRAL_CHANNEL_URL_TEMPLATE, 
  SPECTRAL_CHANNEL_URL_FORMAT,
  DEFAULT_FOV,
  DEFAULT_PROJECTION,
  DEFAULT_COORDINATE_FRAME,
  DEFAULT_TARGET
} from '@/config';
import Tooltip from '@/components/Tooltip';
import { channelMinMax } from '@/channel_definition';

const AladinViewer = dynamic(() => import('@/components/AladinViewer'), {
  ssr: false,
});

const overlaySurveys: Omit<SurveyOptions, 'frame' | 'order'>[] = [
  // { id: 'DSS2-Red', name: 'DSS2 Red', url: 'https://alasky.u-strasbg.fr/HiPS/CDS/P/DSS2/red' },
  { id: 'DSS2', name: 'DSS2 Red', url: 'https://alaskybis.cds.unistra.fr/DSS/DSS2Merged' },
  // https://alaskybis.cds.unistra.fr/DSS/DSS2Merged
  // { id: '2MASS-Color', name: '2MASS Color', url: 'https://alasky.u-strasbg.fr/HiPS/CDS/P/2MASS/color' },
  { id: '2MASS-Color', name: '2MASS Color', url: 'https://alaskybis.cds.unistra.fr/2MASS/Color/' },
  // { id: 'NEOWISE-Color', name: 'NEOWISE Color', url: 'https://alasky.u-strasbg.fr/HiPS/CDS/P/NEOWISE/color' },
  { id: 'Allwise-Color', name: 'Allwise Color', url: 'https://hips.china-vo.org/m/CDS_P_allWISE_color' },
  // 
];

export default function HomePage() {
  const [isAladinReady, setIsAladinReady] = useState(false);
  const [target, setTarget] = useState(DEFAULT_TARGET);
  const [fov, setFov] = useState(DEFAULT_FOV);
  const [layers, setLayers] = useState<SurveyOptions[]>([DEFAULT_HIPS_SURVEY]);
  const [baseLayer, setBaseLayer] = useState<SurveyOptions>(DEFAULT_HIPS_SURVEY);
  const [selectedChannel, setSelectedChannel] = useState<{ band: string; channel: number } | null>(null);
  const [projection, setProjection] = useState(DEFAULT_PROJECTION);
  const [cooFrame, setCooFrame] = useState(DEFAULT_COORDINATE_FRAME);
  const [activeTab, setActiveTab] = useState('spectral');

  // Overlay state
  const [isOverlayEnabled, setIsOverlayEnabled] = useState(false);
  const [selectedOverlay, setSelectedOverlay] = useState<Omit<SurveyOptions, 'frame' | 'order'>>(overlaySurveys[1]); // Default to 2MASS Color
  const [overlayOpacity, setOverlayOpacity] = useState(0.5);

  // RGB mode state
  const [isRgbModeEnabled, setIsRgbModeEnabled] = useState(false);
  const [rChannel, setRChannel] = useState('');
  const [gChannel, setGChannel] = useState('');
  const [bChannel, setBChannel] = useState('');
  const [rgbCutLevels, setRgbCutLevels] = useState({
    r: { min: 0.0, max: 1.0 },
    g: { min: 0.0, max: 1.0 },
    b: { min: 0.0, max: 1.0 },
  });
  const [rgbVisibility, setRgbVisibility] = useState({
    r: true,
    g: true,
    b: true,
  });
  const [syncMin, setSyncMin] = useState(true);
  const [syncMax, setSyncMax] = useState(true);

  // Local state for cut inputs, initialized from config
  const [minCutInput, setMinCutInput] = useState<string | number>(DEFAULT_HIPS_SURVEY.options?.minCut ?? '0.0');
  const [maxCutInput, setMaxCutInput] = useState<string | number>(DEFAULT_HIPS_SURVEY.options?.maxCut ?? '1.0');

  const handleOnReady = useCallback((aladin: any) => {
    setIsAladinReady(true);
  }, []);

  useEffect(() => {
    if (isRgbModeEnabled) {
      // In RGB mode, layers are managed by handleLoadRgb
      return;
    }
    const newLayers = [baseLayer];
    if (isOverlayEnabled && selectedOverlay) {
      newLayers.push({
        ...selectedOverlay,
        frame: 'equatorial',
        order: 20,
        options: {
          ...selectedOverlay.options,
          opacity: overlayOpacity,
        },
      });
    }
    setLayers(newLayers);
  }, [baseLayer, isOverlayEnabled, selectedOverlay, overlayOpacity, isRgbModeEnabled]);

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
    setBaseLayer({ ...DEFAULT_HIPS_SURVEY, options: newOptions });
    setSelectedChannel(null);
  };

  const findBandForChannel = (channel: number): string | null => {
    for (const band in spectralChannels) {
      if (spectralChannels[band as keyof typeof spectralChannels].includes(channel)) {
        return band;
      }
    }
    return null;
  };

  const handleLoadRgb = () => {
    const channels = {
      r: { num: parseInt(rChannel, 10), band: '' },
      g: { num: parseInt(gChannel, 10), band: '' },
      b: { num: parseInt(bChannel, 10), band: '' },
    };

    const newLayers: SurveyOptions[] = [];

    for (const ch of Object.keys(channels) as Array<keyof typeof channels>) {
      if (isNaN(channels[ch].num)) {
        continue;
      }

      const band = findBandForChannel(channels[ch].num);
      if (!band) {
        console.error(`Could not find band for channel ${channels[ch].num}`);
        continue;
      }
      channels[ch].band = band;

      const createChannelUrl = (band: string, channel: number) => {
        const channelString = String(channel).padStart(3, '0');
        return SPECTRAL_CHANNEL_URL_TEMPLATE
          .replace('{band}', band)
          .replace('{channel:03d}', channelString);
      };

      const layer: SurveyOptions = {
        id: `SPH-${band}-${channels[ch].num}`,
        name: `${ch.toUpperCase()}: S ${band} ${channels[ch].num}`,
        url: createChannelUrl(band, channels[ch].num),
        frame: 'equatorial',
        order: ch === 'r' ? 10 : ch === 'g' ? 20 : 30,
        options: {
          colormap: ch === 'r' ? 'red' : ch === 'g' ? 'green' : 'blue',
          imgFormat: SPECTRAL_CHANNEL_URL_FORMAT,
          minCut: rgbCutLevels[ch].min,
          maxCut: rgbCutLevels[ch].max,
          opacity: rgbVisibility[ch] ? 1.0 : 0.0,
        }
      };

      if (ch !== 'r') {
        layer.options!.additive = true;
      }

      newLayers.push(layer);
    }

    if (isOverlayEnabled && selectedOverlay) {
      newLayers.push({
        ...selectedOverlay,
        frame: 'equatorial',
        order: 40,
        options: {
          ...selectedOverlay.options,
          opacity: overlayOpacity,
        },
      });
    }

    setLayers(newLayers);
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

    setBaseLayer(newLayer);
    setSelectedChannel({ band, channel });
  };

  const handleSpectralCutLevelsChange = () => {
    if (baseLayer) {
      const minCut = parseFloat(minCutInput as string);
      const maxCut = parseFloat(maxCutInput as string);
      const newOptions = { ...baseLayer.options };
      if (!isNaN(minCut) && !isNaN(maxCut)) {
        newOptions.minCut = minCut;
        newOptions.maxCut = maxCut;
      }
      setBaseLayer({ ...baseLayer, options: newOptions });
    }
  };

  useEffect(() => {
    if (isRgbModeEnabled) {
      handleLoadRgb();
    }
  }, [rgbVisibility, isOverlayEnabled, selectedOverlay, overlayOpacity]);

  useEffect(() => {
    if (activeTab === 'rgb') {
      handleLoadRgb();
    }
  }, [activeTab]);

  useEffect(() => {
    if (baseLayer?.options) {
      setMinCutInput(baseLayer.options.minCut ?? '');
      setMaxCutInput(baseLayer.options.maxCut ?? '');
    }
  }, [baseLayer]);

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
            Show Coverage
          </button>
        </div>

        {/* Overlay Controls */}
        <div className="border-t border-gray-700 pt-4">
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="overlay-toggle"
                checked={isOverlayEnabled}
                onChange={(e) => setIsOverlayEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
              />
              <label htmlFor="overlay-toggle" className="ml-2 block text-sm text-gray-300">
                Enable Overlay
              </label>
            </div>
            {isOverlayEnabled && (
              <>
                <div>
                  <label htmlFor="overlay-select" className="block text-sm font-medium text-gray-300">
                    Survey
                  </label>
                  <select
                    id="overlay-select"
                    value={selectedOverlay.id}
                    onChange={(e) => {
                      const newSelection = overlaySurveys.find(s => s.id === e.target.value);
                      if (newSelection) setSelectedOverlay(newSelection);
                    }}
                    className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 py-2 pl-3 pr-10 text-base focus:border-cyan-500 focus:outline-none focus:ring-cyan-500 sm:text-sm"
                  >
                    {overlaySurveys.map(survey => (
                      <option key={survey.id} value={survey.id}>{survey.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="opacity-slider" className="block text-sm font-medium text-gray-300">
                    Opacity: {Math.round(overlayOpacity * 100)}%
                  </label>
                  <input
                    id="opacity-slider"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={overlayOpacity}
                    onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700">
          <button
            className={`flex-1 py-2 text-sm font-medium ${activeTab === 'spectral' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'}`}
            onClick={() => {
              setActiveTab('spectral');
              setIsRgbModeEnabled(false);
            }}
          >
            Spectral Channels
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium ${activeTab === 'rgb' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'}`}
            onClick={() => {
              setActiveTab('rgb');
              setIsRgbModeEnabled(true);
            }}
          >
            RGB Mode
          </button>
        </div>

        {/* Tab Content */}
        <div className="pt-4 flex-grow">
          {activeTab === 'spectral' && (
            <div className="flex flex-col h-full">
              <div className="flex space-x-2 mb-4">
                <div className="flex-1">
                  <label htmlFor="min-cut-input" className="block text-xs text-gray-400 mb-1">Min Cut</label>
                  <input
                    id="min-cut-input"
                    type="number"
                    step="0.1"
                    value={minCutInput}
                    onChange={(e) => setMinCutInput(e.target.value)}
                    onBlur={handleSpectralCutLevelsChange}
                    onKeyDown={(e) => e.key === 'Enter' && handleSpectralCutLevelsChange()}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="max-cut-input" className="block text-xs text-gray-400 mb-1">Max Cut</label>
                  <input
                    id="max-cut-input"
                    type="number"
                    step="0.1"
                    value={maxCutInput}
                    onChange={(e) => setMaxCutInput(e.target.value)}
                    onBlur={handleSpectralCutLevelsChange}
                    onKeyDown={(e) => e.key === 'Enter' && handleSpectralCutLevelsChange()}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-6 gap-2 flex-grow">
                {Object.keys(spectralChannels).map((band) => (
                  <div key={band}>
                    <div className="font-bold text-center text-cyan-500 pb-2">{band}</div>
                    <div className="flex flex-col space-y-1">
                      {spectralChannels[band as keyof typeof spectralChannels].map((channel) => {
                        const isSelected = selectedChannel?.band === band && selectedChannel?.channel === channel;
                        const channelInfo = channelMinMax[String(channel) as keyof typeof channelMinMax];
                        const tooltip = channelInfo ? `${channelInfo[0].toFixed(3)}-${channelInfo[1].toFixed(3)}` : '';
                        return (
                          <Tooltip key={channel} text={tooltip}>
                            <button
                              className={`w-full text-sm py-1 px-2 rounded ${
                                isSelected
                                  ? 'bg-cyan-500 text-white'
                                  : 'bg-gray-700 hover:bg-gray-600 text-white'
                              }`}
                              onClick={() => handleChannelClick(band, channel)}
                            >
                              {channel}
                            </button>
                          </Tooltip>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'rgb' && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-x-2 gap-y-3 items-center">
                {/* Headers */}
                <div />
                <div className="font-bold text-lg text-center text-cyan-400">R</div>
                <div className="font-bold text-lg text-center text-cyan-400">G</div>
                <div className="font-bold text-lg text-center text-cyan-400">B</div>

                {/* Channel Row */}
                <label className="text-xs text-gray-400">Channel</label>
                {(['r', 'g', 'b'] as const).map((channel) => (
                  <input
                    key={channel}
                    type="number"
                    value={channel === 'r' ? rChannel : channel === 'g' ? gChannel : bChannel}
                    onChange={(e) => {
                      if (channel === 'r') setRChannel(e.target.value);
                      else if (channel === 'g') setGChannel(e.target.value);
                      else setBChannel(e.target.value);
                    }}
                    onBlur={handleLoadRgb}
                    onKeyDown={(e) => e.key === 'Enter' && handleLoadRgb()}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                  />
                ))}

                {/* Min Cut Row */}
                <Tooltip text="Sync Min values across all RGB channels">
                  <div className="flex items-center">
                    <label className="text-xs text-gray-400 mr-1">Min</label>
                    <input type="checkbox" checked={syncMin} onChange={(e) => setSyncMin(e.target.checked)} className="h-3 w-3 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"/>
                  </div>
                </Tooltip>
                {(['r', 'g', 'b'] as const).map((channel) => (
                  <input
                    key={channel}
                    type="number"
                    step="0.1"
                    value={rgbCutLevels[channel].min}
                    onChange={(e) => {
                      const min = parseFloat(e.target.value);
                      if (syncMin) {
                        setRgbCutLevels(prev => ({
                          r: { ...prev.r, min },
                          g: { ...prev.g, min },
                          b: { ...prev.b, min },
                        }));
                      } else {
                        setRgbCutLevels(prev => ({ ...prev, [channel]: { ...prev[channel], min } }));
                      }
                    }}
                    onBlur={handleLoadRgb}
                    onKeyDown={(e) => e.key === 'Enter' && handleLoadRgb()}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                  />
                ))}

                {/* Max Cut Row */}
                <Tooltip text="Sync Max values across all RGB channels">
                  <div className="flex items-center">
                    <label className="text-xs text-gray-400 mr-1">Max</label>
                    <input type="checkbox" checked={syncMax} onChange={(e) => setSyncMax(e.target.checked)} className="h-3 w-3 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"/>
                  </div>
                </Tooltip>
                {(['r', 'g', 'b'] as const).map((channel) => (
                  <input
                    key={channel}
                    type="number"
                    step="0.1"
                    value={rgbCutLevels[channel].max}
                    onChange={(e) => {
                      const max = parseFloat(e.target.value);
                      if (syncMax) {
                        setRgbCutLevels(prev => ({
                          r: { ...prev.r, max },
                          g: { ...prev.g, max },
                          b: { ...prev.b, max },
                        }));
                      } else {
                        setRgbCutLevels(prev => ({ ...prev, [channel]: { ...prev[channel], max } }));
                      }
                    }}
                    onBlur={handleLoadRgb}
                    onKeyDown={(e) => e.key === 'Enter' && handleLoadRgb()}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                  />
                ))}

                {/* Visibility Row */}
                <label className="text-xs text-gray-400">Visible</label>
                {(['r', 'g', 'b'] as const).map((channel) => (
                  <div key={channel} className="flex justify-center">
                    <input
                      type="checkbox"
                      checked={rgbVisibility[channel]}
                      onChange={(e) => {
                        setRgbVisibility(prev => ({ ...prev, [channel]: e.target.checked }));
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
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
            projection={projection}
            cooFrame={cooFrame}
          />
        </div>
      </main>
    </div>
  );
}
