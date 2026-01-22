import React from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
} from '@mui/material';

const CreateEntryPage = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1">
          创建新条目
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="body2" color="textSecondary">
          创建条目页面正在开发中...
        </Typography>
      </Paper>
    </Container>
  );
};

export default CreateEntryPage;