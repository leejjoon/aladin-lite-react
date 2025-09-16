
# RGB Compositing in Aladin Lite

A common question for astronomical visualization is whether it's possible to take three separate HiPS (Hierarchical Progressive Surveys) and composite them on-the-fly into a single RGB image by assigning each survey to a color channel (Red, Green, Blue).

The short answer is **no**, Aladin Lite does not have a built-in feature to perform this kind of dynamic, three-channel compositing.

---

### The Aladin Lite Philosophy: A Visualizer, Not a Processor

Aladin Lite is designed to be a highly efficient *visualizer* of pre-processed data. The HiPS format is built on this principle. A standard color HiPS survey that you view in Aladin Lite is *already* an RGB composite. A server has pre-generated color image tiles at every zoom level, and Aladin Lite's job is to simply fetch and display the correct tiles for your current view.

Dynamically combining three separate, deep HiPS surveys in the browser would be extremely resource-intensive. The client (your web browser) would need to:
1.  Fetch three different sets of image tiles for the same area of the sky.
2.  Process the scientific data from each of the three tiles.
3.  Combine them into a single new image tile for display.

This level of work is the domain of image processing software, not a lightweight web viewer designed for speed and responsiveness.

---

### The Standard Approach: Server-Side Compositing

The standard and correct way to achieve true RGB compositing is to create a new, color HiPS survey on a server. You would use specialized tools (like **Hipsgen**) to:
1.  Take your three input surveys (e.g., a survey for a Red filter, a Green filter, and a Blue filter).
2.  Combine them into a single RGB dataset.
3.  Generate the complete HiPS tile hierarchy for this new color survey.

You would then host this new survey and provide its URL to Aladin Lite, which would display it just like any other color survey. This is far more efficient as the heavy processing is done once on the server, not every time a user pans or zooms.

---

### The Workaround: Simulating RGB with Colormaps and Blending

While you cannot do true RGB channel compositing, you can *simulate* it using two powerful Aladin Lite features: **colormaps** and **additive blending**.

This is a clever workaround that can produce visually interesting results, though it may not be scientifically perfect.

Here is the process:

1.  **Load Three Grayscale Surveys:** You load your three surveys as layers. The first will be the base layer, and the other two will be overlays.
2.  **Apply Single-Color Colormaps:** You apply a "red-only" colormap to the first survey, a "green-only" colormap to the second, and a "blue-only" colormap to the third. You will likely need to define these custom colormaps yourself using the underlying Aladin Lite instance.
3.  **Enable Additive Blending:** For the two overlay layers, you must set the `additive: true` option. This ensures that the color values are added together rather than just layered on top of each other.

Here’s how you might approach it in `aladin-lite-react`, using the `ref` to access the Aladin instance for the custom colormaps:

```tsx
import React, { useRef, useEffect } from 'react';
import AladinLite, { AladinLiteHandle, SurveyOptions } from 'aladin-lite-react';

// 1. Define your three grayscale surveys
const redChannelSurvey: SurveyOptions = {
  id: 'SURVEY/RED',
  name: 'Red Channel',
  url: 'path/to/red/survey', // URL to a grayscale HiPS
  frame: 'equatorial',
  options: { colormap: 'red' } // We'll define this colormap below
};

const greenChannelSurvey: SurveyOptions = {
  id: 'SURVEY/GREEN',
  name: 'Green Channel',
  url: 'path/to/green/survey',
  frame: 'equatorial',
  options: { colormap: 'green', additive: true, opacity: 1.0 }
};

const blueChannelSurvey: SurveyOptions = {
  id: 'SURVEY/BLUE',
  name: 'Blue Channel',
  url: 'path/to/blue/survey',
  frame: 'equatorial',
  options: { colormap: 'blue', additive: true, opacity: 1.0 }
};

const App = () => {
  const aladinRef = useRef<AladinLiteHandle>(null);

  const handleReady = (aladin: any) => {
    // 2. Define the single-color colormaps
    // The format is an array of [R, G, B] values from 0-255
    aladin.setColormap('red',   [ [0,0,0], [255,0,0] ]);
    aladin.setColormap('green', [ [0,0,0], [0,255,0] ]);
    aladin.setColormap('blue',  [ [0,0,0], [0,0,255] ]);
  };

  return (
    <div style={{ height: '500px', width: '100%' }}>
      <AladinLite
        ref={aladinRef}
        target="M31"
        fov={1}
        onReady={handleReady}
        // 3. Pass the layers to the component
        layers={[redChannelSurvey, greenChannelSurvey, blueChannelSurvey]}
      />
    </div>
  );
};
```

#### Limitations of this Workaround:
*   **Performance:** The browser is still fetching three sets of tiles for every view, which will be slower and use more bandwidth than fetching one pre-composed set.
*   **Color Balance:** Achieving accurate color balance is very difficult with this method. It is more for qualitative visualization than for precise scientific analysis.
*   **Complexity:** It requires direct access to the Aladin Lite instance to set up the custom colormaps.
