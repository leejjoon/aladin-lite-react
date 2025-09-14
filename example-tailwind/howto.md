# How to Control a Child Component with Declarative Props

This guide explains a modern, declarative pattern for controlling a child component from a parent using props and state. This is the standard and recommended approach in React.

This pattern is ideal for managing the state of complex child components, like `AladinLiteReact`, in a clean and predictable way.

## The Goal

You have a child component (`AladinViewer`) that you want to control from a parent (`HomePage`). You want to perform actions like:
-   Clicking a button to change the map's location (`target`).
-   Adjusting a slider to change the field of view (`fov`).
-   Toggling a checkbox to add or remove an overlay layer.
-   Changing a slider to adjust the opacity of a layer.

## The Solution: Declarative State Management

Instead of the parent trying to call methods *on* the child (an imperative approach), the parent will simply pass the desired state down to the child as props. The child component is responsible for reacting to changes in those props.

For state that can be changed by user interaction *inside* the child (like zooming with the mouse wheel), the child will use a callback prop (e.g., `onZoomChanged`) to notify the parent of the change. This allows the parent to update its state, creating a two-way data binding.

This pattern involves three parts:
1.  **The Parent Component**: Holds the state (e.g., `target`, `fov`, `layers`) using the `useState` hook. It passes the state down to the child as props. It also passes state setter functions (or callbacks that use them) for the child to report changes back.
2.  **The Child Component**: Receives props from the parent. It uses `useEffect` hooks to watch for changes in these props and trigger the necessary internal actions (e.g., calling `aladin.setFoV(fov)` or updating layers).
3.  **Callbacks for Two-Way Binding**: For interactive elements, the child calls function props like `onZoomChanged` to inform the parent of state changes initiated by the user.

---

### Step 1: Manage State in the Parent Component

In `app/page.tsx`, we define state variables for `target`, `fov`, and `layers`. These are passed directly to the `AladinViewer` component.

-   **`target`**: A string to define the celestial object to view.
-   **`fov`**: A number for the field of view.
-   **`layers`**: An array of `SurveyOptions` objects. The first element is the base layer, and subsequent elements are overlays.

Event handlers update these state variables, which triggers a re-render and passes the new props to `AladinViewer`.

```tsx
// app/page.tsx
'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { SurveyOptions } from 'aladin-lite-react';

const AladinViewer = dynamic(() => import('@/components/AladinViewer'), {
  ssr: false,
});

// Define layer configurations
const baseLayer: SurveyOptions = { id: 'DSS', name: 'DSS Colored', url: 'P/DSS2/color', frame: 'equatorial', order: 9 };
const overlayLayerTemplate: SurveyOptions = { id: '2MASS', name: '2MASS', url: 'P/2MASS/color', frame: 'equatorial', order: 9, options: { opacity: 0.5 } };

export default function HomePage() {
  const [isAladinReady, setIsAladinReady] = useState(false);
  const [target, setTarget] = useState('');
  const [fov, setFov] = useState(60);
  const [layers, setLayers] = useState<SurveyOptions[]>([baseLayer]);
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(0.5);

  const handleGotoClick = () => setTarget('M31');
  const handleOnReady = useCallback(() => setIsAladinReady(true), []);

  // Add or remove the overlay layer from the layers array
  const handleOverlayToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setShowOverlay(isChecked);
    if (isChecked) {
      setLayers(prev => [...prev, { ...overlayLayerTemplate, options: { ...overlayLayerTemplate.options, opacity: overlayOpacity } }]);
    } else {
      setLayers(prev => prev.filter(l => l.id !== overlayLayerTemplate.id));
    }
  };

  // Update the opacity of the overlay layer in the layers array
  const handleOpacityChange = (opacity: number) => {
    setOverlayOpacity(opacity);
    setLayers(prev => prev.map(layer => {
      if (layer.id === overlayLayerTemplate.id) {
        return { ...layer, options: { ...layer.options, opacity } };
      }
      return layer;
    }));
  };

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-800 p-4 text-white">
        {/* ... controls for target and fov ... */}
        <div className="mt-4">
          <h3 className="text-lg font-bold mb-2">Layers</h3>
          <input
            id="overlay-toggle"
            type="checkbox"
            checked={showOverlay}
            onChange={handleOverlayToggle}
            disabled={!isAladinReady}
          />
          <label htmlFor="overlay-toggle">Show 2MASS Overlay</label>
          {showOverlay && (
            <div className="mt-2">
              <label>Opacity: {overlayOpacity.toFixed(2)}</label>
              <input
                type="range"
                min="0" max="1" step="0.01"
                value={overlayOpacity}
                onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
                disabled={!isAladinReady}
              />
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
```

