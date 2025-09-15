'use client';

import React, { useCallback } from 'react';
import AladinLiteReact, { AladinInstance, SurveyOptions } from 'aladin-lite-react';

interface AladinViewerProps {
  onReady?: () => void;
  target?: string;
  fov?: number;
  onZoomChanged?: (fov: number) => void;
  layers?: SurveyOptions[];
  projection?: string;
  cooFrame?: string;
}

const AladinViewer = ({ onReady, target, fov, onZoomChanged, layers, projection, cooFrame }: AladinViewerProps) => {
  const handleOnReady = useCallback((aladin: AladinInstance) => {
    if (aladin && onReady) {
      onReady();
    }
  }, [onReady]);

  return (
    <div className="w-full h-full">
      <AladinLiteReact
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
