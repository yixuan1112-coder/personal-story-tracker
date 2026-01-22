import { useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';

/**
 * 自定义Hook：监控用户活动，在空闲时间过长时自动登出
 * @param {number} timeout - 空闲超时时间（毫秒），默认30分钟
 * @param {function} onIdle - 空闲时的回调函数
 */
const useIdleTimer = (timeout = 30 * 60 * 1000, onIdle = null) => {
  const dispatch = useDispatch();
  const timeoutRef = useRef(null);
  const onIdleRef = useRef(onIdle);

  // 更新回调函数引用
  useEffect(() => {
    onIdleRef.current = onIdle;
  }, [onIdle]);

  // 重置计时器
  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      // 执行自定义回调或默认登出操作
      if (onIdleRef.current) {
        onIdleRef.current();
      } else {
        dispatch(logout());
      }
    }, timeout);
  }, [timeout, dispatch]);

  // 处理用户活动事件
  const handleActivity = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    // 监听的用户活动事件
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // 添加事件监听器
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // 初始化计时器
    resetTimer();

    // 清理函数
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [handleActivity, resetTimer]);

  return { resetTimer };
};

export default useIdleTimer;