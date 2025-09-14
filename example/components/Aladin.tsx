'use client';

import React, { useRef, useEffect } from 'react';
import AladinLiteReact, { AladinLiteHandle } from 'aladin-lite-react';

// We will load the CSS in the layout
// import 'aladin-lite/dist/aladin-lite.css';

const Aladin = () => {
  const aladinRef = useRef<AladinLiteHandle>(null);

  useEffect(() => {
    if (aladinRef.current) {
      const aladin = aladinRef.current.getAladinInstance();
      if (aladin) {
        aladin.gotoObject('M1');
      }
    }
  }, []);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <AladinLiteReact ref={aladinRef} />
    </div>
  );
};

export default Aladin;
