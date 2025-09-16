
# Aladin Lite React User Manual

## Overview

`aladin-lite-react` is a React component that wraps the Aladin Lite sky atlas, providing a declarative and easy-to-use interface for integrating Aladin Lite into your React applications. It is written in TypeScript and is compatible with Next.js.

This component allows you to control the Aladin Lite instance through React props, such as `target`, `fov` (field of view), and `layers`. It also provides access to the underlying Aladin Lite instance for more advanced use cases.

## Installation

To install `aladin-lite-react`, you can use npm or yarn:

```bash
npm install aladin-lite-react aladin-lite
```

or

```bash
yarn add aladin-lite-react aladin-lite
```

## Basic Usage

Here's a simple example of how to use the `AladinLiteReact` component:

```tsx
import React, { useState } from 'react';
import AladinLite from 'aladin-lite-react';

const App = () => {
  const [target, setTarget] = useState('M31');
  const [fov, setFov] = useState(1);

  return (
    <div style={{ height: '500px', width: '100%' }}>
      <AladinLite
        target={target}
        fov={fov}
      />
    </div>
  );
};

export default App;
```

## Props

The `AladinLiteReact` component accepts the following props:

| Prop | Type | Description |
| --- | --- | --- |
| `options` | `Record<string, any>` | An object of options to pass to the Aladin Lite instance upon initialization. See the [Aladin Lite documentation](https://aladin.u-strasbg.fr/aladin-lite/doc/API/Aladin.html) for a full list of available options. |
| `onReady` | `(instance: any) => void` | A callback function that is called when the Aladin Lite instance is ready. The instance is passed as an argument. |
| `className` | `string` | A CSS class name to apply to the Aladin Lite container element. |
| `target` | `string` | The name of the object or coordinates to center the view on. |
| `fov` | `number` | The field of view in degrees. |
| `onZoomChanged` | `(fov: number) => void` | A callback function that is called when the field of view changes. The new field of view is passed as an argument. |
| `layers` | `SurveyOptions[]` | An array of survey options to display as layers. The first layer is the base layer, and the rest are overlays. |
| `projection` | `string` | The projection to use for the view. |
| `cooFrame` | `string` | The coordinate frame to use for the view. |

### `SurveyOptions` Interface

The `layers` prop accepts an array of `SurveyOptions` objects. Each object has the following structure:

```ts
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
```

> **Note:** The `colormap`, `stretch`, `additive`, and `longitudeReversed` options are not demonstrated in the provided examples.

## How-to Guides

### Controlling the View

You can control the `target` and `fov` of the Aladin Lite instance by passing them as props to the `AladinLiteReact` component.

```tsx
import React, { useState } from 'react';
import AladinLite from 'aladin-lite-react';

const App = () => {
  const [target, setTarget] = useState('M31');
  const [fov, setFov] = useState(1);

  return (
    <div>
      <input
        type="text"
        value={target}
        onChange={(e) => setTarget(e.target.value)}
      />
      <input
        type="range"
        min="0.01"
        max="90"
        step="0.01"
        value={fov}
        onChange={(e) => setFov(parseFloat(e.target.value))}
      />
      <div style={{ height: '500px', width: '100%' }}>
        <AladinLite
          target={target}
          fov={fov}
        />
      </div>
    </div>
  );
};
```

### Managing Layers

The `layers` prop allows you to declaratively manage the base and overlay layers of the Aladin Lite instance. The first layer in the array is the base layer, and any subsequent layers are added as overlays.

```tsx
import React, { useState } from 'react';
import AladinLite, { SurveyOptions } from 'aladin-lite-react';

const baseLayer: SurveyOptions = {
  id: 'P/DSS2/color',
  name: 'DSS Colored',
  url: 'P/DSS2/color',
  frame: 'equatorial',
};

const overlayLayer: SurveyOptions = {
  id: 'P/2MASS/color',
  name: '2MASS',
  url: 'P/2MASS/color',
  frame: 'equatorial',
  options: { opacity: 0.5 },
};

const App = () => {
  const [showOverlay, setShowOverlay] = useState(false);
  const layers = showOverlay ? [baseLayer, overlayLayer] : [baseLayer];

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={showOverlay}
          onChange={(e) => setShowOverlay(e.target.checked)}
        />
        Show 2MASS Overlay
      </label>
      <div style={{ height: '500px', width: '100%' }}>
        <AladinLite layers={layers} />
      </div>
    </div>
  );
};
```

### Dynamically Updating Layer Options

You can dynamically update the options of a layer, such as its opacity or color map, by updating the `layers` prop.

```tsx
import React, { useState } from 'react';
import AladinLite, { SurveyOptions } from 'aladin-lite-react';

const initialLayers: SurveyOptions[] = [
  {
    id: 'P/DSS2/color',
    name: 'DSS Colored',
    url: 'P/DSS2/color',
    frame: 'equatorial',
    options: { opacity: 1.0 },
  },
];

const App = () => {
  const [layers, setLayers] = useState<SurveyOptions[]>(initialLayers);

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newOpacity = parseFloat(e.target.value);
    setLayers(prevLayers =>
      prevLayers.map(layer => ({
        ...layer,
        options: { ...layer.options, opacity: newOpacity },
      }))
    );
  };

  return (
    <div>
      <label>
        Opacity:
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={layers[0].options?.opacity ?? 1}
          onChange={handleOpacityChange}
        />
      </label>
      <div style={{ height: '500px', width: '100%' }}>
        <AladinLite layers={layers} />
      </div>
    </div>
  );
};
```

## Advanced Usage

### Accessing the Aladin Lite Instance

For more advanced use cases, you can get direct access to the Aladin Lite instance using a `ref`.

```tsx
import React, { useRef } from 'react';
import AladinLite, { AladinLiteHandle } from 'aladin-lite-react';

const App = () => {
  const aladinRef = useRef<AladinLiteHandle>(null);

  const handleButtonClick = () => {
    const aladin = aladinRef.current?.getAladinInstance();
    if (aladin) {
      aladin.gotoObject('M1');
    }
  };

  return (
    <div>
      <button onClick={handleButtonClick}>Go to M1</button>
      <div style={{ height: '500px', width: '100%' }}>
        <AladinLite ref={aladinRef} />
      </div>
    </div>
  );
};
```
