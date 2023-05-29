import { useState, useEffect, useCallback } from "react";

const useIsMobile = (mobileScreenSize = 768) => {
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia(`(max-width: ${mobileScreenSize}px)`).matches
  );

  // Check if the screen size is less than the mobile screen size
  const checkIsMobile = useCallback((event) => {
    setIsMobile(event.matches);
  }, []);

  // Add a listener for the screen size
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

    // Remove the event listener from the media query
    const removeListener = (listener) => {
      if (typeof listener.removeEventListener === "function") {
        listener.removeEventListener("change", handleChange);
      } else if (typeof listener.removeListener === "function") {
        listener.removeListener(handleChange);
      }
    };

    // Add the event listener to the media query
    addListener(mediaListener);

    // Clean up the event listener on component unmount
    return () => {
      removeListener(mediaListener);
    };
  }, [checkIsMobile, mobileScreenSize]);

  return isMobile;
};

export default useIsMobile;
