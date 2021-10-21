import * as React from 'react';

const useIsMobile = (mobileScreenSize = 768) => {
  const mediaListener = window.matchMedia(`(max-width: ${mobileScreenSize}px)`);
  const [isMobile, setIsMobile] = React.useState(mediaListener.matches);

  const checkIsMobile = (event) => {
    setIsMobile(event.matches);
  };

  React.useEffect(() => {
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
  }, []);

  return isMobile;
};

export default useIsMobile;
