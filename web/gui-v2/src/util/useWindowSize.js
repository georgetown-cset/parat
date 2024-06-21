import { useEffect, useState } from 'react';

const DEFAULT_WIDTH = 1100;

/**
 * Return the current width of the browser viewport.
 *
 * @returns {number} The current width of the viewport (in px).  This width
 *     updates as the user resizes the viewport.
 */
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState(() => {
    if ( typeof window !== "undefined" ) {
      return window.innerWidth;
    } else {
      return DEFAULT_WIDTH;
    }
  });

  useEffect(() => {
    const handleResize = () => setWindowSize(window?.innerWidth ?? DEFAULT_WIDTH);
    if ( typeof window !== "undefined" ) {
      window.addEventListener("resize", handleResize);
    }
    handleResize();

    return () => {
      if ( typeof window !== "undefined" ) {
        window.removeEventListener("resize", handleResize);
      }
    }
  });

  return windowSize;
};
