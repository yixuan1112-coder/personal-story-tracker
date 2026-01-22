import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { Alert, Box } from '@mui/material';
import { checkAuthStatus } from '../../store/slices/authSlice';
import LoadingSpinner from '../Common/LoadingSpinner';

const ProtectedRoute = ({ children, requireAuth = true }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, loading, user, error } = useSelector((state) => state.auth);

  useEffect(() => {
    // 如果没有用户信息但有token，尝试获取用户信息
    if (!user && !loading && localStorage.getItem('access_token')) {
      dispatch(checkAuthStatus());
    }
  }, [dispatch, user, loading]);

  // 显示加载状态
  if (loading) {
    return <LoadingSpinner message="验证身份中..." />;
  }

  // 如果需要认证但用户未登录
  if (requireAuth && !isAuthenticated) {
    // 保存当前路径，登录后可以重定向回来
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 如果不需要认证但用户已登录（如登录页面）
  if (!requireAuth && isAuthenticated) {
    // 如果有保存的路径，重定向到那里，否则去仪表板
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  // 如果有认证错误，显示错误信息
  if (error && error.detail === 'Token is invalid or expired') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          您的会话已过期，请重新登录。
        </Alert>
      </Box>
    );
  }

  return children;
};

export default ProtectedRoute;