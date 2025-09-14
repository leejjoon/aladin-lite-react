# How to Call a Child Component's Method from a Parent in Next.js

This guide explains a reliable pattern for a parent component to call a method on a child component, especially when the child is loaded using `next/dynamic`.

This pattern is useful when standard `React.forwardRef` fails, which can sometimes happen in complex scenarios involving linked libraries (`npm link`) or other build tool intricacies.

## The Problem

You have a child component with an internal function (e.g., `gotoObject`) that you need to trigger from its parent (e.g., by clicking a button in the parent). You might try to use `useRef` and `forwardRef` to get a handle on the child component, but find that the `ref` is not being attached, resulting in `ref.current` being `null`.

## The Solution: The Callback Pattern

Instead of the parent trying to "reach down" into the child with a `ref`, the child will "pass up" its API (its functions) to the parent when it's ready.

This pattern involves three parts:
1.  **The Child Component**: Accepts a callback prop (e.g., `onApiReady`). When its internal state is ready, it calls this prop with an object containing the functions the parent can use.
2.  **The Parent Component**: Passes the callback prop to the child. It uses a `useRef` to store the API object it receives from the child.
3.  **The API Interface**: A TypeScript `interface` is used to define the shape of the API object, ensuring type safety.

---

### Step 1: Define the API in the Child Component

In `components/AladinViewer.tsx`, we define the `AladinViewerApi` and accept an `onApiReady` prop. We no longer need `forwardRef` or `useImperativeHandle`.

```tsx
// components/AladinViewer.tsx
'use client';

import React, { useRef } from 'react';
import AladinLiteReact, { AladinLiteHandle, AladinInstance } from 'aladin-lite-react';

// 1. Define the API the parent can use
export interface AladinViewerApi {
  gotoObject: (target: string) => void;
}

// 2. Define the component's props, including the callback
interface AladinViewerProps {
  onReady?: () => void; // For UI state like disabling buttons
  onApiReady?: (api: AladinViewerApi) => void; // To pass the API up
}

const AladinViewer = ({ onReady, onApiReady }: AladinViewerProps) => {
  const aladinRef = useRef<AladinLiteHandle>(null);

  const handleOnReady = (aladin: AladinInstance) => {
    if (aladin) {
      // 3. When the instance is ready, pass the API to the parent
      if (onApiReady) {
        onApiReady({
          gotoObject: (target: string) => {
            aladin.gotoObject(target);
          }
        });
      }

      // (Other initialization logic...)

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
```

### Step 2: Receive the API in the Parent Component

In `app/page.tsx`, the parent component implements the `onApiReady` callback. It stores the received API object in a `ref` so it can be accessed later by event handlers like `handleGotoClick`.

```tsx
// app/page.tsx
'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
// 1. Import the API interface from the child
import type { AladinViewerApi } from '@/components/AladinViewer';

const AladinViewer = dynamic(() => import('@/components/AladinViewer'), {
  ssr: false,
});

export default function HomePage() {
  // 2. Create a ref to hold the child's API
  const aladinApiRef = useRef<AladinViewerApi | null>(null);
  const [isAladinReady, setIsAladinReady] = useState(false);

  const handleGotoClick = () => {
    // 4. Use the stored API
    aladinApiRef.current?.gotoObject('M31');
  };

  return (
    <div className="flex h-screen">
      <aside>
        <button
          onClick={handleGotoClick}
          disabled={!isAladinReady}
        >
          Go to M31
        </button>
      </aside>
      <main className="flex-1">
        <AladinViewer
          onReady={() => setIsAladinReady(true)}
          // 3. Pass the callback to the child to receive and store the API
          onApiReady={(api) => {
            aladinApiRef.current = api;
          }}
        />
      </main>
    </div>
  );
}
```
