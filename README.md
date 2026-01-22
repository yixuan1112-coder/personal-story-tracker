# 🌟 个人故事追踪器 (Personal Story Tracker)

[![Deploy to GitHub Pages](https://github.com/yixuan1112-coder/personal-story-tracker/actions/workflows/deploy.yml/badge.svg)](https://github.com/yixuan1112-coder/personal-story-tracker/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

一个用于记录和管理个人珍贵回忆的全栈Web应用程序。帮助您记录与重要物品和人物的故事，评估它们的重要性，并永久保存这些珍贵的回忆。

## 🎯 项目亮点

- 🏗️ **完整全栈架构** - Django + React 现代化技术栈
- 🔐 **安全认证系统** - JWT令牌 + 自动登出保护
- 📱 **响应式设计** - Material-UI + 移动端适配
- 📊 **智能评估** - 多维度重要性评分算法
- 🎨 **现代化UI** - 流畅动画 + 深色主题支持
- 🧪 **完整测试** - 单元测试 + 属性测试覆盖
- 🚀 **自动部署** - GitHub Actions CI/CD

## ✨ 功能特色

### 🔐 用户认证系统
- 安全的用户注册和登录
- JWT令牌认证机制
- 智能自动登出功能
- 密码强度验证

### 📝 条目管理
- 创建物品和人物条目
- 富文本故事编辑器
- 图片上传和管理
- 智能标签分类系统
- 全文搜索功能

### 📊 重要度评估
- 多维度重要度评分
- 自动重要度计算算法
- 可视化统计图表
- 重要度趋势分析

### 🎨 现代化界面
- Material-UI组件设计
- 完全响应式布局
- 深色/浅色主题切换
- 流畅的动画过渡效果

## 🛠️ 技术栈

### 前端技术
- **React 18** - 现代化前端框架
- **Material-UI v5** - Google Material Design组件库
- **Redux Toolkit** - 现代化状态管理
- **React Router v6** - 声明式路由
- **Axios** - Promise based HTTP客户端
- **React Quill** - 富文本编辑器

### 后端技术
- **Django 4.2** - 高级Python Web框架
- **Django REST Framework** - 强大的API开发工具
- **Simple JWT** - JWT认证实现
- **SQLite/PostgreSQL** - 数据库支持
- **CORS Headers** - 跨域请求支持
- **Python Decouple** - 环境变量管理

### 开发工具
- **Docker** - 容器化部署
- **GitHub Actions** - CI/CD自动化
- **pytest** - Python测试框架
- **Jest** - JavaScript测试框架

## 🚀 快速开始

### 环境要求
- Python 3.8+
- Node.js 16+
- Git

### 1. 克隆项目
```bash
git clone https://github.com/yixuan1112-coder/personal-story-tracker.git
cd personal-story-tracker
```

### 2. 后端设置
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 3. 前端设置
```bash
cd frontend
npm install
npm start
```

### 4. 访问应用
- 🌐 前端应用：http://localhost:3000
- 🔌 后端API：http://localhost:8000/api
- ⚙️ 管理后台：http://localhost:8000/admin

## 📱 在线演示

- 🌍 **GitHub Pages**: https://yixuan1112-coder.github.io/personal-story-tracker
- 🚀 **Vercel部署**: https://personal-story-tracker.vercel.app

## 📖 详细文档

- 📚 [开发指南](DEVELOPMENT.md) - 本地开发环境搭建
- 🚀 [部署指南](GITHUB_DEPLOYMENT.md) - 生产环境部署
- 📡 [API文档](backend/entries/API_DOCUMENTATION.md) - RESTful API接口

## 🎯 核心功能演示

### 用户体验流程
1. **注册/登录** → 安全的用户认证
2. **创建条目** → 添加物品或人物
3. **编写故事** → 记录珍贵回忆
4. **重要度评估** → 智能评分系统
5. **数据统计** → 可视化分析

### 技术特色
- ⚡ **性能优化** - 代码分割 + 懒加载
- 🔒 **安全防护** - XSS防护 + CSRF保护
- 📊 **数据可视化** - 图表展示 + 统计分析
- 🎨 **用户体验** - 流畅动画 + 响应式设计

## 🧪 测试覆盖

```bash
# 后端测试
cd backend
python -m pytest

# 前端测试
cd frontend
npm test
```

- ✅ 单元测试覆盖率 > 80%
- ✅ 集成测试完整覆盖
- ✅ 属性测试验证核心逻辑

## 🐳 Docker部署

```bash
# 构建并启动所有服务
docker-compose up -d

# 访问应用
# 前端: http://localhost:3000
# 后端: http://localhost:8000
```

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [Django](https://www.djangoproject.com/) - 强大的Python Web框架
- [React](https://reactjs.org/) - 用户界面构建库
- [Material-UI](https://mui.com/) - React UI组件库
- [GitHub Actions](https://github.com/features/actions) - CI/CD自动化

## 📞 联系方式

- 📧 Email: your.email@example.com
- 🐙 GitHub: [@yixuan1112-coder](https://github.com/yixuan1112-coder)
- 🌐 项目链接: [https://github.com/yixuan1112-coder/personal-story-tracker](https://github.com/yixuan1112-coder/personal-story-tracker)

---

⭐ 如果这个项目对您有帮助，请给它一个星标！
<!-- Fix deployment -->
