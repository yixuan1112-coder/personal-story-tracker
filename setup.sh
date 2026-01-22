#!/bin/bash

echo "🚀 设置个人故事追踪器开发环境..."

# 检查Python版本
python_version=$(python3 --version 2>&1 | grep -Po '(?<=Python )\d+\.\d+')
if [[ $(echo "$python_version >= 3.9" | bc -l) -eq 0 ]]; then
    echo "❌ 需要Python 3.9或更高版本，当前版本: $python_version"
    exit 1
fi

# 检查Node.js版本
node_version=$(node --version 2>&1 | grep -Po '(?<=v)\d+')
if [[ $node_version -lt 18 ]]; then
    echo "❌ 需要Node.js 18或更高版本，当前版本: v$node_version"
    exit 1
fi

# 设置后端
echo "📦 设置Django后端..."
cd backend

# 创建虚拟环境
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

# 激活虚拟环境
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 创建环境变量文件
if [ ! -f ".env" ]; then
    cp ../.env.example .env
    echo "📝 请编辑 backend/.env 文件配置数据库连接"
fi

# 创建日志目录
mkdir -p logs

echo "✅ 后端设置完成"

# 设置前端
echo "📦 设置React前端..."
cd ../frontend

# 安装依赖
npm install

echo "✅ 前端设置完成"

cd ..

echo "🎉 设置完成！"
echo ""
echo "📋 下一步："
echo "1. 配置PostgreSQL数据库"
echo "2. 编辑 backend/.env 文件"
echo "3. 运行数据库迁移: cd backend && python manage.py migrate"
echo "4. 创建超级用户: cd backend && python manage.py createsuperuser"
echo "5. 启动开发服务器:"
echo "   - 后端: cd backend && python manage.py runserver"
echo "   - 前端: cd frontend && npm start"
echo ""
echo "或者使用Docker: docker-compose up"