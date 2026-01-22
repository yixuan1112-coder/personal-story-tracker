# 开发指南

## 项目结构

```
personal-story-tracker/
├── backend/                 # Django后端
│   ├── story_tracker/      # 主项目配置
│   ├── accounts/           # 用户认证应用
│   ├── entries/            # 条目管理应用
│   ├── stories/            # 故事内容应用
│   ├── media_files/        # 媒体文件应用
│   ├── valuations/         # 价值评估应用
│   └── requirements.txt    # Python依赖
├── frontend/               # React前端
│   ├── src/
│   │   ├── components/     # React组件
│   │   ├── pages/          # 页面组件
│   │   ├── store/          # Redux状态管理
│   │   └── services/       # API服务
│   └── package.json        # Node.js依赖
├── docker-compose.yml      # Docker配置
└── README.md              # 项目说明
```

## 快速开始

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

# 初始化折旧规则
docker-compose exec backend python manage.py init_depreciation_rules
```

访问应用:
- 前端: http://localhost:3000
- 后端API: http://localhost:8000
- 管理后台: http://localhost:8000/admin

### 方法2: 本地开发

#### 前置要求
- Python 3.9+
- Node.js 18+
- PostgreSQL 13+

#### 后端设置

```bash
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp ../.env.example .env
# 编辑 .env 文件配置数据库连接

# 运行迁移
python manage.py migrate

# 创建超级用户
python manage.py createsuperuser

# 初始化数据
python manage.py init_depreciation_rules

# 启动开发服务器
python manage.py runserver
```

#### 前端设置

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm start
```

## 开发工作流

### 后端开发

1. **创建新的API端点**
   ```bash
   # 在相应的应用中编辑 views.py 和 urls.py
   # 运行测试
   python manage.py test
   ```

2. **数据库变更**
   ```bash
   # 创建迁移文件
   python manage.py makemigrations
   
   # 应用迁移
   python manage.py migrate
   ```

3. **运行测试**
   ```bash
   # 运行所有测试
   python manage.py test
   
   # 运行特定应用的测试
   python manage.py test accounts
   
   # 使用pytest (推荐)
   pytest
   
   # 运行属性测试
   pytest -m property
   ```

### 前端开发

1. **添加新组件**
   ```bash
   # 在 src/components/ 中创建组件
   # 更新路由 (如需要)
   # 添加到相应的页面
   ```

2. **状态管理**
   ```bash
   # 在 src/store/slices/ 中创建或更新slice
   # 在组件中使用 useSelector 和 useDispatch
   ```

3. **运行测试**
   ```bash
   npm test
   ```

## API文档

### 认证端点
- `POST /api/auth/register/` - 用户注册
- `POST /api/auth/login/` - 用户登录
- `POST /api/auth/logout/` - 用户登出
- `GET /api/auth/profile/` - 获取用户资料
- `PUT /api/auth/profile/` - 更新用户资料

### 条目端点
- `GET /api/entries/` - 获取条目列表
- `POST /api/entries/` - 创建新条目
- `GET /api/entries/{id}/` - 获取特定条目
- `PUT /api/entries/{id}/` - 更新条目
- `DELETE /api/entries/{id}/` - 删除条目

### 故事端点
- `GET /api/stories/{entry_id}/` - 获取条目故事
- `PUT /api/stories/{entry_id}/` - 更新条目故事

### 价值评估端点
- `GET /api/valuations/{entry_id}/` - 获取价值评估
- `POST /api/valuations/{entry_id}/calculate/` - 计算价值

## 测试策略

### 后端测试
- **单元测试**: 测试模型、视图、序列化器
- **集成测试**: 测试API端点
- **属性测试**: 使用Hypothesis进行属性测试

### 前端测试
- **组件测试**: 使用React Testing Library
- **集成测试**: 测试用户工作流
- **端到端测试**: 使用Cypress (计划中)

## 代码规范

### Python (后端)
- 使用Black进行代码格式化
- 使用flake8进行代码检查
- 遵循PEP 8规范

### JavaScript (前端)
- 使用ESLint进行代码检查
- 使用Prettier进行代码格式化
- 遵循React最佳实践

## 部署

### 开发环境
使用Docker Compose进行本地开发

### 生产环境
- 后端: Django + Gunicorn + Nginx
- 前端: React构建后的静态文件
- 数据库: PostgreSQL
- 缓存: Redis
- 文件存储: AWS S3或本地存储

## 故障排除

### 常见问题

1. **数据库连接错误**
   - 检查PostgreSQL是否运行
   - 验证.env文件中的数据库配置

2. **前端无法连接后端**
   - 确保后端服务器运行在8000端口
   - 检查CORS配置

3. **依赖安装失败**
   - 更新pip: `pip install --upgrade pip`
   - 清除npm缓存: `npm cache clean --force`

### 日志查看

```bash
# 后端日志
tail -f backend/logs/django.log

# Docker日志
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 贡献指南

1. Fork项目
2. 创建功能分支: `git checkout -b feature/new-feature`
3. 提交更改: `git commit -am 'Add new feature'`
4. 推送分支: `git push origin feature/new-feature`
5. 创建Pull Request

## 许可证

本项目采用MIT许可证。详见LICENSE文件。