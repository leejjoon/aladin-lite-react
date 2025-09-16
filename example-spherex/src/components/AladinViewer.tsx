'use client';

import React, { useCallback, useRef } from 'react';
import AladinLiteReact, { AladinInstance, AladinLiteHandle, SurveyOptions } from 'aladin-lite-react';

interface AladinViewerProps {
  onReady?: (aladin: AladinInstance) => void;
  target?: string;
  fov?: number;
  onZoomChanged?: (fov: number) => void;
  layers?: SurveyOptions[];
  projection?: string;
  cooFrame?: string;
}

const AladinViewer = ({ onReady, target, fov, onZoomChanged, layers, projection, cooFrame }: AladinViewerProps) => {
  const aladinRef = useRef<AladinLiteHandle>(null);

  const handleOnReady = useCallback((aladin: AladinInstance) => {
    // Define the single-color colormaps
    aladin.setColormap('red',   [ [0,0,0], [255,0,0] ]);
    aladin.setColormap('green', [ [0,0,0], [0,255,0] ]);
    aladin.setColormap('blue',  [ [0,0,0], [0,0,255] ]);

    if (onReady) {
      onReady(aladin);
    }
  }, [onReady]);

  return (
    <div className="w-full h-full">
      <AladinLiteReact
        ref={aladinRef}
        onReady={handleOnReady}
        target={target}
        fov={fov}
        onZoomChanged={onZoomChanged}
        layers={layers}
        projection={projection}
        cooFrame={cooFrame}
      />
    </div>
  );
};

export default AladinViewer;
