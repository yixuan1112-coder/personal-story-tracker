import React from 'react';
import { Alert, AlertTitle, Box, Chip } from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
import { isDemoMode } from '../../services/api';

const DemoModeNotice = () => {
  if (!isDemoMode()) {
    return null;
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Alert 
        severity="info" 
        icon={<InfoIcon />}
        sx={{ 
          borderRadius: 2,
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
      >
        <AlertTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          演示模式
          <Chip 
            label="DEMO" 
            size="small" 
            color="primary" 
            variant="outlined"
          />
        </AlertTitle>
        <Box sx={{ mt: 1 }}>
          您正在使用演示版本。数据存储在浏览器本地，刷新页面后数据可能丢失。
          <br />
          <strong>演示账户：</strong> 用户名: demo, 密码: demo123
        </Box>
      </Alert>
    </Box>
  );
};

export default DemoModeNotice;