import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  IconButton,
} from '@mui/material';
import {
  Edit,
  Delete,
  ArrowBack,
  Person,
  Inventory,
  Star,
  DateRange,
  AttachMoney,
  Category,
  Save,
  Cancel,
} from '@mui/icons-material';
import { fetchEntry, deleteEntry, updateStory, clearError } from '../../store/slices/entriesSlice';

const EntryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentEntry: entry, loading, error } = useSelector((state) => state.entries);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingStory, setEditingStory] = useState(false);
  const [storyContent, setStoryContent] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(fetchEntry(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (entry && entry.story_content) {
      setStoryContent(entry.story_content);
    }
  }, [entry]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleDelete = async () => {
    try {
      await dispatch(deleteEntry(id)).unwrap();
      navigate('/entries');
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  const handleSaveStory = async () => {
    try {
      await dispatch(updateStory({ id, story_content: storyContent })).unwrap();
      setEditingStory(false);
    } catch (error) {
      console.error('保存故事失败:', error);
    }
  };

  const handleCancelEditStory = () => {
    setStoryContent(entry?.story_content || '');
    setEditingStory(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '未设置';
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const formatPrice = (price, currency = 'CNY') => {
    if (!price) return '未设置';
    return `¥${parseFloat(price).toLocaleString()}`;
  };

  const getTypeIcon = (type) => {
    return type === 'person' ? <Person /> : <Inventory />;
  };

  const getTypeColor = (type) => {
    return type === 'person' ? 'secondary' : 'primary';
  };

  const renderImportanceSection = () => {
    if (!entry) return null;

    const importanceFields = [
      { key: 'importance_score', label: '综合重要度', value: entry.importance_score },
      { key: 'emotional_value', label: '情感价值', value: entry.emotional_value },
      { key: 'practical_value', label: '实用价值', value: entry.practical_value },
      { key: 'frequency_of_use', label: '使用频率', value: entry.frequency_of_use },
      { key: 'duration_owned', label: '拥有时长重要性', value: entry.duration_owned },
    ];

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            重要度评估
          </Typography>
          <Grid container spacing={2}>
            {importanceFields.map((field) => (
              <Grid item xs={12} sm={6} key={field.key}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">{field.label}</Typography>
                  <Box display="flex" alignItems="center">
                    <Rating
                      value={field.value / 2}
                      precision={0.5}
                      size="small"
                      readOnly
                    />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {field.value}/10
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
          {entry.calculated_importance && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
              <Typography variant="body2" color="primary.contrastText">
                计算得出的综合重要度: {entry.calculated_importance}/10
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 3 }}>
          {typeof error === 'string' ? error : '加载条目详情时出错'}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/entries')}
          sx={{ mt: 2 }}
        >
          返回条目列表
        </Button>
      </Container>
    );
  }

  if (!entry) {
    return (
      <Container maxWidth="lg">
        <Alert severity="warning" sx={{ mt: 3 }}>
          条目不存在
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/entries')}
          sx={{ mt: 2 }}
        >
          返回条目列表
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* 页面头部 */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box display="flex" alignItems="center">
          <IconButton onClick={() => navigate('/entries')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4" component="h1">
              {entry.title}
            </Typography>
            <Box display="flex" alignItems="center" gap={1} sx={{ mt: 1 }}>
              <Chip
                icon={getTypeIcon(entry.type)}
                label={entry.type === 'person' ? '人物' : '物品'}
                color={getTypeColor(entry.type)}
                size="small"
              />
              <Typography variant="body2" color="textSecondary">
                创建于 {formatDate(entry.created_at)}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => navigate(`/entries/${entry.id}/edit`)}
          >
            编辑
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={() => setDeleteDialogOpen(true)}
          >
            删除
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* 左侧：基本信息和图片 */}
        <Grid item xs={12} md={8}>
          {/* 主要图片 */}
          {entry.media_files && entry.media_files.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardMedia
                component="img"
                height="400"
                image={entry.media_files.find(m => m.is_primary)?.file_url || entry.media_files[0]?.file_url}
                alt={entry.title}
                sx={{ objectFit: 'cover' }}
              />
            </Card>
          )}

          {/* 基本信息 */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                基本信息
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    描述
                  </Typography>
                  <Typography variant="body1">
                    {entry.description || '暂无描述'}
                  </Typography>
                </Grid>

                {entry.type === 'item' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">
                        获得日期
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(entry.acquisition_date)}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">
                        获得方式
                      </Typography>
                      <Typography variant="body1">
                        {entry.acquisition_method || '未设置'}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">
                        原始价格
                      </Typography>
                      <Typography variant="body1">
                        {formatPrice(entry.original_price, entry.currency)}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">
                        类别
                      </Typography>
                      <Typography variant="body1">
                        {entry.category || '未分类'}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">
                        状况
                      </Typography>
                      <Typography variant="body1">
                        {entry.condition || '未设置'}
                      </Typography>
                    </Grid>
                  </>
                )}

                {entry.type === 'person' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">
                        关系
                      </Typography>
                      <Typography variant="body1">
                        {entry.relationship || '未设置'}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">
                        认识日期
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(entry.meeting_date)}
                      </Typography>
                    </Grid>
                  </>
                )}

                {entry.tags && entry.tags.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      标签
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {entry.tags.map((tag, index) => (
                        <Chip key={index} label={tag} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* 故事内容 */}
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  故事内容
                </Typography>
                {!editingStory && (
                  <Button
                    size="small"
                    startIcon={<Edit />}
                    onClick={() => setEditingStory(true)}
                  >
                    编辑故事
                  </Button>
                )}
              </Box>

              {editingStory ? (
                <Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={8}
                    value={storyContent}
                    onChange={(e) => setStoryContent(e.target.value)}
                    placeholder="在这里记录您的故事..."
                    sx={{ mb: 2 }}
                  />
                  <Box display="flex" gap={1}>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSaveStory}
                    >
                      保存
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={handleCancelEditStory}
                    >
                      取消
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box>
                  {entry.story_content ? (
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {entry.story_content}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                      暂无故事内容。点击"编辑故事"开始记录您的回忆。
                    </Typography>
                  )}
                  
                  {entry.story_last_modified && (
                    <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 2 }}>
                      故事最后更新: {formatDate(entry.story_last_modified)}
                    </Typography>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 右侧：重要度评估和其他信息 */}
        <Grid item xs={12} md={4}>
          {renderImportanceSection()}

          {/* 其他媒体文件 */}
          {entry.media_files && entry.media_files.length > 1 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  其他图片
                </Typography>
                <Grid container spacing={1}>
                  {entry.media_files
                    .filter(media => !media.is_primary)
                    .map((media) => (
                      <Grid item xs={6} key={media.id}>
                        <CardMedia
                          component="img"
                          height="100"
                          image={media.file_url}
                          alt={media.caption || entry.title}
                          sx={{ 
                            objectFit: 'cover',
                            borderRadius: 1,
                            cursor: 'pointer',
                          }}
                        />
                      </Grid>
                    ))}
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* 统计信息 */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                统计信息
              </Typography>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  条目年龄
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {entry.age_in_days} 天
                </Typography>
                
                <Typography variant="body2" color="textSecondary">
                  最后更新
                </Typography>
                <Typography variant="body1">
                  {formatDate(entry.updated_at)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 删除确认对话框 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <Typography>
            您确定要删除条目 "{entry.title}" 吗？此操作无法撤销。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            取消
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EntryDetailPage;