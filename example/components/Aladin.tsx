'use client';

import React, { useRef, useEffect } from 'react';
import AladinLiteReact, { AladinLiteHandle } from 'aladin-lite-react';

const Aladin = () => {
  const aladinRef = useRef<AladinLiteHandle>(null);

  // Define the options for Aladin Lite, including the starting survey
  const aladinOptions = {
    survey: "http://localhost:8099",
    fov: 60, // Field of View in degrees
  };

  useEffect(() => {
    if (aladinRef.current) {
      const aladin = aladinRef.current.getAladinInstance();
      if (aladin) {
        // You can still interact with the instance after initialization
        // For example, go to a different object after a delay
        setTimeout(() => {
          aladin.gotoObject('M1');
        }, 2000);
      }
    }
  }, []);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <AladinLiteReact ref={aladinRef} options={aladinOptions} />
    </div>
  );
};

export default Aladin;