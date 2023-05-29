import { useState, useEffect, useCallback } from "react";

const useIsMobile = (mobileScreenSize = 768) => {
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia(`(max-width: ${mobileScreenSize}px)`).matches
  );

  const checkIsMobile = useCallback((event) => {
    setIsMobile(event.matches);
  }, []);

  useEffect(() => {
    const mediaListener = window.matchMedia(
      `(max-width: ${mobileScreenSize}px)`
    );

    const handleChange = (event) => {
      checkIsMobile(event);
    };

    const addListener = (listener) => {
      if (typeof listener.addEventListener === "function") {
        listener.addEventListener("change", handleChange);
      } else if (typeof listener.addListener === "function") {
        listener.addListener(handleChange);
      }
    };

    const removeListener = (listener) => {
      if (typeof listener.removeEventListener === "function") {
        listener.removeEventListener("change", handleChange);
      } else if (typeof listener.removeListener === "function") {
        listener.removeListener(handleChange);
      }
    };

    addListener(mediaListener);

    return () => {
      removeListener(mediaListener);
    };
  }, [checkIsMobile, mobileScreenSize]);

  return isMobile;
};

export default useIsMobile;