### Step 2: Pass Props Through the Wrapper (If Any)

Our example uses a wrapper component in `components/AladinViewer.tsx`. This component's only job is to accept the props from the parent and pass them straight through to the `AladinLiteReact` component.

```tsx
// components/AladinViewer.tsx
'use client';

import React from 'react';
import AladinLiteReact, { SurveyOptions } from 'aladin-lite-react';

interface AladinViewerProps {
  layers: SurveyOptions[];
  target?: string;
  fov?: number;
  onReady?: () => void;
  onZoomChanged?: (fov: number) => void;
}

const AladinViewer = (props: AladinViewerProps) => {
  return (
    <div className="w-full h-full">
      <AladinLiteReact {...props} />
    </div>
  );
};

export default AladinViewer;
```

### Step 3: The Core Component Reacts to Props

The core `aladin-lite-react` component (in `src/index.tsx`) uses `useEffect` hooks to react to prop changes. This is where the imperative logic (calling the Aladin library) is encapsulated.

#### Layer Reconciliation Logic

This is the most complex effect. It intelligently handles the base layer and overlays separately to avoid unnecessary re-renders.

1.  **Separate Base and Overlays**: It treats the first item in the `layers` prop as the base layer and the rest as overlays.
2.  **Base Layer Management**: It checks if the base layer ID has changed. If it has, it creates a new survey and sets it. This prevents the base layer from being re-created on every render.
3.  **Overlay Diffing**:
    *   It removes any overlay layers that are no longer present in the `layers` prop.
    *   It iterates through the current overlay props. If a layer already exists, it updates its properties (like opacity). If it's new, it creates and adds it.

```tsx
// src/index.tsx (Simplified Layer Logic)

const AladinLiteReact = forwardRef<AladinLiteHandle, AladinLiteProps>(
  ({ layers, ... }, ref) => {
    const [aladin, setAladin] = useState<AladinInstance | null>(null);
    const managedLayerIds = useRef<Set<string>>(new Set());

    // ... (initialization and other effects) ...

    useEffect(() => {
      if (!aladin || !layers) return;

      const baseLayerProps = layers[0];
      const overlayProps = layers.slice(1);
      const newOverlayIds = new Set(overlayProps.map(l => l.id));

      // 1. Handle Base Layer
      const internalApi = aladin as any;
      if (!internalApi._currentBaseLayerId || internalApi._currentBaseLayerId !== baseLayerProps.id) {
        const survey = aladin.createImageSurvey(/*...*/);
        aladin.setBaseImageLayer(survey);
        internalApi._currentBaseLayerId = baseLayerProps.id;
      }

      // 2. Remove Old Overlays
      managedLayerIds.current.forEach(id => {
        if (!newOverlayIds.has(id)) {
          aladin.removeImageLayer(id);
          managedLayerIds.current.delete(id);
        }
      });

      // 3. Add or Update Overlays
      overlayProps.forEach(layerOptions => {
        const existingLayer = aladin.getOverlayImageLayer(layerOptions.id);
        if (existingLayer) {
          // It exists, just update opacity
          if (layerOptions.options?.opacity !== undefined) {
            existingLayer.setAlpha(layerOptions.options.opacity);
          }
        } else {
          // It's new, create and add it
          const survey = aladin.createImageSurvey(/*...*/);
          aladin.setOverlayImageLayer(survey, layerOptions.id);
          managedLayerIds.current.add(layerOptions.id);
        }
      });
    }, [aladin, layers]);

    return <div ref={aladinRef} />;
  }
);
```

