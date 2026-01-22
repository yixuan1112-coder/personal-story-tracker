import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Alert, 
  Container,
  Paper 
} from '@mui/material';
import { Refresh, Home } from '@mui/icons-material';

/**
 * 错误边界组件：捕获和处理React组件错误
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // 更新state以显示错误UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 记录错误信息
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // 可以在这里发送错误报告到日志服务
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box textAlign="center">
              <Typography variant="h4" color="error" gutterBottom>
                哎呀，出错了！
              </Typography>
              
              <Typography variant="body1" color="textSecondary" paragraph>
                应用程序遇到了一个意外错误。我们已经记录了这个问题，请稍后再试。
              </Typography>

              <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
                <Typography variant="subtitle2" gutterBottom>
                  错误详情：
                </Typography>
                <Typography variant="body2" component="pre" sx={{ fontSize: '0.8rem' }}>
                  {this.state.error && this.state.error.toString()}
                </Typography>
              </Alert>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={this.handleReload}
                >
                  刷新页面
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Home />}
                  onClick={this.handleGoHome}
                >
                  返回首页
                </Button>
              </Box>

              {/* 开发环境下显示详细错误信息 */}
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <Box sx={{ mt: 3, textAlign: 'left' }}>
                  <Typography variant="h6" gutterBottom>
                    开发调试信息：
                  </Typography>
                  <Alert severity="info">
                    <Typography variant="body2" component="pre" sx={{ fontSize: '0.7rem' }}>
                      {this.state.errorInfo.componentStack}
                    </Typography>
                  </Alert>
                </Box>
              )}
            </Box>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;