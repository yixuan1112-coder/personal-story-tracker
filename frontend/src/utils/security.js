/**
 * 安全工具函数
 */

/**
 * 检查token是否即将过期
 * @param {string} token - JWT token
 * @param {number} bufferMinutes - 提前多少分钟认为token过期（默认5分钟）
 * @returns {boolean} 是否即将过期
 */
export const isTokenExpiringSoon = (token, bufferMinutes = 5) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // 转换为毫秒
    const currentTime = Date.now();
    const bufferTime = bufferMinutes * 60 * 1000; // 转换为毫秒
    
    return (expirationTime - currentTime) <= bufferTime;
  } catch (error) {
    console.error('Error parsing token:', error);
    return true;
  }
};

/**
 * 获取token的过期时间
 * @param {string} token - JWT token
 * @returns {Date|null} 过期时间
 */
export const getTokenExpiration = (token) => {
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return new Date(payload.exp * 1000);
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
};

/**
 * 清理敏感数据
 */
export const clearSensitiveData = () => {
  // 清除localStorage中的敏感信息
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  
  // 清除sessionStorage中的敏感信息
  sessionStorage.clear();
  
  // 清除任何可能的缓存数据
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
      });
    });
  }
};

/**
 * 检测可疑活动
 * @param {string} action - 用户操作
 * @param {object} context - 操作上下文
 */
export const detectSuspiciousActivity = (action, context = {}) => {
  const suspiciousPatterns = [
    // 短时间内大量请求
    'rapid_requests',
    // 异常的用户代理
    'unusual_user_agent',
    // 可疑的IP地址变化
    'ip_change',
    // 异常的访问模式
    'unusual_access_pattern'
  ];
  
  // 这里可以实现具体的检测逻辑
  // 例如：记录用户行为，分析模式等
  
  console.log(`Security check for action: ${action}`, context);
};

/**
 * 生成安全的随机字符串
 * @param {number} length - 字符串长度
 * @returns {string} 随机字符串
 */
export const generateSecureRandomString = (length = 32) => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  if (window.crypto && window.crypto.getRandomValues) {
    const randomValues = new Uint8Array(length);
    window.crypto.getRandomValues(randomValues);
    
    for (let i = 0; i < length; i++) {
      result += charset[randomValues[i] % charset.length];
    }
  } else {
    // 降级方案
    for (let i = 0; i < length; i++) {
      result += charset[Math.floor(Math.random() * charset.length)];
    }
  }
  
  return result;
};

/**
 * 验证CSRF token（如果后端支持）
 * @param {string} token - CSRF token
 * @returns {boolean} 是否有效
 */
export const validateCSRFToken = (token) => {
  // 这里可以实现CSRF token验证逻辑
  // 通常需要与后端配合
  return token && token.length > 0;
};

/**
 * 检查是否在安全环境中运行
 * @returns {object} 安全检查结果
 */
export const checkSecurityEnvironment = () => {
  const checks = {
    https: window.location.protocol === 'https:',
    localStorage: typeof Storage !== 'undefined',
    crypto: !!(window.crypto && window.crypto.getRandomValues),
    webWorkers: typeof Worker !== 'undefined',
    serviceWorkers: 'serviceWorker' in navigator,
  };
  
  const isSecure = Object.values(checks).every(Boolean);
  
  return {
    isSecure,
    checks,
    warnings: generateSecurityWarnings(checks)
  };
};

/**
 * 生成安全警告
 * @param {object} checks - 安全检查结果
 * @returns {string[]} 警告信息数组
 */
const generateSecurityWarnings = (checks) => {
  const warnings = [];
  
  if (!checks.https) {
    warnings.push('应用程序未在HTTPS环境中运行，数据传输可能不安全');
  }
  
  if (!checks.localStorage) {
    warnings.push('浏览器不支持localStorage，某些功能可能无法正常工作');
  }
  
  if (!checks.crypto) {
    warnings.push('浏览器不支持Web Crypto API，安全性可能降低');
  }
  
  return warnings;
};

/**
 * 安全地存储敏感数据
 * @param {string} key - 存储键
 * @param {string} value - 存储值
 * @param {boolean} useSession - 是否使用sessionStorage
 */
export const secureStore = (key, value, useSession = false) => {
  try {
    const storage = useSession ? sessionStorage : localStorage;
    
    // 可以在这里添加加密逻辑
    storage.setItem(key, value);
  } catch (error) {
    console.error('Error storing data securely:', error);
  }
};

/**
 * 安全地获取敏感数据
 * @param {string} key - 存储键
 * @param {boolean} useSession - 是否使用sessionStorage
 * @returns {string|null} 存储的值
 */
export const secureRetrieve = (key, useSession = false) => {
  try {
    const storage = useSession ? sessionStorage : localStorage;
    const value = storage.getItem(key);
    
    // 可以在这里添加解密逻辑
    return value;
  } catch (error) {
    console.error('Error retrieving data securely:', error);
    return null;
  }
};