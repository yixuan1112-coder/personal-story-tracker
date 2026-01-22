# Personal Story Tracker

个人故事追踪器是一个现代化的Web应用程序，帮助用户记录和管理个人物品和重要人物的故事。

## ✨ 功能特性

- 📝 **条目管理**: 记录物品和人物条目，包含详细信息和故事
- 🎨 **视觉定制**: 上传图片，添加装饰元素，个性化条目外观
- 💰 **价值评估**: 自动计算物品折旧值和当前市场价值
- ⭐ **重要度评估**: 多维度评估条目的情感和实用价值
- 📱 **响应式设计**: 支持桌面、平板和移动设备
- 🔐 **安全认证**: JWT身份验证，保护用户数据隐私

## 🏗️ 项目结构

```
personal-story-tracker/
├── backend/                 # Django后端应用
│   ├── story_tracker/      # 主项目配置
│   ├── accounts/           # 用户认证模块
│   ├── entries/            # 条目管理模块
│   ├── stories/            # 故事内容模块
│   ├── media_files/        # 媒体文件模块
│   └── valuations/         # 价值评估模块
├── frontend/               # React前端应用
│   ├── src/
│   │   ├── components/     # React组件
│   │   ├── pages/          # 页面组件
│   │   ├── store/          # Redux状态管理
│   │   └── services/       # API服务
│   └── package.json
├── docker-compose.yml      # Docker配置
├── DEVELOPMENT.md          # 开发指南
└── README.md
```

## 🚀 技术栈

### 后端
- **Django 4.2** - Web框架
- **Django REST Framework** - API框架
- **PostgreSQL** - 数据库
- **JWT认证** - 身份验证
- **Pillow** - 图像处理
- **Hypothesis** - 属性测试

### 前端
- **React 18** - 用户界面框架
- **Redux Toolkit** - 状态管理
- **Material-UI** - UI组件库
- **Axios** - HTTP客户端
- **React Router** - 路由管理

## 🛠️ 快速开始

### 方法1: 使用Docker (推荐)

```bash
# 克隆项目
git clone <repository-url>
cd personal-story-tracker

# 启动所有服务
docker-compose up -d

# 运行数据库迁移
docker-compose exec backend python manage.py migrate

# 创建超级用户
docker-compose exec backend python manage.py createsuperuser

# 初始化默认数据
docker-compose exec backend python manage.py init_depreciation_rules
```

访问应用:
- 🌐 前端应用: http://localhost:3000
- 🔧 后端API: http://localhost:8000/api
- 👨‍💼 管理后台: http://localhost:8000/admin

### 方法2: 本地开发

#### 前置要求
- Python 3.9+
- Node.js 18+
- PostgreSQL 13+

#### 自动设置 (Linux/macOS)
```bash
chmod +x setup.sh
./setup.sh
```

#### 手动设置

**后端设置:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env
# 编辑 .env 文件配置数据库
python manage.py migrate
python manage.py createsuperuser
python manage.py init_depreciation_rules
python manage.py runserver
```

**前端设置:**
```bash
cd frontend
npm install
npm start
```

## 📚 API文档

### 认证端点
- `POST /api/auth/register/` - 用户注册
- `POST /api/auth/login/` - 用户登录
- `POST /api/auth/logout/` - 用户登出
- `GET /api/auth/profile/` - 获取用户资料

### 条目管理
- `GET /api/entries/` - 获取条目列表
- `POST /api/entries/` - 创建新条目
- `GET /api/entries/{id}/` - 获取条目详情
- `PUT /api/entries/{id}/` - 更新条目
- `DELETE /api/entries/{id}/` - 删除条目

### 故事管理
- `GET /api/stories/{entry_id}/` - 获取故事内容
- `PUT /api/stories/{entry_id}/` - 更新故事内容

### 价值评估
- `GET /api/valuations/{entry_id}/` - 获取价值评估
- `POST /api/valuations/{entry_id}/calculate/` - 计算当前价值

## 🧪 测试

### 后端测试
```bash
cd backend
python manage.py test          # Django测试
pytest                         # pytest测试
pytest -m property            # 属性测试
```

### 前端测试
```bash
cd frontend
npm test                      # React测试
```

## 📖 开发指南

详细的开发指南请参考 [DEVELOPMENT.md](DEVELOPMENT.md)

## 🤝 贡献

欢迎贡献代码！请查看开发指南了解如何参与项目开发。

## 📄 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。