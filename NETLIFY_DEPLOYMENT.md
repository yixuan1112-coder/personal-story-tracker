# 🚀 Netlify部署指南

本项目已配置为在Netlify上部署，使用自定义域名 `yixuanstorytracker.live`。

## 📋 部署步骤

### 1. 连接GitHub仓库到Netlify

1. 登录 [Netlify](https://netlify.com)
2. 点击 "New site from Git"
3. 选择 "GitHub" 并授权
4. 选择 `personal-story-tracker` 仓库

### 2. 配置构建设置

Netlify会自动检测到 `netlify.toml` 配置文件，包含以下设置：

- **构建命令**: `cd frontend && npm ci && npm run build`
- **发布目录**: `frontend/build`
- **Node.js版本**: 18

### 3. 配置自定义域名

1. 在Netlify站点设置中，转到 "Domain management"
2. 点击 "Add custom domain"
3. 输入 `yixuanstorytracker.live`
4. 按照提示配置DNS记录

### 4. DNS配置

在你的域名提供商（Netlify DNS）中设置：

```
A记录: @ -> 75.2.60.5
CNAME记录: www -> yixuanstorytracker.live
```

或者使用Netlify的DNS服务器：
- `dns1.p08.nsone.net`
- `dns2.p08.nsone.net`
- `dns3.p08.nsone.net`
- `dns4.p08.nsone.net`

## ✨ 功能特性

### 🔄 自动部署
- 每次推送到 `main` 分支时自动部署
- 构建预览：Pull Request会生成预览链接

### 🌐 演示模式
- 生产环境自动启用演示模式
- 使用localStorage存储数据
- 演示账户：用户名 `demo`，密码 `demo123`

### 🔒 安全配置
- 自动HTTPS证书
- 安全头部设置
- XSS保护

### ⚡ 性能优化
- 静态资源缓存
- Gzip压缩
- 图片优化

## 🛠️ 本地开发

```bash
# 克隆仓库
git clone https://github.com/yixuan1112-coder/personal-story-tracker.git
cd personal-story-tracker

# 安装依赖并启动前端
cd frontend
npm install
npm start

# 启动后端（可选，本地开发）
cd ../backend
pip install -r requirements.txt
python manage.py runserver
```

## 📱 访问地址

- **生产环境**: https://yixuanstorytracker.live
- **Netlify默认**: https://[site-name].netlify.app
- **本地开发**: http://localhost:3000

## 🔧 环境变量

Netlify部署不需要额外的环境变量，所有配置都在代码中处理。

## 📊 部署状态

可以在以下位置查看部署状态：
- Netlify Dashboard
- GitHub Actions（如果启用）
- 项目README中的徽章

## 🐛 故障排除

### 构建失败
1. 检查Node.js版本（应为18）
2. 确认所有依赖都在package.json中
3. 查看Netlify构建日志

### 路由问题
- 确认 `netlify.toml` 中的重定向规则
- 检查React Router配置

### 域名问题
- 验证DNS设置
- 检查SSL证书状态
- 确认域名指向正确的Netlify站点

## 📞 支持

如有问题，请：
1. 查看Netlify文档
2. 检查GitHub Issues
3. 联系项目维护者