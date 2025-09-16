
# Aladin Lite React Developer Manual

## Overview

This document provides a developer-focused overview of the `aladin-lite-react` component, detailing its architecture, development practices, and the relationship between the React wrapper and the underlying `aladin-lite` library.

## Architecture

The `aladin-lite-react` component is a React wrapper around the imperative `aladin-lite` library. It aims to provide a declarative API for controlling the sky atlas, making it easier to integrate into modern React applications.

### Core Components

-   **`AladinLiteReact` (in `index.tsx`):** This is the main functional component. It uses `forwardRef` to allow parent components to access the underlying `aladin-lite` instance.
-   **`useThrottledCallback` (in `index.tsx`):** A utility hook to throttle callbacks, which can be useful for handling frequent events like zooming.
-   **`aladin-lite.d.ts`:** A TypeScript declaration file that provides type information for the `aladin-lite` library.
-   **`aladin.css`:** The CSS file required by the `aladin-lite` library.

### Key Architectural Concepts

#### 1. Declarative Control via Props

The component's primary design principle is to control the `aladin-lite` instance through React props. This is achieved by using `useEffect` hooks to watch for changes in props like `target`, `fov`, `layers`, `projection`, and `cooFrame`. When a prop changes, the corresponding method on the `aladin-lite` instance is called to update the view.

#### 2. Layer Management

The `layers` prop is the most complex part of the component. It manages both the base layer and any overlay layers. The component maintains a `Set` of `managedLayerIds` to keep track of the layers it has created. When the `layers` prop changes, the component performs a reconciliation process:

-   It compares the new layers with the existing ones.
-   It adds any new overlay layers.
-   It removes any overlay layers that are no longer present.
-   It updates the properties of existing layers (e.g., opacity, cuts).

This allows for a fully declarative approach to managing layers, which is a significant improvement over the imperative API of `aladin-lite`.

#### 3. Accessing the Imperative API

While the component strives to be declarative, it also provides an escape hatch to the underlying `aladin-lite` instance via the `getAladinInstance` method on the component's ref. This is useful for advanced use cases that are not covered by the component's props.

## Development Practices

### State Management

The component uses a combination of `useState` and `useRef` to manage its state.

-   `useState` is used for the `aladin` instance itself.
-   `useRef` is used to store the `aladinRef` (a reference to the DOM element), and the `managedLayerIds`.

### Asynchronous Initialization

The `aladin-lite` library is loaded asynchronously using `import('aladin-lite')`. The component waits for the library to be initialized before creating the `aladin` instance.

### Event Handling

The component uses `useEffect` to attach and detach event listeners to the `aladin-lite` instance. For example, it listens for the `zoomChanged` event and calls the `onZoomChanged` prop when it fires.

## Missing Features from `aladin-lite`

The `aladin-lite-react` component does not implement all of the features available in the `aladin-lite` library. The following is a non-exhaustive list of features that are not currently available through the React component's props:

-   **Catalog Management:** The `aladin-lite` library has extensive support for adding and managing catalogs from various sources (e.g., Simbad, VizieR, local files). This is not currently exposed through the `aladin-lite-react` component's props. To use catalogs, you must access the `aladin-lite` instance directly.
-   **Graphic Overlays:** `aladin-lite` allows you to draw shapes (e.g., circles, polygons, lines) on the sky view. This is not currently supported by the React component.
-   **Custom UI Controls:** The `aladin-lite` library allows you to add custom UI controls to the interface. This is not currently supported by the React component.
-   **Event Handling:** While the component exposes `onZoomChanged`, `aladin-lite` supports a wider range of events, such as `objectClicked`, `objectHovered`, and `positionChanged`. To use these events, you must attach listeners to the `aladin-lite` instance directly.
-   **Advanced Imaging Controls:** The `aladin-lite` library provides more advanced imaging controls, such as color maps, stretch functions, and additive blending, which are not fully exposed as props in the React component.

For any of these advanced features, you will need to use the `getAladinInstance` method to access the underlying `aladin-lite` instance and call its methods directly.
