import * as React from 'react';

const useIsMobile = (mobileScreenSize = 768) => {
  if (typeof window.matchMedia !== 'function') {
    throw Error('matchMedia not supported by browser!');
  }
  const [isMobile, setIsMobile] = React.useState(window.matchMedia(`(max-width: ${mobileScreenSize}px)`).matches);

  const checkIsMobile = React.useCallback((event) => {
    setIsMobile(event.matches);
  }, []);

  React.useEffect(() => {
    const mediaListener = window.matchMedia(`(max-width: ${mobileScreenSize}px)`);
    // try catch used to fallback for browser compatibility
    try {
      mediaListener.addEventListener('change', checkIsMobile);
    } catch {
      mediaListener.addListener(checkIsMobile);
    }

    return () => {
      try {
        mediaListener.removeEventListener('change', checkIsMobile);
      } catch {
        mediaListener.removeListener(checkIsMobile);
      }
    }
  }, [mobileScreenSize]);

  return isMobile;
};

export default useIsMobile;
