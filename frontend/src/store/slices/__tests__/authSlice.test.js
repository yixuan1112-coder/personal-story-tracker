import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  login,
  register,
  logout,
  checkAuthStatus,
  updateProfile,
  clearError,
  setLoading,
} from '../authSlice';

// Mock the authAPI
jest.mock('../../../services/authAPI', () => ({
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  getProfile: jest.fn(),
  updateProfile: jest.fn(),
}));

// Mock security utils
jest.mock('../../../utils/security', () => ({
  clearSensitiveData: jest.fn(),
  detectSuspiciousActivity: jest.fn(),
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('authSlice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    test('should have correct initial state', () => {
      const state = store.getState().auth;
      expect(state).toEqual({
        user: null,
        isAuthenticated: false,
        loading: true,
        error: null,
      });
    });
  });

  describe('synchronous actions', () => {
    test('clearError should clear error state', () => {
      // 先设置一个错误状态
      store.dispatch({
        type: 'auth/login/rejected',
        payload: { message: 'Login failed' },
      });

      expect(store.getState().auth.error).toEqual({ message: 'Login failed' });

      // 清除错误
      store.dispatch(clearError());

      expect(store.getState().auth.error).toBeNull();
    });

    test('setLoading should update loading state', () => {
      store.dispatch(setLoading(true));
      expect(store.getState().auth.loading).toBe(true);

      store.dispatch(setLoading(false));
      expect(store.getState().auth.loading).toBe(false);
    });
  });

  describe('login async thunk', () => {
    test('should handle successful login', async () => {
      const mockResponse = {
        access: 'access-token',
        refresh: 'refresh-token',
        user: { id: 1, username: 'testuser', email: 'test@example.com' },
      };

      const authAPI = require('../../../services/authAPI').default;
      authAPI.login.mockResolvedValue(mockResponse);

      const credentials = { email: 'test@example.com', password: 'password123' };
      
      await store.dispatch(login(credentials));

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockResponse.user);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();

      // 验证localStorage调用
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('access_token', 'access-token');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('refresh_token', 'refresh-token');
    });

    test('should handle login failure', async () => {
      const mockError = {
        response: {
          data: { message: 'Invalid credentials' },
        },
      };

      const authAPI = require('../../../services/authAPI').default;
      authAPI.login.mockRejectedValue(mockError);

      const credentials = { email: 'test@example.com', password: 'wrongpassword' };
      
      await store.dispatch(login(credentials));

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toEqual({ message: 'Invalid credentials' });
    });

    test('should handle login failure without response data', async () => {
      const mockError = new Error('Network error');

      const authAPI = require('../../../services/authAPI').default;
      authAPI.login.mockRejectedValue(mockError);

      const credentials = { email: 'test@example.com', password: 'password123' };
      
      await store.dispatch(login(credentials));

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toEqual({ message: '登录失败' });
    });

    test('should set loading state during login', () => {
      const authAPI = require('../../../services/authAPI').default;
      authAPI.login.mockImplementation(() => new Promise(() => {})); // Never resolves

      store.dispatch(login({ email: 'test@example.com', password: 'password123' }));

      const state = store.getState().auth;
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });
  });

  describe('register async thunk', () => {
    test('should handle successful registration', async () => {
      const mockResponse = {
        access: 'access-token',
        refresh: 'refresh-token',
        user: { id: 1, username: 'newuser', email: 'new@example.com' },
      };

      const authAPI = require('../../../services/authAPI').default;
      authAPI.register.mockResolvedValue(mockResponse);

      const userData = {
        email: 'new@example.com',
        username: 'newuser',
        password: 'password123',
        password_confirm: 'password123',
      };
      
      await store.dispatch(register(userData));

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockResponse.user);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();

      // 验证localStorage调用
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('access_token', 'access-token');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('refresh_token', 'refresh-token');
    });

    test('should handle registration failure', async () => {
      const mockError = {
        response: {
          data: { email: ['Email already exists'] },
        },
      };

      const authAPI = require('../../../services/authAPI').default;
      authAPI.register.mockRejectedValue(mockError);

      const userData = {
        email: 'existing@example.com',
        username: 'newuser',
        password: 'password123',
        password_confirm: 'password123',
      };
      
      await store.dispatch(register(userData));

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toEqual({ email: ['Email already exists'] });
    });

    test('should handle registration failure without response data', async () => {
      const mockError = new Error('Network error');

      const authAPI = require('../../../services/authAPI').default;
      authAPI.register.mockRejectedValue(mockError);

      const userData = {
        email: 'new@example.com',
        username: 'newuser',
        password: 'password123',
        password_confirm: 'password123',
      };
      
      await store.dispatch(register(userData));

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toEqual({ message: '注册失败' });
    });
  });

  describe('logout async thunk', () => {
    test('should handle successful logout', async () => {
      // 先设置已认证状态
      store.dispatch({
        type: 'auth/login/fulfilled',
        payload: {
          user: { id: 1, username: 'testuser' },
        },
      });

      const authAPI = require('../../../services/authAPI').default;
      authAPI.logout.mockResolvedValue({});

      mockLocalStorage.getItem.mockReturnValue('refresh-token');

      await store.dispatch(logout());

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();

      // 验证安全清理函数被调用
      const { clearSensitiveData, detectSuspiciousActivity } = require('../../../utils/security');
      expect(clearSensitiveData).toHaveBeenCalled();
      expect(detectSuspiciousActivity).toHaveBeenCalledWith('logout', expect.any(Object));
    });

    test('should handle logout even when API fails', async () => {
      // 先设置已认证状态
      store.dispatch({
        type: 'auth/login/fulfilled',
        payload: {
          user: { id: 1, username: 'testuser' },
        },
      });

      const authAPI = require('../../../services/authAPI').default;
      authAPI.logout.mockRejectedValue(new Error('API Error'));

      mockLocalStorage.getItem.mockReturnValue('refresh-token');

      await store.dispatch(logout());

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();

      // 即使API失败，也应该清理本地数据
      const { clearSensitiveData } = require('../../../utils/security');
      expect(clearSensitiveData).toHaveBeenCalled();
    });

    test('should handle logout without refresh token', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      await store.dispatch(logout());

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();

      // 应该仍然清理敏感数据
      const { clearSensitiveData } = require('../../../utils/security');
      expect(clearSensitiveData).toHaveBeenCalled();
    });
  });

  describe('checkAuthStatus async thunk', () => {
    test('should handle successful auth check', async () => {
      const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };

      const authAPI = require('../../../services/authAPI').default;
      authAPI.getProfile.mockResolvedValue(mockUser);

      mockLocalStorage.getItem.mockReturnValue('access-token');

      await store.dispatch(checkAuthStatus());

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();

      // 验证安全活动记录
      const { detectSuspiciousActivity } = require('../../../utils/security');
      expect(detectSuspiciousActivity).toHaveBeenCalledWith('auth_check', expect.any(Object));
    });

    test('should handle auth check failure', async () => {
      const mockError = {
        response: {
          data: { detail: 'Token is invalid or expired' },
        },
      };

      const authAPI = require('../../../services/authAPI').default;
      authAPI.getProfile.mockRejectedValue(mockError);

      mockLocalStorage.getItem.mockReturnValue('invalid-token');

      await store.dispatch(checkAuthStatus());

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull(); // checkAuthStatus失败时不设置错误

      // 验证敏感数据被清理
      const { clearSensitiveData } = require('../../../utils/security');
      expect(clearSensitiveData).toHaveBeenCalled();
    });

    test('should handle auth check when no token exists', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      await store.dispatch(checkAuthStatus());

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.loading).toBe(false);

      // 验证敏感数据被清理
      const { clearSensitiveData } = require('../../../utils/security');
      expect(clearSensitiveData).toHaveBeenCalled();
    });
  });

  describe('updateProfile async thunk', () => {
    test('should handle successful profile update', async () => {
      // 先设置已认证状态
      store.dispatch({
        type: 'auth/login/fulfilled',
        payload: {
          user: { id: 1, username: 'testuser', email: 'test@example.com' },
        },
      });

      const updatedProfile = { display_name: 'Updated Name' };
      const mockResponse = { id: 1, username: 'testuser', email: 'test@example.com', display_name: 'Updated Name' };

      const authAPI = require('../../../services/authAPI').default;
      authAPI.updateProfile.mockResolvedValue(mockResponse);

      await store.dispatch(updateProfile(updatedProfile));

      const state = store.getState().auth;
      expect(state.user).toEqual(mockResponse);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    test('should handle profile update failure', async () => {
      const mockError = {
        response: {
          data: { display_name: ['Name too long'] },
        },
      };

      const authAPI = require('../../../services/authAPI').default;
      authAPI.updateProfile.mockRejectedValue(mockError);

      const updatedProfile = { display_name: 'Very long name that exceeds limit' };

      await store.dispatch(updateProfile(updatedProfile));

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.error).toEqual({ display_name: ['Name too long'] });
    });

    test('should handle profile update failure without response data', async () => {
      const mockError = new Error('Network error');

      const authAPI = require('../../../services/authAPI').default;
      authAPI.updateProfile.mockRejectedValue(mockError);

      const updatedProfile = { display_name: 'New Name' };

      await store.dispatch(updateProfile(updatedProfile));

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.error).toEqual({ message: '更新失败' });
    });
  });

  describe('state transitions', () => {
    test('should maintain authentication state across different actions', async () => {
      // 初始状态
      expect(store.getState().auth.isAuthenticated).toBe(false);

      // 登录
      store.dispatch({
        type: 'auth/login/fulfilled',
        payload: {
          user: { id: 1, username: 'testuser' },
        },
      });

      expect(store.getState().auth.isAuthenticated).toBe(true);

      // 更新资料不应该影响认证状态
      store.dispatch({
        type: 'auth/updateProfile/fulfilled',
        payload: { display_name: 'New Name' },
      });

      expect(store.getState().auth.isAuthenticated).toBe(true);

      // 登出
      store.dispatch({
        type: 'auth/logout/fulfilled',
      });

      expect(store.getState().auth.isAuthenticated).toBe(false);
    });

    test('should handle loading states correctly', () => {
      // 初始loading状态
      expect(store.getState().auth.loading).toBe(true);

      // 开始登录
      store.dispatch({
        type: 'auth/login/pending',
      });

      expect(store.getState().auth.loading).toBe(true);

      // 登录成功
      store.dispatch({
        type: 'auth/login/fulfilled',
        payload: { user: { id: 1 } },
      });

      expect(store.getState().auth.loading).toBe(false);
    });

    test('should handle error states correctly', () => {
      // 初始无错误
      expect(store.getState().auth.error).toBeNull();

      // 登录失败
      store.dispatch({
        type: 'auth/login/rejected',
        payload: { message: 'Login failed' },
      });

      expect(store.getState().auth.error).toEqual({ message: 'Login failed' });

      // 清除错误
      store.dispatch(clearError());

      expect(store.getState().auth.error).toBeNull();

      // 新的成功操作不应该设置错误
      store.dispatch({
        type: 'auth/login/fulfilled',
        payload: { user: { id: 1 } },
      });

      expect(store.getState().auth.error).toBeNull();
    });
  });
});