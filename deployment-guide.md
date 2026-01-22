# 🌍 全国访问部署指南

## 📋 部署架构
- **前端**: Vercel/Netlify (免费)
- **后端**: Railway/Render (免费额度)
- **数据库**: PostgreSQL (云端)
- **域名**: 可选购买自定义域名

## 🎯 部署步骤

### 1. 前端部署 (Vercel - 推荐)

#### 准备工作
1. 注册GitHub账号: https://github.com
2. 注册Vercel账号: https://vercel.com
3. 将项目上传到GitHub

#### 部署步骤
1. **创建GitHub仓库**
   ```bash
   # 在项目根目录执行
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/你的用户名/personal-story-tracker.git
   git push -u origin main
   ```

2. **Vercel部署**
   - 登录Vercel，点击"New Project"
   - 选择GitHub仓库
   - 设置构建配置：
     - Framework Preset: Create React App
     - Root Directory: frontend
     - Build Command: npm run build
     - Output Directory: build

3. **环境变量配置**
   ```
   REACT_APP_API_URL=https://你的后端域名.com/api
   ```

### 2. 后端部署 (Railway - 推荐)

#### 准备工作
1. 注册Railway账号: https://railway.app
2. 准备后端代码

#### 部署步骤
1. **创建Railway项目**
   - 登录Railway
   - 点击"New Project"
   - 选择"Deploy from GitHub repo"

2. **配置环境变量**
   ```
   DEBUG=False
   SECRET_KEY=你的密钥
   DB_ENGINE=postgresql
   DB_NAME=railway
   DB_USER=postgres
   DB_PASSWORD=自动生成
   DB_HOST=自动生成
   DB_PORT=5432
   ALLOWED_HOSTS=你的域名.railway.app,localhost
   ```

3. **添加Procfile**
   ```
   web: python manage.py migrate && python manage.py collectstatic --noinput && gunicorn story_tracker.wsgi
   ```

### 3. 数据库配置

Railway会自动提供PostgreSQL数据库，无需额外配置。

### 4. 域名配置 (可选)

#### 免费域名
- Vercel: 自动提供 `项目名.vercel.app`
- Railway: 自动提供 `项目名.railway.app`

#### 自定义域名
1. 购买域名 (阿里云、腾讯云等)
2. 在Vercel/Railway中添加自定义域名
3. 配置DNS解析

## 🔧 生产环境优化

### 安全配置
1. **HTTPS强制**
2. **CSRF保护**
3. **SQL注入防护**
4. **XSS防护**

### 性能优化
1. **CDN加速**
2. **静态文件压缩**
3. **数据库索引优化**
4. **缓存策略**

## 💰 成本估算

### 免费方案
- Vercel: 免费 (个人项目)
- Railway: $5/月 (包含数据库)
- 总计: ~$5/月

### 付费方案
- 阿里云ECS: ¥100-300/月
- 腾讯云: ¥100-300/月
- AWS/Azure: $20-50/月

## 🚀 快速部署命令

### 前端构建
```bash
cd frontend
npm run build
```

### 后端准备
```bash
cd backend
pip install -r requirements.txt
python manage.py collectstatic
python manage.py migrate
```

## 📱 移动端适配

应用已支持响应式设计，自动适配手机、平板等设备。

## 🔍 监控和维护

### 日志监控
- Railway提供实时日志
- Vercel提供访问统计

### 备份策略
- 数据库自动备份
- 代码版本控制

## 🎉 部署完成后

1. **测试功能**
   - 用户注册/登录
   - 条目创建/编辑
   - 数据同步

2. **分享链接**
   - 前端: https://你的项目.vercel.app
   - API: https://你的项目.railway.app/api

3. **用户指南**
   - 创建使用说明
   - 功能介绍视频
   - 常见问题解答

## 🛠️ 故障排除

### 常见问题
1. **CORS错误**: 检查后端CORS配置
2. **数据库连接**: 验证环境变量
3. **静态文件**: 确保collectstatic执行成功

### 联系支持
- GitHub Issues
- 部署平台客服
- 技术社区求助