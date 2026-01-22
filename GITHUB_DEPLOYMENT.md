# 🚀 GitHub 部署指南

## 📋 前置要求

### 1. 安装Git
- 下载地址：https://git-scm.com/download/win
- 安装时选择"Add Git to PATH"
- 重启命令行窗口

### 2. 配置Git（首次使用）
```bash
git config --global user.name "您的用户名"
git config --global user.email "您的邮箱"
```

## 🌐 GitHub部署步骤

### 步骤1: 创建GitHub仓库
1. 访问 https://github.com
2. 点击右上角的 "+" 按钮
3. 选择 "New repository"
4. 仓库名称：`personal-story-tracker`
5. 描述：`个人故事追踪器 - 记录珍贵回忆的Web应用`
6. 选择 "Public" 或 "Private"
7. 不要勾选 "Initialize this repository with a README"
8. 点击 "Create repository"

### 步骤2: 本地Git初始化
```bash
cd personal-story-tracker
git init
git add .
git commit -m "Initial commit: Personal Story Tracker"
```

### 步骤3: 连接到GitHub
```bash
git remote add origin https://github.com/您的用户名/personal-story-tracker.git
git branch -M main
git push -u origin main
```

## 🌍 部署到GitHub Pages（前端）

### 方法1: 使用GitHub Actions自动部署

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: |
        cd frontend
        npm install
        
    - name: Build
      run: |
        cd frontend
        npm run build
        
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./frontend/build
```

### 方法2: 手动部署
```bash
cd frontend
npm run build
# 将build文件夹内容上传到gh-pages分支
```

## ☁️ 部署到云平台

### Vercel部署（推荐）
1. 访问 https://vercel.com
2. 使用GitHub账号登录
3. 点击 "New Project"
4. 选择您的 `personal-story-tracker` 仓库
5. 设置构建配置：
   - Framework Preset: `Create React App`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`
6. 点击 "Deploy"

### Netlify部署
1. 访问 https://netlify.com
2. 使用GitHub账号登录
3. 点击 "New site from Git"
4. 选择GitHub，授权访问
5. 选择您的仓库
6. 设置构建配置：
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/build`
7. 点击 "Deploy site"

## 🐳 Docker部署

### 构建Docker镜像
```bash
# 构建后端镜像
cd backend
docker build -t personal-story-tracker-backend .

# 构建前端镜像
cd ../frontend
docker build -t personal-story-tracker-frontend .
```

### 使用Docker Compose
```bash
docker-compose up -d
```

## 🔧 环境变量配置

### 前端环境变量 (.env)
```
REACT_APP_API_URL=https://your-backend-url.com/api
REACT_APP_TITLE=个人故事追踪器
```

### 后端环境变量 (.env)
```
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=your-domain.com,localhost
DB_ENGINE=postgresql
DB_NAME=personal_story_tracker
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_HOST=your-db-host
DB_PORT=5432
```

## 📊 部署后检查清单

- [ ] 前端可以正常访问
- [ ] 用户注册/登录功能正常
- [ ] API接口响应正常
- [ ] 数据库连接正常
- [ ] 静态文件加载正常
- [ ] HTTPS证书配置（生产环境）

## 🚨 常见问题

### 1. 构建失败
- 检查Node.js版本兼容性
- 清除npm缓存：`npm cache clean --force`
- 删除node_modules重新安装

### 2. API连接问题
- 检查CORS设置
- 确认API URL配置正确
- 检查网络防火墙设置

### 3. 数据库连接问题
- 确认数据库服务运行正常
- 检查连接字符串配置
- 验证数据库用户权限

## 🎉 部署完成

恭喜！您的个人故事追踪器已成功部署到GitHub。

### 访问地址：
- **GitHub仓库**: https://github.com/您的用户名/personal-story-tracker
- **GitHub Pages**: https://您的用户名.github.io/personal-story-tracker
- **Vercel**: https://personal-story-tracker-您的用户名.vercel.app

### 下一步：
1. 邀请朋友体验您的应用
2. 继续添加新功能
3. 收集用户反馈并改进
4. 考虑添加移动端支持

---

**🌟 您已经成功创建了一个完整的全栈Web应用！**