# Aladin Lite React

A React component for integrating the Aladin Lite sky atlas into Next.js and TypeScript applications.

## Installation

This package bundles the necessary CSS for Aladin Lite. You only need to install `aladin-lite` as a peer dependency.

```bash
npm install aladin-lite-react aladin-lite
```

## Usage

Here's a basic example of how to use the `AladinLiteReact` component in a Next.js application.

### 1. Import the CSS

Import the bundled CSS file in your root layout or global stylesheet.

```tsx
// app/layout.tsx
import "aladin-lite-react/dist/aladin.css";
```

### 2. Create the Aladin Lite Component

Create a new component that will be dynamically loaded.

```tsx
// components/AladinViewer.tsx
'use client';

import React, { useRef, useEffect } from 'react';
import AladinLiteReact, { AladinLiteHandle } from 'aladin-lite-react';

const AladinViewer = () => {
  const aladinRef = useRef<AladinLiteHandle>(null);

  useEffect(() => {
    if (aladinRef.current) {
      const aladin = aladinRef.current.getAladinInstance();
      if (aladin) {
        // Example: Go to the galaxy M31
        aladin.gotoObject('M31');
      }
    }
  }, []);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <AladinLiteReact ref={aladinRef} />
    </div>
  );
};

export default AladinViewer;
```

### 3. Use the Component in a Page

Because Aladin Lite is a client-side library, you must load your component dynamically to disable Server-Side Rendering (SSR).

```tsx
// app/page.tsx
import dynamic from 'next/dynamic';

const AladinViewer = dynamic(() => import('@/components/AladinViewer'), {
  ssr: false,
});

export default function HomePage() {
  return (
    <main style={{ height: '100vh', width: '100vw' }}>
      <AladinViewer />
    </main>
  );
}
```

## Using Next.js and Tailwind CSS

The `example-tailwind` directory demonstrates a more advanced setup using Next.js and Tailwind CSS. Here's a breakdown of the key concepts:

### 1. Project Setup

- **Dependencies**: The project uses `next`, `react`, `react-dom`, `tailwindcss`, `postcss`, and `autoprefixer`. `aladin-lite-react` is included as a local dependency.
- **Tailwind CSS Configuration**:
    - `tailwind.config.ts`: Configures the paths to your components and pages for Tailwind's class scanning.
    - `postcss.config.js`: Sets up the Tailwind CSS and Autoprefixer plugins.
    - `app/globals.css`: Includes the base Tailwind directives.

### 2. Component Structure

- **`app/layout.tsx`**: The root layout for the application. It imports the necessary global CSS files, including `aladin-lite-react/dist/aladin.css`.
- **`app/page.tsx`**: The main page of the application. It manages the state of the Aladin Lite viewer and renders the control panel and the viewer itself.
- **`components/AladinViewer.tsx`**: A wrapper component for `AladinLiteReact`. This component is dynamically imported into `app/page.tsx` to prevent SSR issues.

### 3. State Management and Props

The `app/page.tsx` component manages the state of the Aladin Lite viewer using `useState`. This state is then passed down to the `AladinViewer` component as props. This is a declarative approach to controlling the child component.

- **`target`**: The celestial object to view.
- **`fov`**: The field of view.
- **`layers`**: An array of `SurveyOptions` objects that define the base and overlay layers.

### 4. Dynamic Loading

As in the basic example, the `AladinViewer` component is loaded dynamically with `ssr: false` to ensure it only runs on the client side.

```tsx
const AladinViewer = dynamic(() => import('@/components/AladinViewer'), {
  ssr: false,
});
```

This setup provides a robust and scalable way to integrate Aladin Lite into a modern React application, with a clear separation of concerns between the state management in the parent component and the rendering logic in the child component.

## Building the SPHEREx Example

The `example-spherex` directory contains an example application that uses Next.js and Tailwind CSS. To build this example, you may need to manually install `autoprefixer`:

```bash
npm install autoprefixer --prefix example-spherex
```

Then, you can build the application:

```bash
npm run build --prefix example-spherex
```

## Props

| Prop      | Type                               | Description                                                                                             |
| --------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `options` | `Record<string, any>`              | An object of options to pass to the Aladin Lite instance. See the [Aladin Lite documentation](https://aladin.cds.unistra.fr/aladin-lite/doc/API/Aladin.html#aladin) for available options. |
| `onReady` | `(instance: any) => void`          | A callback function that is called when the Aladin Lite instance is ready.                               |
| `className` | `string`                           | A CSS class to apply to the Aladin Lite container.                                                      |
| `layers`  | `SurveyOptions[]`                  | An array of survey objects to display. The first layer is the base layer, and subsequent layers are overlays. |
| `projection` | `string`                        | The projection type (e.g., 'SIN', 'MOL', 'AIT').                                                        |
| `cooFrame`   | `string`                        | The coordinate frame (e.g., 'ICRS', 'Galactic').                                                        |

### The `layers` Prop

The `layers` prop is an array of `SurveyOptions` objects. Each object defines a sky survey to be displayed.

```typescript
export interface SurveyOptions {
  id: string;
  name: string;
  url: string;
  frame: string;
  order: number;
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

- **`id`**: A unique identifier for the layer.
- **`name`**: The display name of the layer.
- **`url`**: The URL of the HiPS survey.
- **`frame`**: The coordinate frame (e.g., 'equatorial').
- **`order`**: The drawing order of the layer.
- **`options`**: An object for additional layer properties:
  - **`opacity`**: A number between `0.0` (fully transparent) and `1.0` (fully opaque).
  - **`minCut` / `maxCut`**: Numbers between `0.0` and `1.0` that define the relative intensity cuts for the layer's color map. They represent the percentage of the data range to clip.

## Accessing the Aladin Lite Instance

You can access the Aladin Lite instance using a `ref` and the `getAladinInstance` method. This allows you to call any of the methods on the Aladin Lite instance.


```tsx
const aladinRef = useRef<AladinLiteHandle>(null);

useEffect(() => {
  if (aladinRef.current) {
    const aladin = aladinRef.current.getAladinInstance();
    if (aladin) {
      aladin.gotoObject('M31');
    }
  }
}, []);

<AladinLiteReact ref={aladinRef} />
```

## License

This project is licensed under the ISC License.
