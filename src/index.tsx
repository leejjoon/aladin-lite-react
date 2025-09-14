
'use client';

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

// Aladin Lite is a UMD module, so we need to use a dynamic import
// and it attaches itself to the window object.
let A: any;

// Define the props for our component
interface AladinLiteProps {
  options?: Record<string, any>;
  onReady?: (instance: any) => void;
  className?: string;
}

// Define the interface for the Aladin Lite instance
// This can be expanded with more methods as needed.
export interface AladinInstance {
  setImageSurvey: (survey: any) => void;
  setFoV: (fov: number) => void;
  gotoObject: (target: string) => void;
  createImageSurvey: (id: string, name: string, url: string, frame: string, order: number, options: any) => any;
  // Add other Aladin methods you use here
}

export interface AladinLiteHandle {
  getAladinInstance: () => AladinInstance | null;
}

const AladinLiteReact = forwardRef<AladinLiteHandle, AladinLiteProps>(({ options, onReady, className }, ref) => {
  const aladinRef = useRef<HTMLDivElement>(null);
  const aladinInstanceRef = useRef<AladinInstance | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isMounted = true;

    const initialize = async () => {
      if (aladinRef.current && !aladinInstanceRef.current) {
        try {
          const aladinModule = await import('aladin-lite');
          A = aladinModule.default;

          if (!A || !A.init) {
            throw new Error('Aladin Lite library not found or is missing the init method.');
          }

          await A.init;

          if (isMounted && aladinRef.current) {
            const aladin = A.aladin(aladinRef.current, {
              fullScreen: false,
              cooFrame: "ICRSd",
              showSimbadPointerControl: true,
              showShareControl: true,
              fov: 360,
              projection: 'MOL',
              showContextMenu: true,
              ...options, // Allow user to override default options
            });

            aladinInstanceRef.current = aladin;
            if (onReady) {
              onReady(aladin);
            }
          }
        } catch (e) {
          console.error("Failed to initialize Aladin Lite:", e);
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
      // You might want to add cleanup logic here if Aladin provides a destroy method
      // if (aladinInstanceRef.current && aladinInstanceRef.current.destroy) {
      //   aladinInstanceRef.current.destroy();
      // }
    };
  }, [options, onReady]);

  useImperativeHandle(ref, () => ({
    getAladinInstance: () => aladinInstanceRef.current,
  }));

  return <div ref={aladinRef} className={className || 'aladin-container'} style={{ width: '100%', height: '100%' }} />;
});

AladinLiteReact.displayName = 'AladinLiteReact';

export default AladinLiteReact;
