import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography,
  Alert
} from '@mui/material';
import { logout, checkAuthStatus } from '../../store/slices/authSlice';
import useIdleTimer from '../../hooks/useIdleTimer';

/**
 * 认证提供者组件：管理用户会话和自动登出
 */
const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [showIdleWarning, setShowIdleWarning] = useState(false);
  const [warningCountdown, setWarningCountdown] = useState(0);

  // 空闲警告时间：25分钟后显示警告，30分钟后自动登出
  const IDLE_WARNING_TIME = 25 * 60 * 1000; // 25分钟
  const IDLE_LOGOUT_TIME = 30 * 60 * 1000;  // 30分钟
  const WARNING_DURATION = 5 * 60 * 1000;   // 5分钟警告时间

  // 处理空闲警告
  const handleIdleWarning = () => {
    if (isAuthenticated) {
      setShowIdleWarning(true);
      setWarningCountdown(WARNING_DURATION / 1000);
    }
  };

  // 处理自动登出
  const handleAutoLogout = () => {
    if (isAuthenticated) {
      dispatch(logout());
      setShowIdleWarning(false);
    }
  };

  // 使用空闲计时器 - 25分钟后显示警告
  useIdleTimer(IDLE_WARNING_TIME, handleIdleWarning);

  // 使用空闲计时器 - 30分钟后自动登出
  useIdleTimer(IDLE_LOGOUT_TIME, handleAutoLogout);

  // 警告倒计时
  useEffect(() => {
    let countdownInterval;
    
    if (showIdleWarning && warningCountdown > 0) {
      countdownInterval = setInterval(() => {
        setWarningCountdown(prev => {
          if (prev <= 1) {
            setShowIdleWarning(false);
            handleAutoLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [showIdleWarning, warningCountdown]);

  // 继续会话
  const handleContinueSession = () => {
    setShowIdleWarning(false);
    setWarningCountdown(0);
    // 重新验证用户状态
    dispatch(checkAuthStatus());
  };

  // 立即登出
  const handleLogoutNow = () => {
    setShowIdleWarning(false);
    dispatch(logout());
  };

  // 格式化倒计时显示
  const formatCountdown = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {children}
      
      {/* 空闲警告对话框 */}
      <Dialog
        open={showIdleWarning}
        disableEscapeKeyDown
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          会话即将过期
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            由于长时间未活动，您的会话即将过期。
          </Alert>
          <Typography variant="body1" gutterBottom>
            为了保护您的数据安全，系统将在 <strong>{formatCountdown(warningCountdown)}</strong> 后自动登出。
          </Typography>
          <Typography variant="body2" color="textSecondary">
            如果您希望继续使用，请点击"继续会话"按钮。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleLogoutNow}
            color="secondary"
          >
            立即登出
          </Button>
          <Button 
            onClick={handleContinueSession}
            variant="contained"
            color="primary"
          >
            继续会话
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AuthProvider;