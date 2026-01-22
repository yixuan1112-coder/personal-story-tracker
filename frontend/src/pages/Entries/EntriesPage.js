import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Fab,
} from '@mui/material';
import {
  Add,
  Search,
  Person,
  Inventory,
  Star,
  Edit,
  Visibility,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { fetchEntries, clearError } from '../../store/slices/entriesSlice';

const EntriesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { entries, loading, error, pagination } = useSelector((state) => state.entries);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchEntries());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    
    // 简单的搜索实现 - 在实际应用中可以添加防抖
    const params = {};
    if (value.trim()) {
      params.search = value.trim();
    }
    if (typeFilter !== 'all') {
      params.type = typeFilter;
    }
    
    dispatch(fetchEntries(params));
  };

  const handleTypeFilter = (type) => {
    setTypeFilter(type);
    const params = {};
    if (searchTerm.trim()) {
      params.search = searchTerm.trim();
    }
    if (type !== 'all') {
      params.type = type;
    }
    
    dispatch(fetchEntries(params));
  };

  const getTypeIcon = (type) => {
    return type === 'person' ? <Person /> : <Inventory />;
  };

  const getTypeColor = (type) => {
    return type === 'person' ? 'secondary' : 'primary';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const renderImportanceStars = (score) => {
    const stars = [];
    const fullStars = Math.floor(score / 2);
    const hasHalfStar = score % 2 === 1;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} sx={{ color: 'gold', fontSize: 16 }} />);
    }
    if (hasHalfStar) {
      stars.push(<Star key="half" sx={{ color: 'gold', fontSize: 16, opacity: 0.5 }} />);
    }
    
    return stars;
  };

  if (loading && entries.length === 0) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* 页面标题和操作 */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          我的条目
        </Typography>
        <Button
          component={RouterLink}
          to="/entries/create"
          variant="contained"
          startIcon={<Add />}
          size="large"
        >
          添加条目
        </Button>
      </Box>

      {/* 错误提示 */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {typeof error === 'string' ? error : '加载条目时出错，请重试'}
        </Alert>
      )}

      {/* 搜索和过滤 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="搜索条目..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box display="flex" gap={1}>
              <Chip
                label="全部"
                color={typeFilter === 'all' ? 'primary' : 'default'}
                onClick={() => handleTypeFilter('all')}
                clickable
              />
              <Chip
                label="物品"
                color={typeFilter === 'item' ? 'primary' : 'default'}
                onClick={() => handleTypeFilter('item')}
                clickable
                icon={<Inventory />}
              />
              <Chip
                label="人物"
                color={typeFilter === 'person' ? 'secondary' : 'default'}
                onClick={() => handleTypeFilter('person')}
                clickable
                icon={<Person />}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* 条目列表 */}
      {entries.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            {searchTerm || typeFilter !== 'all' ? '没有找到匹配的条目' : '暂无条目'}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            {searchTerm || typeFilter !== 'all' 
              ? '尝试调整搜索条件或过滤器' 
              : '开始添加您的第一个条目，记录珍贵的回忆吧！'
            }
          </Typography>
          
          <Button
            component={RouterLink}
            to="/entries/create"
            variant="contained"
            startIcon={<Add />}
            size="large"
          >
            {searchTerm || typeFilter !== 'all' ? '添加新条目' : '添加第一个条目'}
          </Button>
        </Paper>
      ) : (
        <>
          <Grid container spacing={3}>
            {entries.map((entry) => (
              <Grid item xs={12} sm={6} md={4} key={entry.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  {/* 条目图片 */}
                  {entry.primary_image && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={entry.primary_image}
                      alt={entry.title}
                      sx={{ objectFit: 'cover' }}
                    />
                  )}
                  
                  <CardContent sx={{ flexGrow: 1 }}>
                    {/* 类型标签 */}
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Chip
                        icon={getTypeIcon(entry.type)}
                        label={entry.type === 'person' ? '人物' : '物品'}
                        color={getTypeColor(entry.type)}
                        size="small"
                      />
                      <Box display="flex" alignItems="center">
                        {renderImportanceStars(entry.importance_score)}
                        <Typography variant="caption" sx={{ ml: 0.5 }}>
                          {entry.importance_score}/10
                        </Typography>
                      </Box>
                    </Box>
                    
                    {/* 标题 */}
                    <Typography variant="h6" component="h2" gutterBottom noWrap>
                      {entry.title}
                    </Typography>
                    
                    {/* 描述 */}
                    <Typography 
                      variant="body2" 
                      color="textSecondary" 
                      sx={{ 
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {entry.description || '暂无描述'}
                    </Typography>
                    
                    {/* 标签 */}
                    {entry.tags && entry.tags.length > 0 && (
                      <Box display="flex" flexWrap="wrap" gap={0.5} mb={1}>
                        {entry.tags.slice(0, 3).map((tag, index) => (
                          <Chip
                            key={index}
                            label={tag}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                        {entry.tags.length > 3 && (
                          <Chip
                            label={`+${entry.tags.length - 3}`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    )}
                    
                    {/* 故事状态 */}
                    {entry.has_story && (
                      <Chip
                        label="有故事"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    )}
                    
                    {/* 创建时间 */}
                    <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                      创建于 {formatDate(entry.created_at)}
                    </Typography>
                  </CardContent>
                  
                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => navigate(`/entries/${entry.id}`)}
                    >
                      查看
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => navigate(`/entries/${entry.id}/edit`)}
                    >
                      编辑
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {/* 分页信息 */}
          {pagination.count > entries.length && (
            <Box textAlign="center" sx={{ mt: 4 }}>
              <Typography variant="body2" color="textSecondary">
                显示 {entries.length} / {pagination.count} 个条目
              </Typography>
              {pagination.next && (
                <Button
                  variant="outlined"
                  sx={{ mt: 2 }}
                  onClick={() => {
                    // TODO: 实现加载更多功能
                    console.log('Load more entries');
                  }}
                >
                  加载更多
                </Button>
              )}
            </Box>
          )}
        </>
      )}

      {/* 浮动添加按钮 */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        component={RouterLink}
        to="/entries/create"
      >
        <Add />
      </Fab>
    </Container>
  );
};

export default EntriesPage;