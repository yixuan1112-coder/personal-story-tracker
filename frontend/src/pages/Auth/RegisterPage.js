import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert,
  CircularProgress,
  LinearProgress,
  Chip,
  FormHelperText,
} from '@mui/material';
import { register, clearError } from '../../store/slices/authSlice';
import {
  validateEmail,
  validateUsername,
  validatePassword,
  validatePasswordConfirm,
  validateDisplayName,
  getPasswordStrengthColor,
  getPasswordStrengthText,
} from '../../utils/validation';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    password_confirm: '',
    display_name: '',
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [isFormValid, setIsFormValid] = useState(false);

  // 验证单个字段
  const validateField = (name, value) => {
    let validation = { isValid: true, message: '' };
    
    switch (name) {
      case 'email':
        validation = validateEmail(value);
        break;
      case 'username':
        validation = validateUsername(value);
        break;
      case 'password':
        validation = validatePassword(value);
        if (validation.strength) {
          setPasswordStrength(validation.strength);
        }
        break;
      case 'password_confirm':
        validation = validatePasswordConfirm(formData.password, value);
        break;
      case 'display_name':
        validation = validateDisplayName(value);
        break;
      default:
        break;
    }
    
    return validation;
  };

  // 验证整个表单
  const validateForm = (data) => {
    const errors = {};
    let isValid = true;

    // 验证必填字段
    const requiredFields = ['email', 'username', 'password', 'password_confirm'];
    
    requiredFields.forEach(field => {
      const validation = validateField(field, data[field]);
      if (!validation.isValid) {
        errors[field] = validation.message;
        isValid = false;
      }
    });

    // 验证可选字段
    if (data.display_name) {
      const validation = validateField('display_name', data.display_name);
      if (!validation.isValid) {
        errors.display_name = validation.message;
        isValid = false;
      }
    }

    setValidationErrors(errors);
    setIsFormValid(isValid);
    return isValid;
  };

  // 处理输入变化
  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value,
    };
    
    setFormData(newFormData);
    
    // 实时验证当前字段
    const validation = validateField(name, value);
    setValidationErrors(prev => ({
      ...prev,
      [name]: validation.isValid ? '' : validation.message,
    }));
    
    // 如果是密码确认字段，也要重新验证
    if (name === 'password' && formData.password_confirm) {
      const confirmValidation = validateField('password_confirm', formData.password_confirm);
      setValidationErrors(prev => ({
        ...prev,
        password_confirm: confirmValidation.isValid ? '' : confirmValidation.message,
      }));
    }
    
    // 清除服务器错误
    if (error) {
      dispatch(clearError());
    }
    
    // 验证整个表单
    setTimeout(() => validateForm(newFormData), 0);
  };

  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm(formData)) {
      return;
    }
    
    const result = await dispatch(register(formData));
    if (register.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  // 获取密码强度进度值
  const getPasswordStrengthProgress = () => {
    switch (passwordStrength) {
      case 'weak': return 25;
      case 'medium': return 50;
      case 'strong': return 75;
      case 'very-strong': return 100;
      default: return 0;
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            注册
          </Typography>
          
          <Typography variant="body2" color="textSecondary" align="center" gutterBottom>
            创建您的个人故事追踪器账户
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error.message || '注册失败，请检查输入信息'}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="邮箱地址"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              error={!!validationErrors.email}
              helperText={validationErrors.email}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="用户名"
              name="username"
              autoComplete="username"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
              error={!!validationErrors.username}
              helperText={validationErrors.username || '用户名将用于登录，支持字母、数字、下划线和中文'}
            />
            
            <TextField
              margin="normal"
              fullWidth
              id="display_name"
              label="显示名称（可选）"
              name="display_name"
              value={formData.display_name}
              onChange={handleChange}
              disabled={loading}
              error={!!validationErrors.display_name}
              helperText={validationErrors.display_name || '显示名称将在界面中显示，可以与用户名不同'}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="密码"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              error={!!validationErrors.password}
              helperText={validationErrors.password}
            />
            
            {/* 密码强度指示器 */}
            {formData.password && (
              <Box sx={{ mt: 1, mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="caption" color="textSecondary">
                    密码强度:
                  </Typography>
                  <Chip
                    label={getPasswordStrengthText(passwordStrength)}
                    size="small"
                    color={getPasswordStrengthColor(passwordStrength)}
                    variant="outlined"
                  />
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={getPasswordStrengthProgress()}
                  color={getPasswordStrengthColor(passwordStrength)}
                  sx={{ height: 4, borderRadius: 2 }}
                />
              </Box>
            )}
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password_confirm"
              label="确认密码"
              type="password"
              id="password_confirm"
              value={formData.password_confirm}
              onChange={handleChange}
              disabled={loading}
              error={!!validationErrors.password_confirm}
              helperText={validationErrors.password_confirm}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading || !isFormValid}
            >
              {loading ? <CircularProgress size={24} /> : '注册'}
            </Button>
            
            <Box textAlign="center">
              <Link component={RouterLink} to="/login" variant="body2">
                已有账户？立即登录
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage;