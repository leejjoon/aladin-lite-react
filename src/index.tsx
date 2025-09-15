
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
  order?: number;
  options?: {
    opacity?: number;
    colormap?: string;
    imgFormat?: string;
    minCut?: number;
    maxCut?: number;
    stretch?: string;
    additive?: boolean;
    longitudeReversed?: boolean;
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
  projection?: string;
  cooFrame?: string;
}

interface AladinLayer {
  id: string;
  setOpacity: (opacity: number) => void;
  setAlpha: (alpha: number) => void; // Alias for setOpacity
  setCuts: (min: number, max: number) => void;
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
  getBaseImageLayer: () => AladinLayer | null;
  removeImageLayer: (id: string) => void;
  setBaseImageLayer: (survey: any) => void;
  setOverlayImageLayer: (survey: any, id: string) => void;
  setProjection: (projection: string) => void;
  setFrame: (frame: string) => void;
}

export interface AladinLiteHandle {
  getAladinInstance: () => AladinInstance | null;
}

const AladinLiteReact = forwardRef<AladinLiteHandle, AladinLiteProps>(({ options, onReady, className, target, fov, onZoomChanged, layers, projection, cooFrame }, ref) => {
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
            const initialOptions = { ...options };
            if (projection) {
              (initialOptions as any).projection = projection;
            }
            if (cooFrame) {
              (initialOptions as any).cooFrame = cooFrame;
            }
            instance = A.aladin(aladinRef.current, initialOptions);
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
      aladin.on('zoomChanged', handleZoomChanged);
      return () => {
        if (aladin.callbacksByEventName && aladin.callbacksByEventName['zoomChanged']) {
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

  useEffect(() => {
    if (aladin && projection) {
      const internalApi = aladin as any;
      if (internalApi._currentProjection !== projection) {
        aladin.setProjection(projection);
        internalApi._currentProjection = projection;
      }
    }
  }, [aladin, projection]);

  useEffect(() => {
    if (aladin && cooFrame) {
      const internalApi = aladin as any;
      if (internalApi._currentCooFrame !== cooFrame) {
        aladin.setFrame(cooFrame);
        internalApi._currentCooFrame = cooFrame;
      }
    }
  }, [aladin, cooFrame]);

  // --- Layer Property Synchronization ---
  const updateLayerProperties = useCallback((layer: AladinLayer, layerProps: SurveyOptions) => {
    const internalApi = aladin as any;
    if (!internalApi._layerStates) {
      internalApi._layerStates = {};
    }
    const state = internalApi._layerStates[layer.id] || {};

    const newOpacity = layerProps.options?.opacity ?? 1.0;
    if (newOpacity !== state.opacity) {
      layer.setAlpha(newOpacity);
      state.opacity = newOpacity;
    }

    const newMinCut = layerProps.options?.minCut;
    const newMaxCut = layerProps.options?.maxCut;
    if (newMinCut !== undefined && newMaxCut !== undefined && (newMinCut !== state.minCut || newMaxCut !== state.maxCut)) {
      layer.setCuts(newMinCut, newMaxCut);
      state.minCut = newMinCut;
      state.maxCut = newMaxCut;
    }

    internalApi._layerStates[layer.id] = state;
  }, [aladin]);

  // --- Layer Reconciliation Logic ---
  useEffect(() => {
    if (!aladin || !layers || layers.length === 0) return;

    const baseLayerProps = layers[0];
    const overlayProps = layers.slice(1);
    const newOverlayIds = new Set(overlayProps.map(l => l.id));
    const internalApi = aladin as any;

    // --- Base Layer Management ---
    if (internalApi._currentBaseLayerId !== baseLayerProps.id) {
      const survey = aladin.createImageSurvey(baseLayerProps.id, baseLayerProps.name, baseLayerProps.url, baseLayerProps.frame, baseLayerProps.order ?? 0, baseLayerProps.options);
      aladin.setBaseImageLayer(survey);
      internalApi._currentBaseLayerId = baseLayerProps.id;
    }
    
    const baseLayer = aladin.getBaseImageLayer();
    if (baseLayer) {
      updateLayerProperties(baseLayer, baseLayerProps);
    }

    // --- Overlay Layer Management ---
    managedLayerIds.current.forEach(id => {
      if (!newOverlayIds.has(id)) {
        aladin.removeImageLayer(id);
        managedLayerIds.current.delete(id);
        if (internalApi._layerStates) {
          delete internalApi._layerStates[id];
        }
      }
    });

    overlayProps.forEach(layerOptions => {
      let layer = aladin.getOverlayImageLayer(layerOptions.id);
      if (!layer) {
        const survey = aladin.createImageSurvey(layerOptions.id, layerOptions.name, layerOptions.url, layerOptions.frame, layerOptions.order ?? 0, layerOptions.options);
        aladin.setOverlayImageLayer(survey, layerOptions.id);
        managedLayerIds.current.add(layerOptions.id);
        layer = aladin.getOverlayImageLayer(layerOptions.id);
      }
      
      if (layer) {
        updateLayerProperties(layer, layerOptions);
      }
    });
  }, [aladin, layers, updateLayerProperties]);

  useImperativeHandle(ref, () => ({
    getAladinInstance: () => aladin,
  }));

  return <div ref={aladinRef} className={className || 'aladin-container'} style={{ width: '100%', height: '100%' }} />;
});

AladinLiteReact.displayName = 'AladinLiteReact';

export default AladinLiteReact;
