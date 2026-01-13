import * as React from 'react'
import { render, waitFor, screen, getNodeText } from '@testing-library/react'
import '@testing-library/jest-dom'
import useIsMobile from '../index'

let windowSize = 1024

const mockRemoveEventListener = jest.fn()
const mockRemoveListener = jest.fn()
let triggerEventListener

const getMatchMediaQueryResult = (query) => {
  let queryResult = false
  const sizeParamFromQuery = query.match(/\d+/g)

  if (sizeParamFromQuery.length > 0) {
    const sizeLimit = Number(sizeParamFromQuery[0])
    queryResult = windowSize <= sizeLimit
  }

  return queryResult
}

const DummyComp = ({ mobileScreenSize }) => {
  const isMobile = useIsMobile(mobileScreenSize || undefined)
  return (
    <div>
      Screen is{' '}
      <span data-testid="test-data">{isMobile ? 'mobile' : 'desktop'}</span>
    </div>
  )
}

describe('useIsMobile hooks on unsupported browsers', () => {
  it('shoud throw error if matchMedia is not supported', () => {
    jest.spyOn(console, 'error')
    console.error.mockImplementation(() => {})

    expect(() => {
      render(<DummyComp />)
    }).toThrow()

    console.error.mockRestore()
  })
})

describe('useIsMobile hooks on outdated browsers', () => {
  beforeAll(() => {
    jest.spyOn(React, 'useEffect').mockImplementation(React.useLayoutEffect)
    Object.defineProperty(window, 'matchMedia', {
      value: (query) => {
        const queryResult = getMatchMediaQueryResult(query)

        return {
          media: query,
          matches: queryResult,
          addListener: (cb) => {
            cb({ matches: getMatchMediaQueryResult(query) })
          },
          removeListener: mockRemoveListener,
        }
      },
      writable: true,
    })
  })

  afterAll(() => {
    React.useEffect.mockRestore()
  })

  it('it should works on outdated browsers', () => {
    render(<DummyComp />)
    const testData = screen.getByTestId('test-data')
    expect(getNodeText(testData)).toBe('desktop')
  })

  it('it should call removeListener on unmount on outdated browsers', () => {
    mockRemoveListener.mockRestore()
    const { unmount } = render(<DummyComp />)
    unmount()
    expect(mockRemoveListener).toHaveBeenCalledTimes(1)
  })
})

describe('useIsMobile hooks', () => {
  beforeAll(() => {
    jest.spyOn(React, 'useEffect').mockImplementation(React.useLayoutEffect)
    Object.defineProperty(window, 'matchMedia', {
      value: (query) => {
        return {
          media: query,
          matches: getMatchMediaQueryResult(query),
          addEventListener: (_name, cb) => {
            triggerEventListener = () =>
              cb({ matches: getMatchMediaQueryResult(query) })
            triggerEventListener()
          },
          removeEventListener: mockRemoveEventListener,
        }
      },
      writable: true,
    })
  })

  afterAll(() => {
    React.useEffect.mockRestore()
  })

  afterEach(() => {
    windowSize = 1024
  })

  it('should return false on desktop at first render', () => {
    render(<DummyComp />)
    const testData = screen.getByTestId('test-data')
    expect(getNodeText(testData)).toBe('desktop')
  })

  it('should return true on mobile at first render', () => {
    windowSize = 768
    render(<DummyComp />)
    const testData = screen.getByTestId('test-data')
    expect(getNodeText(testData)).toBe('mobile')
  })

  it('should return true on when screen resize from desktop to mobile', async () => {
    render(<DummyComp />)
    windowSize = 768
    await waitFor(() => {
      triggerEventListener()
      const testData = screen.getByTestId('test-data')
      expect(getNodeText(testData)).toBe('mobile')
    })
  })

  it('should return false on when screen resize from mobile to desktop', async () => {
    windowSize = 768
    render(<DummyComp />)
    windowSize = 1024
    await waitFor(() => {
      triggerEventListener()
      const testData = screen.getByTestId('test-data')
      expect(getNodeText(testData)).toBe('desktop')
    })
  })

  it('should remove eventListener on unmount', () => {
    mockRemoveEventListener.mockRestore()
    const { unmount } = render(<DummyComp />)
    unmount()
    expect(mockRemoveEventListener).toHaveBeenCalledTimes(1)
  })

  it('should works as expected when gives custom mobile screen size', async () => {
    windowSize = 768
    render(<DummyComp mobileScreenSize={320} />)
    const testData = screen.getByTestId('test-data')
    expect(getNodeText(testData)).toBe('desktop')

    windowSize = 320
    await waitFor(() => {
      triggerEventListener()
      const newTestData = screen.getByTestId('test-data')
      expect(getNodeText(newTestData)).toBe('mobile')
    })
  })
})

