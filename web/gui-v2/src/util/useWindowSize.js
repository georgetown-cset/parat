import { useEffect, useState } from 'react';

/**
 * Return the current width of the browser viewport.
 *
 * @returns {number} The current width of the viewport (in px).  This width
 *     updates as the user resizes the viewport.
 */
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState(800);

  useEffect(() => {
    const handleResize = () => setWindowSize(window?.innerWidth ?? 800);
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
