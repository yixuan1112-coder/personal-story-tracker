# 🇨🇳 国内云服务器部署指南

## 🏢 推荐云服务商

### 1. 阿里云 (推荐)
- **ECS云服务器**: ¥100-300/月
- **RDS数据库**: ¥50-200/月  
- **CDN加速**: ¥20-50/月
- **域名**: ¥50-100/年

### 2. 腾讯云
- **CVM云服务器**: ¥100-300/月
- **TencentDB**: ¥50-200/月
- **CDN**: ¥20-50/月

### 3. 华为云
- **ECS**: ¥100-300/月
- **RDS**: ¥50-200/月

## 🚀 部署步骤

### 第一步: 购买云服务器

#### 配置推荐
- **CPU**: 2核心
- **内存**: 4GB
- **硬盘**: 40GB SSD
- **带宽**: 5Mbps
- **操作系统**: Ubuntu 20.04 LTS

### 第二步: 服务器环境配置

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Python
sudo apt install python3 python3-pip python3-venv -y

# 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装Nginx
sudo apt install nginx -y

# 安装PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# 安装Git
sudo apt install git -y
```

### 第三步: 部署后端

```bash
# 克隆项目
git clone https://github.com/你的用户名/personal-story-tracker.git
cd personal-story-tracker/backend

# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt
pip install gunicorn psycopg2-binary

# 配置数据库
sudo -u postgres createdb personal_story_tracker
sudo -u postgres createuser --interactive

# 数据库迁移
python manage.py migrate
python manage.py collectstatic --noinput

# 创建超级用户
python manage.py createsuperuser
```

### 第四步: 部署前端

```bash
cd ../frontend

# 安装依赖
npm install

# 构建生产版本
npm run build
```

### 第五步: Nginx配置

```nginx
# /etc/nginx/sites-available/personal-story-tracker
server {
    listen 80;
    server_name 你的域名.com;

    # 前端静态文件
    location / {
        root /path/to/personal-story-tracker/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # 后端API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 静态文件
    location /static/ {
        alias /path/to/personal-story-tracker/backend/staticfiles/;
    }

    # 媒体文件
    location /media/ {
        alias /path/to/personal-story-tracker/backend/media/;
    }
}
```

### 第六步: 系统服务配置

```ini
# /etc/systemd/system/personal-story-tracker.service
[Unit]
Description=Personal Story Tracker Django App
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/path/to/personal-story-tracker/backend
Environment="PATH=/path/to/personal-story-tracker/backend/venv/bin"
ExecStart=/path/to/personal-story-tracker/backend/venv/bin/gunicorn --workers 3 --bind 127.0.0.1:8000 story_tracker.wsgi:application
Restart=always

[Install]
WantedBy=multi-user.target
```

### 第七步: 启动服务

```bash
# 启用Nginx配置
sudo ln -s /etc/nginx/sites-available/personal-story-tracker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 启动Django服务
sudo systemctl daemon-reload
sudo systemctl start personal-story-tracker
sudo systemctl enable personal-story-tracker
```

### 第八步: SSL证书配置

```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取SSL证书
sudo certbot --nginx -d 你的域名.com

# 自动续期
sudo crontab -e
# 添加: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔧 生产环境配置

### 环境变量
```bash
# /path/to/personal-story-tracker/backend/.env
DEBUG=False
SECRET_KEY=你的超长密钥
ALLOWED_HOSTS=你的域名.com,www.你的域名.com
DB_ENGINE=postgresql
DB_NAME=personal_story_tracker
DB_USER=你的数据库用户
DB_PASSWORD=你的数据库密码
DB_HOST=localhost
DB_PORT=5432
```

### 安全配置
```python
# settings.py 生产环境配置
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
```

## 📊 监控和维护

### 日志监控
```bash
# 查看应用日志
sudo journalctl -u personal-story-tracker -f

# 查看Nginx日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 备份脚本
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump personal_story_tracker > backup_$DATE.sql
tar -czf media_backup_$DATE.tar.gz /path/to/media/
```

## 💰 成本预算

### 基础配置 (个人使用)
- 云服务器: ¥100/月
- 数据库: ¥50/月
- 域名: ¥60/年
- SSL证书: 免费
- **总计**: ~¥150/月

### 高级配置 (商业使用)
- 高配服务器: ¥300/月
- 负载均衡: ¥100/月
- CDN加速: ¥50/月
- 备份存储: ¥30/月
- **总计**: ~¥480/月

## 🎯 性能优化

### 数据库优化
```sql
-- 创建索引
CREATE INDEX idx_entries_user_id ON entries_entry(user_id);
CREATE INDEX idx_entries_created_at ON entries_entry(created_at);
```

### 缓存配置
```python
# Redis缓存
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
    }
}
```

## 🚀 扩展方案

### 多服务器部署
- 前端CDN分发
- 后端负载均衡
- 数据库读写分离
- Redis集群缓存

### 容器化部署
- Docker容器
- Kubernetes编排
- 自动扩缩容