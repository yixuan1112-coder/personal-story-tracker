from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    自定义用户模型，扩展Django默认用户模型
    """
    email = models.EmailField(unique=True)
    display_name = models.CharField(max_length=100, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    
    # 用户偏好设置
    theme = models.CharField(
        max_length=20, 
        choices=[('light', '浅色'), ('dark', '深色')], 
        default='light'
    )
    default_currency = models.CharField(max_length=3, default='CNY')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    class Meta:
        db_table = 'users'
        verbose_name = '用户'
        verbose_name_plural = '用户'
    
    def __str__(self):
        return self.display_name or self.username