// 简单的构建测试脚本
const { execSync } = require('child_process');
const path = require('path');

console.log('开始测试构建...');

try {
  // 切换到frontend目录
  process.chdir(path.join(__dirname, 'frontend'));
  
  console.log('当前目录:', process.cwd());
  
  // 检查package.json
  console.log('检查package.json...');
  const packageJson = require('./package.json');
  console.log('项目名称:', packageJson.name);
  console.log('主页设置:', packageJson.homepage);
  
  // 尝试安装依赖
  console.log('安装依赖...');
  execSync('npm install --force', { stdio: 'inherit' });
  
  // 尝试构建
  console.log('开始构建...');
  execSync('npm run build', { stdio: 'inherit', env: { ...process.env, CI: 'false' } });
  
  console.log('✅ 构建成功！');
  
} catch (error) {
  console.error('❌ 构建失败:', error.message);
  process.exit(1);
}