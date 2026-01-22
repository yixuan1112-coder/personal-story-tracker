import axios from 'axios';
import { store } from '../store/store';
import { logout } from '../store/slices/authSlice';

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 标记是否正在刷新token
let isRefreshing = false;
// 存储等待token刷新的请求
let failedQueue = [];

// 处理等待队列
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// 请求拦截器 - 添加认证token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理token刷新和错误
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // 如果是401错误且不是刷新token的请求
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 如果正在刷新token，将请求加入队列
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post('/api/auth/token/refresh/', {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;
        localStorage.setItem('access_token', newAccessToken);
        
        // 更新默认请求头
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        
        // 处理等待队列
        processQueue(null, newAccessToken);
        
        // 重试原始请求
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        // 刷新token失败，清除存储并登出
        processQueue(refreshError, null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
        // 通过Redux store登出用户
        store.dispatch(logout());
        
        // 如果不是在登录页面，重定向到登录页
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 处理其他类型的错误
    if (error.response?.status === 403) {
      // 权限不足
      console.error('Access denied:', error.response.data);
    } else if (error.response?.status >= 500) {
      // 服务器错误
      console.error('Server error:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default api;