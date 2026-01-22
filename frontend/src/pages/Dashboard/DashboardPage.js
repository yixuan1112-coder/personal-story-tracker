import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  LibraryBooks,
  Person,
  TrendingUp,
  Inventory,
  Star,
  Schedule,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { fetchStatistics, fetchEntries } from '../../store/slices/entriesSlice';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { entries, statistics, loading } = useSelector((state) => state.entries);

  useEffect(() => {
    dispatch(fetchStatistics());
    dispatch(fetchEntries({ ordering: '-updated_at', limit: 5 })); // 获取最近5个条目
  }, [dispatch]);

  const quickActions = [
    {
      title: '添加物品',
      description: '记录新的物品和它的故事',
      icon: <Add />,
      link: '/entries/create?type=item',
      color: 'primary',
    },
    {
      title: '添加人物',
      description: '记录重要人物的故事',
      icon: <Person />,
      link: '/entries/create?type=person',
      color: 'secondary',
    },
    {
      title: '浏览条目',
      description: '查看所有已记录的条目',
      icon: <LibraryBooks />,
      link: '/entries',
      color: 'info',
    },
  ];

  const getStatsData = () => {
    if (!statistics) {
      return [
        { label: '总条目数', value: '0', icon: <LibraryBooks /> },
        { label: '物品条目', value: '0', icon: <Inventory /> },
        { label: '人物条目', value: '0', icon: <Person /> },
        { label: '有故事的条目', value: '0', icon: <Schedule /> },
      ];
    }

    return [
      { 
        label: '总条目数', 
        value: statistics.total_count?.toString() || '0', 
        icon: <LibraryBooks />,
        color: 'primary'
      },
      { 
        label: '物品条目', 
        value: statistics.item_count?.toString() || '0', 
        icon: <Inventory />,
        color: 'info'
      },
      { 
        label: '人物条目', 
        value: statistics.person_count?.toString() || '0', 
        icon: <Person />,
        color: 'secondary'
      },
      { 
        label: '有故事的条目', 
        value: statistics.with_story_count?.toString() || '0', 
        icon: <Schedule />,
        color: 'success'
      },
    ];
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const getTypeIcon = (type) => {
    return type === 'person' ? <Person /> : <Inventory />;
  };

  const getTypeColor = (type) => {
    return type === 'person' ? 'secondary' : 'primary';
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

  const stats = getStatsData();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          欢迎回来，{user?.display_name || user?.username}！
        </Typography>
        <Typography variant="body1" color="textSecondary">
          在这里管理您的个人故事和珍贵回忆
        </Typography>
      </Box>

      {/* 统计卡片 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      {stat.label}
                    </Typography>
                    <Typography variant="h5">
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box color={`${stat.color || 'primary'}.main`}>
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* 左侧：快速操作和最近活动 */}
        <Grid item xs={12} md={8}>
          {/* 快速操作 */}
          <Typography variant="h5" component="h2" gutterBottom>
            快速操作
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {quickActions.map((action, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      elevation: 4,
                    },
                  }}
                >
                  <Box
                    sx={{
                      mb: 2,
                      p: 2,
                      borderRadius: '50%',
                      bgcolor: `${action.color}.light`,
                      color: `${action.color}.contrastText`,
                    }}
                  >
                    {action.icon}
                  </Box>
                  
                  <Typography variant="h6" gutterBottom>
                    {action.title}
                  </Typography>
                  
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {action.description}
                  </Typography>
                  
                  <Button
                    component={RouterLink}
                    to={action.link}
                    variant="contained"
                    color={action.color}
                    sx={{ mt: 'auto' }}
                  >
                    开始
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* 最近活动 */}
          <Typography variant="h5" component="h2" gutterBottom>
            最近活动
          </Typography>
          
          <Paper sx={{ p: 3 }}>
            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : entries.length === 0 ? (
              <>
                <Typography variant="body1" color="textSecondary" textAlign="center">
                  暂无最近活动。开始添加您的第一个条目吧！
                </Typography>
                
                <Box textAlign="center" sx={{ mt: 2 }}>
                  <Button
                    component={RouterLink}
                    to="/entries/create"
                    variant="contained"
                    startIcon={<Add />}
                  >
                    添加第一个条目
                  </Button>
                </Box>
              </>
            ) : (
              <List>
                {entries.slice(0, 5).map((entry, index) => (
                  <ListItem
                    key={entry.id}
                    divider={index < entries.length - 1}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                    onClick={() => window.location.href = `/entries/${entry.id}`}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: entry.type === 'person' ? 'secondary.main' : 'primary.main' }}>
                        {getTypeIcon(entry.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle1">
                            {entry.title}
                          </Typography>
                          <Chip
                            label={entry.type === 'person' ? '人物' : '物品'}
                            size="small"
                            color={getTypeColor(entry.type)}
                          />
                          {entry.has_story && (
                            <Chip
                              label="有故事"
                              size="small"
                              color="success"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {entry.description || '暂无描述'}
                          </Typography>
                          <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mt: 0.5 }}>
                            <Typography variant="caption" color="textSecondary">
                              更新于 {formatDate(entry.updated_at)}
                            </Typography>
                            <Box display="flex" alignItems="center">
                              {renderImportanceStars(entry.importance_score)}
                              <Typography variant="caption" sx={{ ml: 0.5 }}>
                                {entry.importance_score}/10
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
            
            {entries.length > 0 && (
              <Box textAlign="center" sx={{ mt: 2 }}>
                <Button
                  component={RouterLink}
                  to="/entries"
                  variant="outlined"
                >
                  查看所有条目
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* 右侧：统计信息和标签云 */}
        <Grid item xs={12} md={4}>
          {/* 重要度分布 */}
          {statistics && statistics.importance_distribution && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                重要度分布
              </Typography>
              <Box>
                {Object.entries(statistics.importance_distribution)
                  .filter(([score, count]) => count > 0)
                  .sort(([a], [b]) => parseInt(b) - parseInt(a))
                  .map(([score, count]) => (
                    <Box key={score} display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Box display="flex" alignItems="center">
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          {score}分
                        </Typography>
                        {renderImportanceStars(parseInt(score))}
                      </Box>
                      <Typography variant="body2" color="textSecondary">
                        {count} 个
                      </Typography>
                    </Box>
                  ))}
              </Box>
            </Paper>
          )}

          {/* 热门标签 */}
          {statistics && statistics.tags && statistics.tags.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                热门标签
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {statistics.tags.slice(0, 10).map(([tag, count]) => (
                  <Chip
                    key={tag}
                    label={`${tag} (${count})`}
                    size="small"
                    variant="outlined"
                    clickable
                    onClick={() => window.location.href = `/entries?tags=${encodeURIComponent(tag)}`}
                  />
                ))}
              </Box>
            </Paper>
          )}

          {/* 类别统计 */}
          {statistics && (statistics.categories?.length > 0 || statistics.relationships?.length > 0) && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                分类统计
              </Typography>
              
              {statistics.categories && statistics.categories.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    物品类别
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {statistics.categories.slice(0, 5).map((category) => (
                      <Chip
                        key={category}
                        label={category}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}
              
              {statistics.relationships && statistics.relationships.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    人物关系
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {statistics.relationships.slice(0, 5).map((relationship) => (
                      <Chip
                        key={relationship}
                        label={relationship}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPage;