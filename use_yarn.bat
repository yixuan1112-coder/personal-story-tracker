@echo off
echo 使用Yarn安装React前端...
echo.

cd /d "%~dp0frontend"

echo 步骤1: 安装Yarn
"C:\Program Files\nodejs\npm.cmd" install -g yarn

echo 步骤2: 使用Yarn安装依赖
yarn install

echo 步骤3: 启动开发服务器
yarn start

pause