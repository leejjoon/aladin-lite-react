'use client';

import { useState, useRef, ReactNode, cloneElement, ReactElement } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  text: string;
  children: ReactNode;
}

const Tooltip = ({ text, children }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const childRef = useRef<HTMLElement>(null);

  const handleMouseEnter = () => {
    if (childRef.current) {
      const rect = childRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom,
        left: rect.left,
      });
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  const childWithRef = cloneElement(children as ReactElement, {
    ref: childRef,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  });

  return (
    <>
      {childWithRef}
      {isVisible &&
        createPortal(
          <div
            className="absolute z-50 px-2 py-1 text-sm font-medium text-white bg-gray-900 rounded-md shadow-sm opacity-90 whitespace-nowrap"
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
              marginTop: '8px', // Add a small gap
            }}
          >
            {text}
          </div>,
          document.body
        )}
    </>
  );
};

export default Tooltip;