import * as React from 'react'

const useIsMobile = (mobileScreenSize = 768, options = {}) => {
  const { debounce = 0, enableOrientation = false } = options

  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    throw new Error('matchMedia not supported by browser!')
  }

  if (typeof mobileScreenSize !== 'number' || mobileScreenSize < 0) {
    throw new TypeError('mobileScreenSize must be a positive number')
  }

  if (typeof debounce !== 'number' || debounce < 0) {
    throw new TypeError('debounce must be a positive number')
  }

  const [isMobile, setIsMobile] = React.useState(
    window.matchMedia(`(max-width: ${mobileScreenSize}px)`).matches
  )
  const [orientation, setOrientation] = React.useState(
    enableOrientation
      ? window.matchMedia('(orientation: portrait)').matches
        ? 'portrait'
        : 'landscape'
      : null
  )

  const checkIsMobile = React.useCallback(
    (event) => {
      if (debounce > 0) {
        const timer = setTimeout(() => {
          setIsMobile(event.matches)
        }, debounce)
        return () => clearTimeout(timer)
      }
      setIsMobile(event.matches)
    },
    [debounce]
  )

  const checkOrientation = React.useCallback((event) => {
    setOrientation(event.matches ? 'portrait' : 'landscape')
  }, [])

  React.useEffect(() => {
    const mediaListener = window.matchMedia(
      `(max-width: ${mobileScreenSize}px)`
    )
    checkIsMobile({ matches: mediaListener.matches })

    try {
      mediaListener.addEventListener('change', checkIsMobile)
    } catch {
      mediaListener.addListener(checkIsMobile)
    }

    let orientationCleanup
    if (enableOrientation && typeof window.matchMedia === 'function') {
      const orientationListener = window.matchMedia('(orientation: portrait)')
      setOrientation(orientationListener.matches ? 'portrait' : 'landscape')

      try {
        orientationListener.addEventListener('change', checkOrientation)
      } catch {
        orientationListener.addListener(checkOrientation)
      }

      orientationCleanup = () => {
        try {
          orientationListener.removeEventListener('change', checkOrientation)
        } catch {
          orientationListener.removeListener(checkOrientation)
        }
      }
    }

    return () => {
      try {
        mediaListener.removeEventListener('change', checkIsMobile)
      } catch {
        mediaListener.removeListener(checkIsMobile)
      }
      if (orientationCleanup) orientationCleanup()
    }
  }, [mobileScreenSize, checkIsMobile, enableOrientation, checkOrientation])

  if (enableOrientation) {
    return { isMobile, orientation }
  }

  return isMobile
}

export default useIsMobile
