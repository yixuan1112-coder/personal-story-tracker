import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import '@testing-library/jest-dom';
import AuthProvider from '../AuthProvider';
import authReducer, { logout, checkAuthStatus } from '../../../store/slices/authSlice';

// Mock useIdleTimer hook
jest.mock('../../../hooks/useIdleTimer', () => {
  return jest.fn((timeout, callback) => {
    // Store the callback for manual triggering in tests
    if (!global.mockIdleCallbacks) {
      global.mockIdleCallbacks = [];
    }
    global.mockIdleCallbacks.push({ timeout, callback });
  });
});

// Mock the LoadingSpinner component
jest.mock('../../../components/Common/LoadingSpinner', () => {
  return function MockLoadingSpinner({ message }) {
    return <div data-testid="loading-spinner">{message}</div>;
  };
});

// 创建测试用的store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        ...initialState.auth,
      },
    },
  });
};

// 测试包装器组件
const TestWrapper = ({ children, initialState = {} }) => {
  const store = createTestStore(initialState);
  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
};

// Mock child component
const MockChildComponent = () => <div data-testid="child-content">Child Content</div>;

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.mockIdleCallbacks = [];
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('renders children when no idle warning is shown', () => {
    render(
      <TestWrapper>
        <AuthProvider>
          <MockChildComponent />
        </AuthProvider>
      </TestWrapper>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.queryByText('会话即将过期')).not.toBeInTheDocument();
  });

  test('sets up idle timers for authenticated users', () => {
    render(
      <TestWrapper initialState={{ auth: { isAuthenticated: true } }}>
        <AuthProvider>
          <MockChildComponent />
        </AuthProvider>
      </TestWrapper>
    );

    // 验证设置了两个空闲计时器（警告和登出）
    expect(global.mockIdleCallbacks).toHaveLength(2);
    
    // 验证计时器的超时时间
    const timeouts = global.mockIdleCallbacks.map(cb => cb.timeout);
    expect(timeouts).toContain(25 * 60 * 1000); // 25分钟警告
    expect(timeouts).toContain(30 * 60 * 1000); // 30分钟登出
  });

  test('shows idle warning dialog when idle warning is triggered', async () => {
    render(
      <TestWrapper initialState={{ auth: { isAuthenticated: true } }}>
        <AuthProvider>
          <MockChildComponent />
        </AuthProvider>
      </TestWrapper>
    );

    // 触发空闲警告
    const warningCallback = global.mockIdleCallbacks.find(
      cb => cb.timeout === 25 * 60 * 1000
    ).callback;

    act(() => {
      warningCallback();
    });

    await waitFor(() => {
      expect(screen.getByText('会话即将过期')).toBeInTheDocument();
      expect(screen.getByText('由于长时间未活动，您的会话即将过期。')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '继续会话' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '立即登出' })).toBeInTheDocument();
    });
  });

  test('does not show idle warning for unauthenticated users', async () => {
    render(
      <TestWrapper initialState={{ auth: { isAuthenticated: false } }}>
        <AuthProvider>
          <MockChildComponent />
        </AuthProvider>
      </TestWrapper>
    );

    // 触发空闲警告
    const warningCallback = global.mockIdleCallbacks.find(
      cb => cb.timeout === 25 * 60 * 1000
    ).callback;

    act(() => {
      warningCallback();
    });

    await waitFor(() => {
      expect(screen.queryByText('会话即将过期')).not.toBeInTheDocument();
    });
  });

  test('shows countdown timer in idle warning dialog', async () => {
    render(
      <TestWrapper initialState={{ auth: { isAuthenticated: true } }}>
        <AuthProvider>
          <MockChildComponent />
        </AuthProvider>
      </TestWrapper>
    );

    // 触发空闲警告
    const warningCallback = global.mockIdleCallbacks.find(
      cb => cb.timeout === 25 * 60 * 1000
    ).callback;

    act(() => {
      warningCallback();
    });

    await waitFor(() => {
      expect(screen.getByText('会话即将过期')).toBeInTheDocument();
    });

    // 验证倒计时显示（应该显示5:00）
    expect(screen.getByText(/5:00/)).toBeInTheDocument();
  });

  test('countdown timer decreases over time', async () => {
    render(
      <TestWrapper initialState={{ auth: { isAuthenticated: true } }}>
        <AuthProvider>
          <MockChildComponent />
        </AuthProvider>
      </TestWrapper>
    );

    // 触发空闲警告
    const warningCallback = global.mockIdleCallbacks.find(
      cb => cb.timeout === 25 * 60 * 1000
    ).callback;

    act(() => {
      warningCallback();
    });

    await waitFor(() => {
      expect(screen.getByText(/5:00/)).toBeInTheDocument();
    });

    // 前进1秒
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.getByText(/4:59/)).toBeInTheDocument();
    });
  });

  test('automatically logs out when countdown reaches zero', async () => {
    const store = createTestStore({ auth: { isAuthenticated: true } });
    const logoutSpy = jest.spyOn(store, 'dispatch');

    render(
      <Provider store={store}>
        <AuthProvider>
          <MockChildComponent />
        </Provider>
      </Provider>
    );

    // 触发空闲警告
    const warningCallback = global.mockIdleCallbacks.find(
      cb => cb.timeout === 25 * 60 * 1000
    ).callback;

    act(() => {
      warningCallback();
    });

    await waitFor(() => {
      expect(screen.getByText('会话即将过期')).toBeInTheDocument();
    });

    // 快进到倒计时结束
    act(() => {
      jest.advanceTimersByTime(5 * 60 * 1000); // 5分钟
    });

    await waitFor(() => {
      expect(logoutSpy).toHaveBeenCalledWith(expect.objectContaining({
        type: logout.pending.type
      }));
    });

    // 对话框应该关闭
    expect(screen.queryByText('会话即将过期')).not.toBeInTheDocument();
  });

  test('continue session button works correctly', async () => {
    const store = createTestStore({ auth: { isAuthenticated: true } });
    const checkAuthSpy = jest.spyOn(store, 'dispatch');

    render(
      <Provider store={store}>
        <AuthProvider>
          <MockChildComponent />
        </Provider>
      </Provider>
    );

    // 触发空闲警告
    const warningCallback = global.mockIdleCallbacks.find(
      cb => cb.timeout === 25 * 60 * 1000
    ).callback;

    act(() => {
      warningCallback();
    });

    await waitFor(() => {
      expect(screen.getByText('会话即将过期')).toBeInTheDocument();
    });

    // 点击继续会话按钮
    const continueButton = screen.getByRole('button', { name: '继续会话' });
    fireEvent.click(continueButton);

    await waitFor(() => {
      // 对话框应该关闭
      expect(screen.queryByText('会话即将过期')).not.toBeInTheDocument();
      
      // 应该调用checkAuthStatus
      expect(checkAuthSpy).toHaveBeenCalledWith(expect.objectContaining({
        type: checkAuthStatus.pending.type
      }));
    });
  });

  test('logout now button works correctly', async () => {
    const store = createTestStore({ auth: { isAuthenticated: true } });
    const logoutSpy = jest.spyOn(store, 'dispatch');

    render(
      <Provider store={store}>
        <AuthProvider>
          <MockChildComponent />
        </Provider>
      </Provider>
    );

    // 触发空闲警告
    const warningCallback = global.mockIdleCallbacks.find(
      cb => cb.timeout === 25 * 60 * 1000
    ).callback;

    act(() => {
      warningCallback();
    });

    await waitFor(() => {
      expect(screen.getByText('会话即将过期')).toBeInTheDocument();
    });

    // 点击立即登出按钮
    const logoutButton = screen.getByRole('button', { name: '立即登出' });
    fireEvent.click(logoutButton);

    await waitFor(() => {
      // 对话框应该关闭
      expect(screen.queryByText('会话即将过期')).not.toBeInTheDocument();
      
      // 应该调用logout
      expect(logoutSpy).toHaveBeenCalledWith(expect.objectContaining({
        type: logout.pending.type
      }));
    });
  });

  test('auto logout is triggered after 30 minutes for authenticated users', async () => {
    const store = createTestStore({ auth: { isAuthenticated: true } });
    const logoutSpy = jest.spyOn(store, 'dispatch');

    render(
      <Provider store={store}>
        <AuthProvider>
          <MockChildComponent />
        </Provider>
      </Provider>
    );

    // 触发自动登出
    const autoLogoutCallback = global.mockIdleCallbacks.find(
      cb => cb.timeout === 30 * 60 * 1000
    ).callback;

    act(() => {
      autoLogoutCallback();
    });

    await waitFor(() => {
      expect(logoutSpy).toHaveBeenCalledWith(expect.objectContaining({
        type: logout.pending.type
      }));
    });
  });

  test('auto logout is not triggered for unauthenticated users', async () => {
    const store = createTestStore({ auth: { isAuthenticated: false } });
    const logoutSpy = jest.spyOn(store, 'dispatch');

    render(
      <Provider store={store}>
        <AuthProvider>
          <MockChildComponent />
        </Provider>
      </Provider>
    );

    // 触发自动登出
    const autoLogoutCallback = global.mockIdleCallbacks.find(
      cb => cb.timeout === 30 * 60 * 1000
    ).callback;

    act(() => {
      autoLogoutCallback();
    });

    await waitFor(() => {
      expect(logoutSpy).not.toHaveBeenCalled();
    });
  });

  test('formats countdown correctly', async () => {
    render(
      <TestWrapper initialState={{ auth: { isAuthenticated: true } }}>
        <AuthProvider>
          <MockChildComponent />
        </AuthProvider>
      </TestWrapper>
    );

    // 触发空闲警告
    const warningCallback = global.mockIdleCallbacks.find(
      cb => cb.timeout === 25 * 60 * 1000
    ).callback;

    act(() => {
      warningCallback();
    });

    await waitFor(() => {
      expect(screen.getByText('会话即将过期')).toBeInTheDocument();
    });

    // 验证不同的倒计时格式
    expect(screen.getByText(/5:00/)).toBeInTheDocument();

    // 前进到4分30秒
    act(() => {
      jest.advanceTimersByTime(30 * 1000);
    });

    await waitFor(() => {
      expect(screen.getByText(/4:30/)).toBeInTheDocument();
    });

    // 前进到1分05秒
    act(() => {
      jest.advanceTimersByTime(3 * 60 * 1000 + 25 * 1000);
    });

    await waitFor(() => {
      expect(screen.getByText(/1:05/)).toBeInTheDocument();
    });
  });

  test('dialog cannot be closed by escape key', async () => {
    render(
      <TestWrapper initialState={{ auth: { isAuthenticated: true } }}>
        <AuthProvider>
          <MockChildComponent />
        </AuthProvider>
      </TestWrapper>
    );

    // 触发空闲警告
    const warningCallback = global.mockIdleCallbacks.find(
      cb => cb.timeout === 25 * 60 * 1000
    ).callback;

    act(() => {
      warningCallback();
    });

    await waitFor(() => {
      expect(screen.getByText('会话即将过期')).toBeInTheDocument();
    });

    // 尝试按ESC键
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

    // 对话框应该仍然存在
    expect(screen.getByText('会话即将过期')).toBeInTheDocument();
  });

  test('cleans up timers when component unmounts', () => {
    const { unmount } = render(
      <TestWrapper initialState={{ auth: { isAuthenticated: true } }}>
        <AuthProvider>
          <MockChildComponent />
        </AuthProvider>
      </TestWrapper>
    );

    // 触发空闲警告以启动倒计时
    const warningCallback = global.mockIdleCallbacks.find(
      cb => cb.timeout === 25 * 60 * 1000
    ).callback;

    act(() => {
      warningCallback();
    });

    // 卸载组件
    unmount();

    // 验证没有内存泄漏（通过检查没有错误抛出）
    act(() => {
      jest.advanceTimersByTime(1000);
    });
  });
});