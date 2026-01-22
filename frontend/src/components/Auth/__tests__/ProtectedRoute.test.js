import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import '@testing-library/jest-dom';
import ProtectedRoute from '../ProtectedRoute';
import authReducer from '../../../store/slices/authSlice';

// Mock组件
const MockProtectedComponent = () => <div>Protected Content</div>;
const MockLoginPage = () => <div>Login Page</div>;

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
const TestWrapper = ({ children, initialState = {}, initialRoute = '/' }) => {
  const store = createTestStore(initialState);
  
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<MockLoginPage />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                {children}
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
};

describe('ProtectedRoute', () => {
  test('shows loading spinner when authentication is loading', () => {
    render(
      <TestWrapper initialState={{ auth: { loading: true } }}>
        <MockProtectedComponent />
      </TestWrapper>
    );

    expect(screen.getByText('验证身份中...')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  test('redirects to login when user is not authenticated', () => {
    render(
      <TestWrapper initialState={{ auth: { isAuthenticated: false, loading: false } }}>
        <MockProtectedComponent />
      </TestWrapper>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  test('renders protected content when user is authenticated', () => {
    render(
      <TestWrapper initialState={{ 
        auth: { 
          isAuthenticated: true, 
          loading: false,
          user: { id: 1, username: 'testuser' }
        } 
      }}>
        <MockProtectedComponent />
      </TestWrapper>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });

  test('shows error message when token is invalid', () => {
    render(
      <TestWrapper initialState={{ 
        auth: { 
          isAuthenticated: false, 
          loading: false,
          error: { detail: 'Token is invalid or expired' }
        } 
      }}>
        <MockProtectedComponent />
      </TestWrapper>
    );

    expect(screen.getByText('您的会话已过期，请重新登录。')).toBeInTheDocument();
  });

  test('handles requireAuth prop correctly', () => {
    // 测试requireAuth为false的情况
    const TestWrapperWithRequireAuth = ({ requireAuth = true, children, authState = {} }) => {
      const store = createTestStore({ 
        auth: { 
          isAuthenticated: false, 
          loading: false,
          ...authState
        } 
      });
      
      return (
        <Provider store={store}>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<MockLoginPage />} />
              <Route path="/dashboard" element={<div>Dashboard</div>} />
              <Route 
                path="/" 
                element={
                  <ProtectedRoute requireAuth={requireAuth}>
                    {children}
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </BrowserRouter>
        </Provider>
      );
    };

    // 当requireAuth为false且用户未认证时，应该显示内容
    const { rerender } = render(
      <TestWrapperWithRequireAuth requireAuth={false}>
        <MockProtectedComponent />
      </TestWrapperWithRequireAuth>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();

    // 当requireAuth为false且用户已认证时，应该重定向到dashboard
    rerender(
      <TestWrapperWithRequireAuth requireAuth={false} authState={{ isAuthenticated: true }}>
        <MockProtectedComponent />
      </TestWrapperWithRequireAuth>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  test('dispatches checkAuthStatus when user is null but token exists', () => {
    // Mock localStorage
    const mockGetItem = jest.spyOn(Storage.prototype, 'getItem');
    mockGetItem.mockReturnValue('mock-token');

    const store = createTestStore({ 
      auth: { 
        isAuthenticated: false, 
        loading: false,
        user: null
      } 
    });
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<MockLoginPage />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <MockProtectedComponent />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </BrowserRouter>
      </Provider>
    );

    expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({
      type: 'auth/checkStatus/pending'
    }));

    mockGetItem.mockRestore();
  });

  test('does not dispatch checkAuthStatus when already loading', () => {
    const mockGetItem = jest.spyOn(Storage.prototype, 'getItem');
    mockGetItem.mockReturnValue('mock-token');

    const store = createTestStore({ 
      auth: { 
        isAuthenticated: false, 
        loading: true,
        user: null
      } 
    });
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<MockLoginPage />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <MockProtectedComponent />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </BrowserRouter>
      </Provider>
    );

    expect(dispatchSpy).not.toHaveBeenCalled();

    mockGetItem.mockRestore();
  });

  test('does not dispatch checkAuthStatus when no token exists', () => {
    const mockGetItem = jest.spyOn(Storage.prototype, 'getItem');
    mockGetItem.mockReturnValue(null);

    const store = createTestStore({ 
      auth: { 
        isAuthenticated: false, 
        loading: false,
        user: null
      } 
    });
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<MockLoginPage />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <MockProtectedComponent />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </BrowserRouter>
      </Provider>
    );

    expect(dispatchSpy).not.toHaveBeenCalled();

    mockGetItem.mockRestore();
  });

  test('preserves location state when redirecting to login', () => {
    const TestWrapperWithLocation = () => {
      const store = createTestStore({ 
        auth: { 
          isAuthenticated: false, 
          loading: false 
        } 
      });
      
      return (
        <Provider store={store}>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<MockLoginPage />} />
              <Route 
                path="/protected" 
                element={
                  <ProtectedRoute>
                    <MockProtectedComponent />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </BrowserRouter>
        </Provider>
      );
    };

    render(<TestWrapperWithLocation />);

    // 应该重定向到登录页面
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  test('handles different error types correctly', () => {
    const testCases = [
      { 
        error: { detail: 'Token is invalid or expired' }, 
        expectedText: '您的会话已过期，请重新登录。' 
      },
      { 
        error: { message: 'Network error' }, 
        expectedText: null // 不应该显示错误消息
      },
      { 
        error: null, 
        expectedText: null 
      },
    ];

    testCases.forEach(({ error, expectedText }) => {
      const { unmount } = render(
        <TestWrapper initialState={{ 
          auth: { 
            isAuthenticated: false, 
            loading: false,
            error
          } 
        }}>
          <MockProtectedComponent />
        </TestWrapper>
      );

      if (expectedText) {
        expect(screen.getByText(expectedText)).toBeInTheDocument();
      } else {
        expect(screen.queryByText(/会话已过期/)).not.toBeInTheDocument();
      }

      unmount();
    });
  });

  test('renders children when user is authenticated and has user data', () => {
    render(
      <TestWrapper initialState={{ 
        auth: { 
          isAuthenticated: true, 
          loading: false,
          user: { id: 1, username: 'testuser', email: 'test@example.com' }
        } 
      }}>
        <MockProtectedComponent />
      </TestWrapper>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
  });
});