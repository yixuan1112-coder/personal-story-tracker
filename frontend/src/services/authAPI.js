import api, { isDemoMode } from './api';
import { demoApi } from './demoApi';

const authAPI = {
  // 用户注册
  register: async (userData) => {
    if (isDemoMode()) {
      return await demoApi.register(userData);
    }
    return await api.post('/auth/register/', userData);
  },

  // 用户登录
  login: async (credentials) => {
    if (isDemoMode()) {
      return await demoApi.login(credentials);
    }
    return await api.post('/auth/login/', credentials);
  },

  // 用户登出
  logout: async (refreshToken) => {
    if (isDemoMode()) {
      return await demoApi.logout();
    }
    return await api.post('/auth/logout/', refreshToken);
  },

  // 获取用户资料
  getProfile: async () => {
    if (isDemoMode()) {
      return await demoApi.getCurrentUser();
    }
    return await api.get('/auth/profile/');
  },

  // 更新用户资料
  updateProfile: async (profileData) => {
    if (isDemoMode()) {
      // 演示模式下简单返回更新后的数据
      return { ...profileData, id: 1 };
    }
    return await api.put('/auth/profile/', profileData);
  },

  // 刷新token
  refreshToken: async (refreshToken) => {
    if (isDemoMode()) {
      // 演示模式下返回新的演示token
      return {
        access: 'demo_access_token_refreshed',
        refresh: 'demo_refresh_token_refreshed'
      };
    }
    return await api.post('/auth/token/refresh/', { refresh: refreshToken });
  },
};

export default authAPI;