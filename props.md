# AladinLiteReact Component Props

This document outlines the proposed props for the `AladinLiteReact` component to provide a more declarative and user-friendly API.

## Task List

- [ ] **View Control Props**
  - [x] `target?: string` (Already implemented)
  - [x] `fov?: number`
  - [ ] `projection?: string`
  - [ ] `cooFrame?: 'ICRSd' | 'galactic'`
- [ ] **Data Layer Props**
  - [x] `layers?: SurveyOptions[]`
  - [ ] `catalogs?: CatalogOptions[]`
  - [ ] `overlays?: OverlayOptions[]`
- [ ] **UI & Display Option Props**
  - [ ] `showGrid?: boolean`
  - [ ] `showReticle?: boolean`
  - [ ] `showContextMenu?: boolean`
  - [ ] `showFullscreenControl?: boolean`
- [ ] **Event Handler Props**
  - [ ] `onZoomChanged?: (zoomLevel: number) => void`
  - [ ] `onPositionChanged?: (position: {ra: number, dec: number}) => void`
  - [ ] `onObjectClicked?: (object: any) => void`

---

## Proposed Props API

Below is a detailed breakdown of the recommended props. The goal is to allow users to control the viewer primarily through props, minimizing the need for `ref` and imperative method calls.

### 1. View Control Props

These props control the camera and viewport of the Aladin Lite instance.

#### `target?: string`
- **Status:** Implemented
- **Purpose:** Declaratively set the view to a specific celestial object or coordinates.
- **Implementation:** A `useEffect` hook watches for changes and calls `aladin.gotoObject(target)`.
- **Example:** `<AladinLiteReact target="M31" />`

#### `fov?: number`
- **Status:** Not Started
- **Purpose:** To declaratively control the field of view in degrees.
- **Implementation:** A `useEffect` hook will watch for changes to this prop and call `aladin.setFoV(fov)`.
- **Example:** `<AladinLiteReact fov={10} />`

#### `projection?: string`
- **Status:** Not Started
- **Purpose:** To set the sky projection type (e.g., `'SIN'`, `'AIT'`, `'MOL'`).
- **Implementation:** A `useEffect` will call `aladin.setProjection(projection)`.
- **Example:** `<AladinLiteReact projection="AIT" />`

#### `cooFrame?: 'ICRSd' | 'galactic'`
- **Status:** Not Started
- **Purpose:** To set the coordinate frame.
- **Implementation:** This can be passed during initialization or updated via a `useEffect` if the API supports it.
- **Example:** `<AladinLiteReact cooFrame="galactic" />`

---

### 2. Data Layer Props

Allow users to provide arrays of objects describing what data to display.

#### `layers?: SurveyOptions[]`
- **Status:** Not Started
- **Purpose:** To declaratively manage the stack of HiPS surveys. The first layer in the array is treated as the base layer, and all subsequent layers are stacked on top as overlays.
- **Implementation:** A `useEffect` will reconcile the layers in the Aladin instance with the layers passed in this array, adding, removing, and updating layers as needed.
- **Type Definition:**
  ```typescript
  interface SurveyOptions {
    id: string; // A unique ID for React to track the layer
    name: string;
    url: string;
    frame: string;
    order: number;
    options?: {
      opacity?: number;
      colormap?: string;
      // ... other aladin-lite options
    };
  }
  ```
- **Example:**
  ```tsx
  <AladinLiteReact
    layers={[
      { id: 'DSS', name: 'DSS Colored', url: 'P/DSS2/color', ... },
      { id: '2MASS', name: '2MASS', url: 'P/2MASS/color', options: { opacity: 0.5 }, ... }
    ]}
  />
  ```

#### `catalogs?: CatalogOptions[]`
- **Status:** Not Started
- **Purpose:** To display one or more astronomical catalogs declaratively.
- **Implementation:** A `useEffect` will manage the catalogs, comparing the prop array with currently displayed catalogs to add and remove them as needed.
- **Type Definition:**
  ```typescript
  type CatalogOptions =
    | { type: 'simbad'; target: string; fov: number; options?: any }
    | { type: 'url'; url: string; options?: any }
    | { type: 'vizier'; id: string; target: string; radius: number; options?: any };
  ```
- **Example:**
  ```tsx
  <AladinLiteReact
    catalogs={[
      { type: 'simbad', target: 'M 81', fov: 0.5 },
      { type: 'url', url: 'path/to/catalog.vot' }
    ]}
  />
  ```

#### `overlays?: OverlayOptions[]`
- **Status:** Not Started
- **Purpose:** To draw graphical overlays like polygons, circles, or ellipses.
- **Implementation:** A `useEffect` will manage adding and removing shapes from a graphic overlay layer.
- **Type Definition:**
  ```typescript
  type OverlayOptions =
    | { type: 'circle'; ra: number; dec: number; radius: number; options?: any }
    | { type: 'polygon'; points: [number, number][]; options?: any };
  ```
- **Example:**
  ```tsx
  <AladinLiteReact
    overlays={[
      { type: 'circle', ra: 83.6, dec: 22.0, radius: 0.5, options: { color: 'cyan' } }
    ]}
  />
  ```

---

### 3. UI & Display Option Props

Explicit boolean props for common UI elements, instead of hiding them in the `options` object.

- **`showGrid?: boolean`**
- **`showReticle?: boolean`**
- **`showContextMenu?: boolean`**
- **`showFullscreenControl?: boolean`**

---

### 4. Event Handler Props

Expose Aladin Lite's events as React-style `on...` props for easier integration.

- **`onZoomChanged?: (zoomLevel: number) => void;`**
- **`onPositionChanged?: (position: {ra: number, dec: number}) => void;`**
- **`onObjectClicked?: (object: any) => void;`**
