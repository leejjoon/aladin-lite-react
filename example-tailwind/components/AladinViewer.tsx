'use client';

import React, { useRef } from 'react';
import AladinLiteReact, { AladinLiteHandle as AladinLiteReactHandle, AladinInstance } from 'aladin-lite-react';
import { config } from '../app/config';

export interface AladinViewerApi {
  gotoObject: (target: string) => void;
}

interface AladinViewerProps {
  onReady?: () => void;
  onApiReady?: (api: AladinViewerApi) => void;
}

const AladinViewer = ({ onReady, onApiReady }: AladinViewerProps) => {
  const aladinRef = useRef<AladinLiteReactHandle>(null);

  const handleOnReady = (aladin: AladinInstance) => {
    if (aladin) {
      // Expose the API to the parent component via callback
      if (onApiReady) {
        onApiReady({
          gotoObject: (target: string) => {
            aladin.gotoObject(target);
          }
        });
      }

      // Create a new HiPS survey from the configured URL
      const survey = aladin.createImageSurvey(
        'custom-hips',
        'Custom HiPS Survey',
        config.hipsUrl,
        'equatorial',
        9,
        {}
      );
      // Set the view to the new survey
      aladin.setImageSurvey(survey);
      // Signal that the UI can be enabled
      if (onReady) {
        onReady();
      }
    }
  };

  return (
    <div className="w-full h-full">
      <AladinLiteReact ref={aladinRef} onReady={handleOnReady} />
    </div>
  );
};

export default AladinViewer;
