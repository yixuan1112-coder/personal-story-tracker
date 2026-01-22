/**
 * 表单验证工具函数
 */

// 邮箱验证正则表达式
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 密码强度验证正则表达式
const PASSWORD_REGEX = {
  minLength: /.{8,}/, // 至少8位
  hasUpperCase: /[A-Z]/, // 包含大写字母
  hasLowerCase: /[a-z]/, // 包含小写字母
  hasNumber: /\d/, // 包含数字
  hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/, // 包含特殊字符
};

/**
 * 验证邮箱格式
 * @param {string} email - 邮箱地址
 * @returns {object} 验证结果
 */
export const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, message: '邮箱地址不能为空' };
  }
  
  if (!EMAIL_REGEX.test(email)) {
    return { isValid: false, message: '请输入有效的邮箱地址' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * 验证用户名
 * @param {string} username - 用户名
 * @returns {object} 验证结果
 */
export const validateUsername = (username) => {
  if (!username) {
    return { isValid: false, message: '用户名不能为空' };
  }
  
  if (username.length < 3) {
    return { isValid: false, message: '用户名至少需要3个字符' };
  }
  
  if (username.length > 30) {
    return { isValid: false, message: '用户名不能超过30个字符' };
  }
  
  if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(username)) {
    return { isValid: false, message: '用户名只能包含字母、数字、下划线和中文字符' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * 验证密码强度
 * @param {string} password - 密码
 * @returns {object} 验证结果
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: '密码不能为空' };
  }
  
  const checks = {
    minLength: PASSWORD_REGEX.minLength.test(password),
    hasUpperCase: PASSWORD_REGEX.hasUpperCase.test(password),
    hasLowerCase: PASSWORD_REGEX.hasLowerCase.test(password),
    hasNumber: PASSWORD_REGEX.hasNumber.test(password),
  };
  
  const failedChecks = [];
  
  if (!checks.minLength) {
    failedChecks.push('至少8个字符');
  }
  if (!checks.hasUpperCase) {
    failedChecks.push('包含大写字母');
  }
  if (!checks.hasLowerCase) {
    failedChecks.push('包含小写字母');
  }
  if (!checks.hasNumber) {
    failedChecks.push('包含数字');
  }
  
  if (failedChecks.length > 0) {
    return {
      isValid: false,
      message: `密码必须${failedChecks.join('、')}`,
      strength: getPasswordStrength(checks)
    };
  }
  
  return { 
    isValid: true, 
    message: '密码强度良好',
    strength: getPasswordStrength(checks)
  };
};

/**
 * 验证密码确认
 * @param {string} password - 原密码
 * @param {string} confirmPassword - 确认密码
 * @returns {object} 验证结果
 */
export const validatePasswordConfirm = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { isValid: false, message: '请确认密码' };
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, message: '两次输入的密码不一致' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * 验证显示名称
 * @param {string} displayName - 显示名称
 * @returns {object} 验证结果
 */
export const validateDisplayName = (displayName) => {
  if (!displayName) {
    return { isValid: true, message: '' }; // 显示名称是可选的
  }
  
  if (displayName.length > 50) {
    return { isValid: false, message: '显示名称不能超过50个字符' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * 计算密码强度
 * @param {object} checks - 密码检查结果
 * @returns {string} 强度等级
 */
const getPasswordStrength = (checks) => {
  const passedChecks = Object.values(checks).filter(Boolean).length;
  
  if (passedChecks < 2) return 'weak';
  if (passedChecks < 3) return 'medium';
  if (passedChecks < 4) return 'strong';
  return 'very-strong';
};

/**
 * 获取密码强度颜色
 * @param {string} strength - 密码强度
 * @returns {string} 颜色
 */
export const getPasswordStrengthColor = (strength) => {
  switch (strength) {
    case 'weak': return 'error';
    case 'medium': return 'warning';
    case 'strong': return 'info';
    case 'very-strong': return 'success';
    default: return 'default';
  }
};

/**
 * 获取密码强度文本
 * @param {string} strength - 密码强度
 * @returns {string} 强度文本
 */
export const getPasswordStrengthText = (strength) => {
  switch (strength) {
    case 'weak': return '弱';
    case 'medium': return '中等';
    case 'strong': return '强';
    case 'very-strong': return '很强';
    default: return '';
  }
};