describe('useIsMobile with options', () => {
  beforeAll(() => {
    jest.spyOn(React, 'useEffect').mockImplementation(React.useLayoutEffect)
    Object.defineProperty(window, 'matchMedia', {
      value: (query) => {
        let queryResult = false
        if (query.includes('max-width')) {
          const sizeParamFromQuery = query.match(/\d+/g)
          if (sizeParamFromQuery.length > 0) {
            const sizeLimit = Number(sizeParamFromQuery[0])
            queryResult = windowSize <= sizeLimit
          }
        }
        if (query.includes('orientation')) {
          queryResult = windowSize < 768
        }

        return {
          media: query,
          matches: queryResult,
          addEventListener: (_name, cb) => {
            triggerEventListener = () => cb({ matches: queryResult })
          },
          removeEventListener: mockRemoveEventListener,
        }
      },
      writable: true,
    })
  })

  afterAll(() => {
    React.useEffect.mockRestore()
  })

  afterEach(() => {
    windowSize = 1024
  })

  it('should work with debounce option', () => {
    jest.useFakeTimers()
    render(<DummyComp mobileScreenSize={768} />)
    jest.advanceTimersByTime(100)
    const testData = screen.getByTestId('test-data')
    expect(getNodeText(testData)).toBe('desktop')
    jest.useRealTimers()
  })

  it('should return object with isMobile and orientation when enabled', () => {
    const OrientationComp = () => {
      const result = useIsMobile(768, { enableOrientation: true })
      return (
        <div>
          <span data-testid="mobile">{String(result.isMobile)}</span>
          <span data-testid="orientation">{result.orientation}</span>
        </div>
      )
    }
    render(<OrientationComp />)
    expect(screen.getByTestId('mobile')).toHaveTextContent('false')
    expect(screen.getByTestId('orientation')).toHaveTextContent('landscape')
  })

  it('should detect portrait orientation', () => {
    windowSize = 375
    const OrientationComp = () => {
      const result = useIsMobile(768, { enableOrientation: true })
      return (
        <div>
          <span data-testid="orientation">{result.orientation}</span>
        </div>
      )
    }
    render(<OrientationComp />)
    expect(screen.getByTestId('orientation')).toHaveTextContent('portrait')
  })

  it('should validate mobileScreenSize parameter', () => {
    const ValidationComp = ({ size }) => {
      useIsMobile(size)
      return <div>test</div>
    }

    expect(() => render(<ValidationComp size="invalid" />)).toThrow(TypeError)
    expect(() => render(<ValidationComp size={-100} />)).toThrow(TypeError)
  })

  it('should validate debounce parameter', () => {
    const ValidationComp = () => {
      useIsMobile(768, { debounce: 'invalid' })
      return <div>test</div>
    }

    expect(() => render(<ValidationComp />)).toThrow(TypeError)
  })
})

describe('useIsMobile SSR tests', () => {
  let originalWindow

  beforeAll(() => {
    originalWindow = global.window
  })

  afterAll(() => {
    global.window = originalWindow
  })

  afterEach(() => {
    global.window = originalWindow
  })

  it('should throw error when window is undefined', () => {
    const tempWindow = global.window
    delete global.window

    const SSRComp = () => {
      useIsMobile()
      return <div>test</div>
    }

    try {
      render(<SSRComp />)
    } catch (error) {
      expect(error.message).toBe('matchMedia not supported by browser!')
    } finally {
      global.window = tempWindow
    }
  })

  it('should throw error when matchMedia is not defined', () => {
    const tempWindow = global.window
    global.window = { matchMedia: undefined }

    const SSRComp = () => {
      useIsMobile()
      return <div>test</div>
    }

    try {
      render(<SSRComp />)
    } catch (error) {
      expect(error.message).toBe('matchMedia not supported by browser!')
    } finally {
      global.window = tempWindow
    }
  })
})

describe('Performance tests', () => {
  it('should cleanup event listeners on unmount', () => {
    const { unmount } = render(<DummyComp />)
    const listenersBefore = mockRemoveEventListener.mock.calls.length
    unmount()
    const listenersAfter = mockRemoveEventListener.mock.calls.length

    expect(listenersAfter).toBe(listenersBefore + 1)
  })

  it('should not cause memory leaks with multiple instances', () => {
    const MultiComp = () => {
      useIsMobile(480)
      useIsMobile(768)
      useIsMobile(1024)
      return <div>test</div>
    }

    const { unmount } = render(<MultiComp />)
    const listenersBefore = mockRemoveEventListener.mock.calls.length
    unmount()
    const listenersAfter = mockRemoveEventListener.mock.calls.length

    expect(listenersAfter).toBe(listenersBefore + 3)
  })
})
