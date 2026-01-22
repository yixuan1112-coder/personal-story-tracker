import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Slider,
  FormHelperText,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Person,
  Inventory,
  Add,
  Remove,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { zhCN } from 'date-fns/locale';
import { createEntry, updateEntry, fetchEntry, clearError } from '../../store/slices/entriesSlice';

const EntryFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { currentEntry, loading, error } = useSelector((state) => state.entries);
  
  const isEditing = Boolean(id);
  const initialType = searchParams.get('type') || 'item';
  
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    type: initialType,
    title: '',
    description: '',
    story_content: '',
    
    // 物品字段
    acquisition_date: null,
    acquisition_method: '',
    original_price: '',
    currency: 'CNY',
    category: '',
    condition: '',
    
    // 人物字段
    relationship: '',
    meeting_date: null,
    
    // 重要度评估
    importance_score: 5,
    emotional_value: 5,
    practical_value: 5,
    frequency_of_use: 5,
    duration_owned: 5,
    
    // 其他
    tags: [],
    is_private: false,
  });
  
  const [newTag, setNewTag] = useState('');

  const steps = ['基本信息', '详细信息', '重要度评估', '故事内容'];

  const acquisitionMethods = [
    { value: 'purchase', label: '购买' },
    { value: 'gift', label: '礼物' },
    { value: 'inheritance', label: '继承' },
    { value: 'found', label: '发现' },
    { value: 'made', label: '制作' },
    { value: 'other', label: '其他' },
  ];

  const conditions = [
    { value: 'new', label: '全新' },
    { value: 'excellent', label: '优秀' },
    { value: 'good', label: '良好' },
    { value: 'fair', label: '一般' },
    { value: 'poor', label: '较差' },
  ];

  const relationships = [
    { value: 'family', label: '家人' },
    { value: 'friend', label: '朋友' },
    { value: 'colleague', label: '同事' },
    { value: 'mentor', label: '导师' },
    { value: 'partner', label: '伴侣' },
    { value: 'acquaintance', label: '熟人' },
    { value: 'other', label: '其他' },
  ];

  useEffect(() => {
    if (isEditing && id) {
      dispatch(fetchEntry(id));
    }
  }, [dispatch, isEditing, id]);

  useEffect(() => {
    if (isEditing && currentEntry) {
      setFormData({
        type: currentEntry.type,
        title: currentEntry.title || '',
        description: currentEntry.description || '',
        story_content: currentEntry.story_content || '',
        acquisition_date: currentEntry.acquisition_date ? new Date(currentEntry.acquisition_date) : null,
        acquisition_method: currentEntry.acquisition_method || '',
        original_price: currentEntry.original_price || '',
        currency: currentEntry.currency || 'CNY',
        category: currentEntry.category || '',
        condition: currentEntry.condition || '',
        relationship: currentEntry.relationship || '',
        meeting_date: currentEntry.meeting_date ? new Date(currentEntry.meeting_date) : null,
        importance_score: currentEntry.importance_score || 5,
        emotional_value: currentEntry.emotional_value || 5,
        practical_value: currentEntry.practical_value || 5,
        frequency_of_use: currentEntry.frequency_of_use || 5,
        duration_owned: currentEntry.duration_owned || 5,
        tags: currentEntry.tags || [],
        is_private: currentEntry.is_private || false,
      });
    }
  }, [isEditing, currentEntry]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleNext = () => {
    setActiveStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setActiveStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    try {
      const submitData = { ...formData };
      
      // 转换日期格式
      if (submitData.acquisition_date) {
        submitData.acquisition_date = submitData.acquisition_date.toISOString().split('T')[0];
      }
      if (submitData.meeting_date) {
        submitData.meeting_date = submitData.meeting_date.toISOString().split('T')[0];
      }
      
      // 转换价格为数字
      if (submitData.original_price) {
        submitData.original_price = parseFloat(submitData.original_price);
      }

      if (isEditing) {
        await dispatch(updateEntry({ id, data: submitData })).unwrap();
      } else {
        await dispatch(createEntry(submitData)).unwrap();
      }
      
      navigate('/entries');
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const renderBasicInfo = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel>类型</InputLabel>
          <Select
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
            disabled={isEditing}
          >
            <MenuItem value="item">
              <Box display="flex" alignItems="center">
                <Inventory sx={{ mr: 1 }} />
                物品
              </Box>
            </MenuItem>
            <MenuItem value="person">
              <Box display="flex" alignItems="center">
                <Person sx={{ mr: 1 }} />
                人物
              </Box>
            </MenuItem>
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label={formData.type === 'person' ? '姓名' : '标题'}
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          required
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="描述"
          multiline
          rows={3}
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="简短描述这个条目..."
        />
      </Grid>
    </Grid>
  );

  const renderDetailedInfo = () => (
    <Grid container spacing={3}>
      {formData.type === 'item' ? (
        <>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhCN}>
              <DatePicker
                label="获得日期"
                value={formData.acquisition_date}
                onChange={(date) => handleInputChange('acquisition_date', date)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>获得方式</InputLabel>
              <Select
                value={formData.acquisition_method}
                onChange={(e) => handleInputChange('acquisition_method', e.target.value)}
              >
                {acquisitionMethods.map((method) => (
                  <MenuItem key={method.value} value={method.value}>
                    {method.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="原始价格"
              type="number"
              value={formData.original_price}
              onChange={(e) => handleInputChange('original_price', e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">¥</InputAdornment>,
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="类别"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              placeholder="如：电子产品、书籍、衣物等"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>状况</InputLabel>
              <Select
                value={formData.condition}
                onChange={(e) => handleInputChange('condition', e.target.value)}
              >
                {conditions.map((condition) => (
                  <MenuItem key={condition.value} value={condition.value}>
                    {condition.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </>
      ) : (
        <>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>关系</InputLabel>
              <Select
                value={formData.relationship}
                onChange={(e) => handleInputChange('relationship', e.target.value)}
              >
                {relationships.map((relationship) => (
                  <MenuItem key={relationship.value} value={relationship.value}>
                    {relationship.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhCN}>
              <DatePicker
                label="认识日期"
                value={formData.meeting_date}
                onChange={(date) => handleInputChange('meeting_date', date)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
        </>
      )}
      
      {/* 标签 */}
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          标签
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
          {formData.tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              onDelete={() => handleRemoveTag(tag)}
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>
        <Box display="flex" gap={1}>
          <TextField
            size="small"
            placeholder="添加标签"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
          />
          <Button
            variant="outlined"
            onClick={handleAddTag}
            disabled={!newTag.trim()}
          >
            添加
          </Button>
        </Box>
      </Grid>
    </Grid>
  );

  const renderImportanceEvaluation = () => {
    const importanceFields = [
      { key: 'importance_score', label: '综合重要度', description: '这个条目对您的整体重要性' },
      { key: 'emotional_value', label: '情感价值', description: '这个条目带给您的情感意义' },
      { key: 'practical_value', label: '实用价值', description: '这个条目的实际用途价值' },
      { key: 'frequency_of_use', label: '使用频率', description: '您使用或想起这个条目的频率' },
      { key: 'duration_owned', label: '拥有时长重要性', description: '拥有时间长短对您的意义' },
    ];

    return (
      <Grid container spacing={3}>
        {importanceFields.map((field) => (
          <Grid item xs={12} key={field.key}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  {field.label}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {field.description}
                </Typography>
                <Box sx={{ px: 2 }}>
                  <Slider
                    value={formData[field.key]}
                    onChange={(e, value) => handleInputChange(field.key, value)}
                    min={1}
                    max={10}
                    step={1}
                    marks
                    valueLabelDisplay="on"
                    sx={{ mt: 2 }}
                  />
                </Box>
                <Box display="flex" justifyContent="space-between" sx={{ mt: 1 }}>
                  <Typography variant="caption" color="textSecondary">
                    很低 (1)
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    很高 (10)
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderStoryContent = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          记录您的故事
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          在这里记录与这个{formData.type === 'person' ? '人物' : '物品'}相关的故事、回忆或特殊意义。
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={10}
          value={formData.story_content}
          onChange={(e) => handleInputChange('story_content', e.target.value)}
          placeholder="开始记录您的故事..."
          variant="outlined"
        />
      </Grid>
    </Grid>
  );

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return renderBasicInfo();
      case 1:
        return renderDetailedInfo();
      case 2:
        return renderImportanceEvaluation();
      case 3:
        return renderStoryContent();
      default:
        return null;
    }
  };

  if (loading && isEditing) {
    return (
      <Container maxWidth="md">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhCN}>
      <Container maxWidth="md">
        {/* 页面头部 */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate('/entries')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1">
            {isEditing ? '编辑条目' : '创建新条目'}
          </Typography>
        </Box>

        {/* 错误提示 */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {typeof error === 'string' ? error : '操作失败，请重试'}
          </Alert>
        )}

        {/* 步骤指示器 */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* 表单内容 */}
        <Paper sx={{ p: 3, mb: 3 }}>
          {renderStepContent()}
        </Paper>

        {/* 操作按钮 */}
        <Box display="flex" justifyContent="space-between" sx={{ mb: 4 }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
          >
            上一步
          </Button>
          
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              onClick={() => navigate('/entries')}
            >
              取消
            </Button>
            
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                startIcon={<Save />}
                disabled={loading || !formData.title.trim()}
              >
                {loading ? '保存中...' : (isEditing ? '更新条目' : '创建条目')}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!formData.title.trim()}
              >
                下一步
              </Button>
            )}
          </Box>
        </Box>
      </Container>
    </LocalizationProvider>
  );
};

export default EntryFormPage;