"""
开发环境配置
"""

from .settings import *

# 开发环境特定设置
DEBUG = True

# 允许所有主机（仅开发环境）
ALLOWED_HOSTS = ['*']

# 开发环境数据库配置
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# 开发环境CORS设置
CORS_ALLOW_ALL_ORIGINS = True

# 开发环境日志配置
LOGGING['handlers']['console']['level'] = 'DEBUG'
LOGGING['loggers']['story_tracker']['level'] = 'DEBUG'

# 开发环境邮件后端
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# 开发环境缓存
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    }
}

# 开发环境静态文件
STATICFILES_DIRS = [
    BASE_DIR / 'static',
]