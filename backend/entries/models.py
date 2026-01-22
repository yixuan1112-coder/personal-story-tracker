from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone

User = get_user_model()


class Entry(models.Model):
    """条目模型 - 支持物品和人物两种类型"""
    
    ENTRY_TYPES = [
        ('item', '物品'),
        ('person', '人物'),
    ]
    
    ACQUISITION_METHODS = [
        ('purchase', '购买'),
        ('gift', '礼物'),
        ('inheritance', '继承'),
        ('found', '发现'),
        ('made', '制作'),
        ('other', '其他'),
    ]
    
    CONDITION_CHOICES = [
        ('new', '全新'),
        ('excellent', '优秀'),
        ('good', '良好'),
        ('fair', '一般'),
        ('poor', '较差'),
    ]
    
    RELATIONSHIP_CHOICES = [
        ('family', '家人'),
        ('friend', '朋友'),
        ('colleague', '同事'),
        ('mentor', '导师'),
        ('partner', '伴侣'),
        ('acquaintance', '熟人'),
        ('other', '其他'),
    ]
    
    # 基本信息
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='entries')
    type = models.CharField(max_length=10, choices=ENTRY_TYPES)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, help_text='简短描述')
    
    # 故事内容
    story_content = models.TextField(blank=True, help_text='详细故事内容，支持富文本')
    story_last_modified = models.DateTimeField(null=True, blank=True)
    
    # 物品特有字段
    acquisition_date = models.DateField(null=True, blank=True, help_text='获得日期')
    acquisition_method = models.CharField(
        max_length=20, 
        choices=ACQUISITION_METHODS, 
        null=True, 
        blank=True,
        help_text='获得方式'
    )
    original_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text='原始价格'
    )
    currency = models.CharField(max_length=3, default='CNY', help_text='货币类型')
    category = models.CharField(max_length=100, blank=True, help_text='物品类别')
    condition = models.CharField(
        max_length=20, 
        choices=CONDITION_CHOICES, 
        null=True, 
        blank=True,
        help_text='物品状况'
    )
    
    # 人物特有字段
    relationship = models.CharField(
        max_length=20, 
        choices=RELATIONSHIP_CHOICES,
        blank=True,
        help_text='关系类型'
    )
    meeting_date = models.DateField(null=True, blank=True, help_text='认识日期')
    contact_info = models.JSONField(default=dict, blank=True, help_text='联系信息')
    
    # 重要度评估 - 使用验证器确保分数在1-10范围内
    importance_score = models.IntegerField(
        default=5, 
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text='综合重要度 1-10分'
    )
    emotional_value = models.IntegerField(
        default=5, 
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text='情感价值 1-10分'
    )
    practical_value = models.IntegerField(
        default=5, 
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text='实用价值 1-10分'
    )
    frequency_of_use = models.IntegerField(
        default=5, 
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text='使用频率 1-10分'
    )
    duration_owned = models.IntegerField(
        default=5, 
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text='拥有时长重要性 1-10分'
    )
    importance_last_evaluated = models.DateTimeField(null=True, blank=True)
    
    # 视觉定制
    theme = models.CharField(max_length=50, default='default', help_text='主题样式')
    decorations = models.JSONField(default=list, blank=True, help_text='装饰元素')
    layout = models.CharField(max_length=50, default='default', help_text='布局样式')
    
    # 标签和分类
    tags = models.JSONField(default=list, blank=True, help_text='标签列表')
    is_private = models.BooleanField(default=False, help_text='是否私有')
    
    # 时间戳
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'entries'
        verbose_name = '条目'
        verbose_name_plural = '条目'
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['user', 'type']),
            models.Index(fields=['user', 'importance_score']),
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['user', 'updated_at']),
        ]
    
    def __str__(self):
        return f"{self.get_type_display()}: {self.title}"
    
    def save(self, *args, **kwargs):
        """重写save方法，自动更新故事修改时间"""
        # 如果有故事内容且是新创建的条目，设置故事修改时间
        if not self.pk and self.story_content and self.story_content.strip():
            self.story_last_modified = timezone.now()
        elif self.pk:  # 如果是更新操作
            try:
                old_instance = Entry.objects.get(pk=self.pk)
                if old_instance.story_content != self.story_content:
                    self.story_last_modified = timezone.now()
            except Entry.DoesNotExist:
                pass
        super().save(*args, **kwargs)
    
    @property
    def calculated_importance(self):
        """计算综合重要度分数"""
        return round(
            self.emotional_value * 0.35 + 
            self.practical_value * 0.25 + 
            self.frequency_of_use * 0.25 +
            self.duration_owned * 0.15,
            2
        )
    
    @property
    def age_in_days(self):
        """计算条目年龄（天数）"""
        if self.acquisition_date:
            return (timezone.now().date() - self.acquisition_date).days
        elif self.meeting_date:
            return (timezone.now().date() - self.meeting_date).days
        else:
            return (timezone.now().date() - self.created_at.date()).days
    
    @property
    def has_story(self):
        """检查是否有故事内容"""
        return bool(self.story_content and self.story_content.strip())
    
    def update_importance_evaluation(self):
        """更新重要度评估时间"""
        self.importance_last_evaluated = timezone.now()
        self.save(update_fields=['importance_last_evaluated'])
    
    def get_primary_media(self):
        """获取主要媒体文件"""
        return self.media_files.filter(is_primary=True).first()
    
    def clean(self):
        """模型验证"""
        from django.core.exceptions import ValidationError
        
        # 验证物品特有字段
        if self.type == 'item':
            if self.original_price is not None and self.original_price < 0:
                raise ValidationError({'original_price': '价格不能为负数'})
        
        # 验证人物特有字段
        if self.type == 'person':
            if self.meeting_date and self.meeting_date > timezone.now().date():
                raise ValidationError({'meeting_date': '认识日期不能是未来日期'})
        
        # 验证获得日期
        if self.acquisition_date and self.acquisition_date > timezone.now().date():
            raise ValidationError({'acquisition_date': '获得日期不能是未来日期'})


class EntryMedia(models.Model):
    """条目媒体文件模型"""
    
    MEDIA_TYPES = [
        ('image', '图片'),
        ('video', '视频'),
    ]
    
    entry = models.ForeignKey(Entry, on_delete=models.CASCADE, related_name='media_files')
    type = models.CharField(max_length=10, choices=MEDIA_TYPES, default='image')
    file = models.FileField(upload_to='entry_media/')
    caption = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'entry_media'
        verbose_name = '条目媒体'
        verbose_name_plural = '条目媒体'
        ordering = ['-is_primary', '-created_at']
    
    def __str__(self):
        return f"{self.entry.title} - {self.get_type_display()}"