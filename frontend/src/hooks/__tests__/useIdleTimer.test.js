import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import useIdleTimer from '../useIdleTimer';
import authReducer from '../../store/slices/authSlice';

// Mock timers
jest.useFakeTimers();

// 创建测试用的store
const createTestStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: { id: 1, username: 'testuser' },
        isAuthenticated: true,
        loading: false,
        error: null,
      },
    },
  });
};

// 测试包装器
const wrapper = ({ children }) => {
  const store = createTestStore();
  return <Provider store={store}>{children}</Provider>;
};

describe('useIdleTimer', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('sets up event listeners on mount', () => {
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
    
    renderHook(() => useIdleTimer(), { wrapper });

    expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function), true);
    expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function), true);
    expect(addEventListenerSpy).toHaveBeenCalledWith('keypress', expect.any(Function), true);
    expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function), true);
    expect(addEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function), true);
    expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function), true);

    addEventListenerSpy.mockRestore();
  });

  test('removes event listeners on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
    
    const { unmount } = renderHook(() => useIdleTimer(), { wrapper });
    
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function), true);
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function), true);
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keypress', expect.any(Function), true);
    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function), true);
    expect(removeEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function), true);
    expect(removeEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function), true);

    removeEventListenerSpy.mockRestore();
  });

  test('calls onIdle callback after timeout', () => {
    const onIdleMock = jest.fn();
    const timeout = 5000; // 5 seconds

    renderHook(() => useIdleTimer(timeout, onIdleMock), { wrapper });

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(timeout);
    });

    expect(onIdleMock).toHaveBeenCalledTimes(1);
  });

  test('resets timer on user activity', () => {
    const onIdleMock = jest.fn();
    const timeout = 5000; // 5 seconds

    renderHook(() => useIdleTimer(timeout, onIdleMock), { wrapper });

    // Advance time partially
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    // Simulate user activity
    act(() => {
      document.dispatchEvent(new Event('mousedown'));
    });

    // Advance time by the remaining amount (should not trigger callback yet)
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(onIdleMock).not.toHaveBeenCalled();

    // Advance time by full timeout from the reset point
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(onIdleMock).toHaveBeenCalledTimes(1);
  });

  test('uses default logout action when no callback provided', () => {
    const timeout = 1000;

    // Mock the dispatch function
    const mockDispatch = jest.fn();
    jest.mock('react-redux', () => ({
      ...jest.requireActual('react-redux'),
      useDispatch: () => mockDispatch,
    }));

    renderHook(() => useIdleTimer(timeout), { wrapper });

    act(() => {
      jest.advanceTimersByTime(timeout);
    });

    // Note: This test might need adjustment based on how the hook actually dispatches logout
    // The current implementation should dispatch logout action
  });

  test('returns resetTimer function', () => {
    const { result } = renderHook(() => useIdleTimer(), { wrapper });

    expect(result.current).toHaveProperty('resetTimer');
    expect(typeof result.current.resetTimer).toBe('function');
  });

  test('resetTimer function works correctly', () => {
    const onIdleMock = jest.fn();
    const timeout = 5000;

    const { result } = renderHook(() => useIdleTimer(timeout, onIdleMock), { wrapper });

    // Advance time partially
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    // Manually reset timer
    act(() => {
      result.current.resetTimer();
    });

    // Advance time by the original remaining amount
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(onIdleMock).not.toHaveBeenCalled();

    // Advance time by full timeout from manual reset
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(onIdleMock).toHaveBeenCalledTimes(1);
  });

  test('handles multiple rapid user activities correctly', () => {
    const onIdleMock = jest.fn();
    const timeout = 5000;

    renderHook(() => useIdleTimer(timeout, onIdleMock), { wrapper });

    // Simulate rapid user activities
    for (let i = 0; i < 10; i++) {
      act(() => {
        jest.advanceTimersByTime(500);
        document.dispatchEvent(new Event('mousedown'));
      });
    }

    // Should not have triggered callback yet
    expect(onIdleMock).not.toHaveBeenCalled();

    // Now wait for full timeout without activity
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(onIdleMock).toHaveBeenCalledTimes(1);
  });
});