import * as React from 'react';
import {render, waitFor, screen, getNodeText} from '@testing-library/react';
import '@testing-library/jest-dom';
import useIsMobile from '../index';

let windowSize = 1024;

const mockRemoveEventListener = jest.fn();
const mockRemoveListener = jest.fn();
let triggerEventListener;

const getMatchMediaQueryResult = (query) => {
  let queryResult = false;
  const sizeParamFromQuery = query.match(/\d+/g);

  if (sizeParamFromQuery.length > 0) {
    const sizeLimit = Number(sizeParamFromQuery[0]);
    queryResult = windowSize <= sizeLimit;
  }

  return queryResult;
}

const DummyComp = ({mobileScreenSize}) => {
  const isMobile = useIsMobile(mobileScreenSize || undefined);
  return (
    <div>Screen is <span data-testid="test-data">{ isMobile ? 'mobile' : 'desktop'}</span></div>
  )
};

describe('useIsMobile hooks on unsupported browsers', () => {
  it('shoud throw error if matchMedia is not supported', () => {
    jest.spyOn(console, 'error');
    console.error.mockImplementation(() => {});

    expect(() => { render(<DummyComp />) }).toThrowError();

    console.error.mockRestore();
  });
});

describe('useIsMobile hooks on outdated browsers', () => {
  beforeAll(() => {
    jest.spyOn(React, 'useEffect').mockImplementation(React.useLayoutEffect);
    Object.defineProperty(window, 'matchMedia', {
      value: (query) => {
        const queryResult = getMatchMediaQueryResult(query);
      
        return {
          media: query,
          matches: queryResult,
          addListener: (cb) => {
            cb({matches: getMatchMediaQueryResult(query)});
          },
          removeListener: mockRemoveListener,
        };
      },
      writable: true
    });
  });

  afterAll(() => {
    React.useEffect.mockRestore();
  });

  it('it should works on outdated browsers', () => {
    render(<DummyComp />);
    const testData = screen.getByTestId('test-data');
    expect(getNodeText(testData)).toBe('desktop');
  });

  it('it should call removeListener on unmount on outdated browsers', () => {
    mockRemoveListener.mockRestore();
    const {unmount} = render(<DummyComp />);
    unmount();
    expect(mockRemoveListener).toHaveBeenCalledTimes(1);
  });
});

describe('useIsMobile hooks', () => {
  beforeAll(() => {
    jest.spyOn(React, 'useEffect').mockImplementation(React.useLayoutEffect);
    Object.defineProperty(window, 'matchMedia', {
      value: (query) => {
        return {
          media: query,
          matches: getMatchMediaQueryResult(query),
          addEventListener: (_name, cb) => {
            triggerEventListener = () => cb({ matches: getMatchMediaQueryResult(query) });
            triggerEventListener();
          },
          removeEventListener: mockRemoveEventListener,
        };
      },
      writable: true
    });
  });

  afterAll(() => {
    React.useEffect.mockRestore();
  });

  afterEach(() => {
    windowSize = 1024;
  });

  it('should return false on desktop at first render', () => {
    render(<DummyComp />);
    const testData = screen.getByTestId('test-data');
    expect(getNodeText(testData)).toBe('desktop');
  });

  it('should return true on mobile at first render', () => {
    windowSize = 768;
    render(<DummyComp />);
    const testData = screen.getByTestId('test-data');
    expect(getNodeText(testData)).toBe('mobile');
  });

  it('should return true on when screen resize from desktop to mobile', async () => {
    render(<DummyComp />);
    windowSize = 768;
    await waitFor(() => {
      triggerEventListener();
      const testData = screen.getByTestId('test-data');
      expect(getNodeText(testData)).toBe('mobile');
    });
  });

  it('should return false on when screen resize from mobile to desktop', async () => {
    windowSize = 768;
    render(<DummyComp />);
    windowSize = 1024;
    await waitFor(() => {
      triggerEventListener();
      const testData = screen.getByTestId('test-data');
      expect(getNodeText(testData)).toBe('desktop');
    });
  });

  it('should remove eventListener on unmount', () => {
    mockRemoveEventListener.mockRestore();
    const {unmount} = render(<DummyComp />);
    unmount();
    expect(mockRemoveEventListener).toHaveBeenCalledTimes(1);
  });

  it('should works as expected when gives custom mobile screen size', async () => {
    windowSize = 768;
    render(<DummyComp mobileScreenSize={320} />);
    const testData = screen.getByTestId('test-data');
    expect(getNodeText(testData)).toBe('desktop');

    windowSize = 320;
    await waitFor(() => {
      triggerEventListener();
      const newTestData = screen.getByTestId('test-data');
      expect(getNodeText(newTestData)).toBe('mobile');
    });
  })
});