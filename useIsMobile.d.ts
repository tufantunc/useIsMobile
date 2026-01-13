/**
 * Options for useIsMobile hook
 */
interface UseIsMobileOptions {
  /**
   * Debounce time in milliseconds for resize events (default: 0)
   */
  debounce?: number;
  /**
   * Enable screen orientation detection (default: false)
   * When enabled, returns an object with isMobile and orientation
   */
  enableOrientation?: boolean;
}

/**
 * Result when enableOrientation is true
 */
interface UseIsMobileWithOrientation {
  isMobile: boolean;
  orientation: 'portrait' | 'landscape';
}

/**
 * Detects if the current viewport is mobile based on a max-width media query.
 * @param mobileScreenSize - Maximum screen width in pixels to consider as mobile (default: 768)
 * @param options - Additional options for debounce and orientation detection
 * @returns boolean if orientation disabled, object with isMobile and orientation if enabled
 * @example
 * // Basic usage
 * const isMobile = useIsMobile(); // default threshold: 768px
 *
 * // Custom threshold
 * const isTablet = useIsMobile(1024); // custom threshold: 1024px
 *
 * // With debounce
 * const isMobile = useIsMobile(768, { debounce: 100 });
 *
 * // With orientation
 * const { isMobile, orientation } = useIsMobile(768, { enableOrientation: true });
 */
declare function useIsMobile(
  mobileScreenSize?: number,
  options?: UseIsMobileOptions
): boolean | UseIsMobileWithOrientation;

export default useIsMobile;