
'use client';

import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState, useCallback } from 'react';

// --- START THROTTLE UTILITY ---
export function useThrottledCallback<A extends any[]>(
  callback: (...args: A) => void,
  delay: number
) {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const throttledCallback = useCallback((...args: A) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
}
// --- END THROTTLE UTILITY ---

export interface SurveyOptions {
  id: string;
  name: string;
  url: string;
  frame: string;
  order: number;
  options?: {
    opacity?: number;
    colormap?: string;
  };
}

interface AladinLiteProps {
  options?: Record<string, any>;
  onReady?: (instance: any) => void;
  className?: string;
  target?: string;
  fov?: number;
  onZoomChanged?: (fov: number) => void;
  layers?: SurveyOptions[];
}

interface AladinLayer {
  id: string;
  setOpacity: (opacity: number) => void;
  setAlpha: (alpha: number) => void; // Alias for setOpacity
}

export interface AladinInstance {
  setImageSurvey: (survey: any) => void;
  setFoV: (fov: number) => void;
  getFov: () => [number, number];
  gotoObject: (target: string) => void;
  createImageSurvey: (id: string, name: string, url: string, frame: string, order: number, options?: any) => any;
  on: (event: string, callback: (data: any) => void) => void;
  callbacksByEventName: Record<string, (data: any) => void>;
  getOverlayImageLayer: (id: string) => AladinLayer | null;
  removeImageLayer: (id: string) => void;
  setBaseImageLayer: (survey: any) => void;
  setOverlayImageLayer: (survey: any, id: string) => void;
}

export interface AladinLiteHandle {
  getAladinInstance: () => AladinInstance | null;
}

const AladinLiteReact = forwardRef<AladinLiteHandle, AladinLiteProps>(({ options, onReady, className, target, fov, onZoomChanged, layers }, ref) => {
  const aladinRef = useRef<HTMLDivElement>(null);
  const [aladin, setAladin] = useState<AladinInstance | null>(null);
  const managedLayerIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isMounted = true;
    let A: any;
    let instance: AladinInstance | null = null;

    const initialize = async () => {
      if (aladinRef.current && !instance) {
        try {
          const aladinModule = await import('aladin-lite');
          A = aladinModule.default;
          if (!A || !A.init) throw new Error('Aladin Lite library not found.');

          await A.init;

          if (isMounted && aladinRef.current) {
            instance = A.aladin(aladinRef.current, { ...options });
            setAladin(instance);
            if (onReady) onReady(instance);
          }
        } catch (e) {
          console.error("Failed to initialize Aladin Lite:", e);
        }
      }
    };

    initialize();

    return () => { isMounted = false; };
  }, [options, onReady]);

  const handleZoomChanged = useCallback((newFov: number) => {
    if (onZoomChanged) {
      onZoomChanged(newFov);
    }
  }, [onZoomChanged]);

  useEffect(() => {
    if (aladin) {
      // The Aladin Lite library itself handles the frequency of zoomChanged events,
      // so we don't need to throttle it further here.
      aladin.on('zoomChanged', handleZoomChanged);
      return () => {
        if (aladin.callbacksByEventName && aladin.callbacksByEventName['zoomChanged']) {
          // A more robust way to remove the listener if the library doesn't provide a dedicated off() method
          aladin.callbacksByEventName['zoomChanged'] = () => {};
        }
      };
    }
  }, [aladin, handleZoomChanged]);

  useEffect(() => {
    if (aladin && target) aladin.gotoObject(target);
  }, [aladin, target]);

  useEffect(() => {
    if (aladin && fov && aladin.getFov && Math.abs(aladin.getFov()[0] - fov) > 0.001) {
      aladin.setFoV(fov);
    }
  }, [aladin, fov]);

  // The final, correct layer reconciliation logic
  useEffect(() => {
    if (!aladin || !layers) return;
  
    const baseLayerProps = layers[0];
    const overlayProps = layers.slice(1);
    const newOverlayIds = new Set(overlayProps.map(l => l.id));
  
    // Ensure base layer is set correctly
    // HACK: Aladin Lite doesn't expose the current base layer ID, so we track it ourselves.
    // We store it on the instance to persist across renders.
    const internalApi = aladin as any;
    if (!internalApi._currentBaseLayerId || internalApi._currentBaseLayerId !== baseLayerProps.id) {
      const survey = aladin.createImageSurvey(baseLayerProps.id, baseLayerProps.name, baseLayerProps.url, baseLayerProps.frame, baseLayerProps.order, baseLayerProps.options);
      aladin.setBaseImageLayer(survey);
      internalApi._currentBaseLayerId = baseLayerProps.id;
    }
  
    // Remove overlay layers that are no longer in props
    managedLayerIds.current.forEach(id => {
      if (!newOverlayIds.has(id)) {
        aladin.removeImageLayer(id);
        managedLayerIds.current.delete(id);
      }
    });
  
    // Add or update overlay layers
    overlayProps.forEach(layerOptions => {
      const existingLayer = aladin.getOverlayImageLayer(layerOptions.id);
  
      if (existingLayer) {
        // Layer exists, just update its properties
        if (layerOptions.options?.opacity !== undefined) {
          existingLayer.setAlpha(layerOptions.options.opacity);
        }
      } else {
        // Layer is new, create and add it
        const survey = aladin.createImageSurvey(layerOptions.id, layerOptions.name, layerOptions.url, layerOptions.frame, layerOptions.order, layerOptions.options);
        aladin.setOverlayImageLayer(survey, layerOptions.id);
        managedLayerIds.current.add(layerOptions.id);
      }
    });
  
  }, [aladin, layers]);

  useImperativeHandle(ref, () => ({
    getAladinInstance: () => aladin,
  }));

  return <div ref={aladinRef} className={className || 'aladin-container'} style={{ width: '100%', height: '100%' }} />;
});

AladinLiteReact.displayName = 'AladinLiteReact';

export default AladinLiteReact;
