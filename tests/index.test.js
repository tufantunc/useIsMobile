import * as React from 'react';
import {render, fireEvent, waitFor, screen, getNodeText} from '@testing-library/react';
import '@testing-library/jest-dom';
import useIsMobile from '../index';

let windowSize = 1024;

const mockRemoveEventListener = jest.fn();
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

window.matchMedia = (query) => {
  const queryResult = getMatchMediaQueryResult(query);

  return {
    media: query,
    matches: queryResult,
    addListener: (cb) => {
      triggerEventListener = () => cb({matches: getMatchMediaQueryResult(query)});
    },
    removeListener: () => {},
    addEventListener: (cb) => {
      cb(queryResult);
    },
    removeEventListener: mockRemoveEventListener,
  };
};

const DummyComp = ({mobileScreenSize = 768}) => {
  const isMobile = useIsMobile(mobileScreenSize);
  return (
    <div>Screen is <span data-testid="test-data">{ isMobile ? 'mobile' : 'desktop'}</span></div>
  )
};

describe('useIsMobile hooks', () => {
  beforeAll(() => {
    jest.spyOn(React, 'useEffect').mockImplementation(React.useLayoutEffect);
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
    });
    const testData = screen.getByTestId('test-data');
    expect(getNodeText(testData)).toBe('mobile');
  });

  it('should return false on when screen resize from mobile to desktop', async () => {
    windowSize = 768;
    render(<DummyComp />);
    windowSize = 1024;
    await waitFor(() => {
      triggerEventListener();
    });
    const testData = screen.getByTestId('test-data');
    expect(getNodeText(testData)).toBe('desktop');
  });

  it('should remove eventListener on unmount', () => {
    mockRemoveEventListener.mockRestore();
    const {unmount} = render(<DummyComp />);
    unmount();
    expect(mockRemoveEventListener).toHaveBeenCalledTimes(1);
  });
});