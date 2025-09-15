# Blueprint for `example-spherex`

This document outlines the plan for creating the `example-spherex` application, a Next.js and Tailwind CSS project demonstrating the use of `aladin-lite-react`.

## 1. Project Scaffolding

-   **Initialize Next.js App**: Create a new Next.js application within the `example-spherex` directory using `npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*"`. I will use the `--use-npm` flag.
-   **Dependencies**:
    -   Install `aladin-lite`.
    -   Add a local dependency to the root `aladin-lite-react` package.
-   **Project Structure**:
    -   `app/`: Main application directory.
    -   `app/layout.tsx`: Root layout, will import global CSS.
    -   `app/page.tsx`: Main page, will contain the sidebar and Aladin viewer.
    -   `components/`: Directory for React components.
    -   `components/AladinViewer.tsx`: A client-side component that wraps `AladinLiteReact` to disable SSR.
    -   `public/`: Static assets.

## 2. Layout and Styling

-   **Layout**: The main page (`app/page.tsx`) will use Flexbox or CSS Grid to create a two-column layout.
    -   **Left Column (Sidebar)**: A fixed-width sidebar containing controls for the Aladin Lite viewer.
    -   **Right Column (Main Content)**: The Aladin Lite viewer, taking up the remaining space.
-   **Styling**: Tailwind CSS will be used for all styling. The application will have a dark theme, similar to the `example-tailwind` project.
-   **CSS Imports**:
    -   `app/globals.css`: Will contain the base Tailwind directives.
    -   `app/layout.tsx`: Will import `globals.css` and `aladin-lite-react/dist/aladin.css`.

## 3. Component Implementation

-   **`components/AladinViewer.tsx`**:
    -   This will be a client component (`'use client'`).
    -   It will import and render the `AladinLiteReact` component.
    -   It will accept props from the parent page to control the viewer's state (e.g., `target`, `fov`, `layers`).
-   **`app/page.tsx`**:
    -   This will also be a client component (`'use client'`).
    -   It will use `next/dynamic` to load `AladinViewer.tsx` with `ssr: false`.
    -   It will manage the state for the Aladin viewer (e.g., `target`, `fov`, `layers`) using `useState`.
    -   The sidebar will contain UI elements (buttons, sliders) that modify this state.

## 4. Functionality

-   The sidebar will have controls to:
    -   Go to a specific celestial object (e.g., by inputting a name).
    -   Adjust the Field of View (FoV) with a slider.
    -   Toggle overlay layers.
    -   Adjust the opacity of overlay layers.
-   The `AladinLiteReact` component will be controlled declaratively through props passed from `app/page.tsx`.

## 5. Development Steps

1.  Create the `example-spherex` directory.
2.  Create this `blueprint.md` file.
3.  Scaffold the Next.js project.
4.  Install dependencies.
5.  Implement the layout and styling.
6.  Create the `AladinViewer` component.
7.  Implement the state management and controls in `app/page.tsx`.
8.  Ensure the application runs correctly.
