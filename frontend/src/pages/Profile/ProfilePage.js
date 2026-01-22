import React from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
} from '@mui/material';

const ProfilePage = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1">
          个人资料
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="body2" color="textSecondary">
          个人资料页面正在开发中...
        </Typography>
      </Paper>
    </Container>
  );
};

export default ProfilePage;