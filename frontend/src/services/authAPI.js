import api from './api';

const authAPI = {
  // 用户注册
  register: async (userData) => {
    return await api.post('/auth/register/', userData);
  },

  // 用户登录
  login: async (credentials) => {
    return await api.post('/auth/login/', credentials);
  },

  // 用户登出
  logout: async (refreshToken) => {
    return await api.post('/auth/logout/', refreshToken);
  },

  // 获取用户资料
  getProfile: async () => {
    return await api.get('/auth/profile/');
  },

  // 更新用户资料
  updateProfile: async (profileData) => {
    return await api.put('/auth/profile/', profileData);
  },

  // 刷新token
  refreshToken: async (refreshToken) => {
    return await api.post('/auth/token/refresh/', { refresh: refreshToken });
  },
};

export default authAPI;