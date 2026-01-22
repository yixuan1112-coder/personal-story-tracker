@echo off
echo 正在修复React前端安装问题...
echo.

cd /d "%~dp0frontend"

echo 步骤1: 清理缓存和node_modules
if exist node_modules (
    echo 删除node_modules目录...
    rmdir /s /q node_modules
)

echo 步骤2: 清理npm缓存
"C:\Program Files\nodejs\npm.cmd" cache clean --force

echo 步骤3: 重新安装依赖
"C:\Program Files\nodejs\npm.cmd" install

echo 步骤4: 启动开发服务器
"C:\Program Files\nodejs\npm.cmd" start

pause