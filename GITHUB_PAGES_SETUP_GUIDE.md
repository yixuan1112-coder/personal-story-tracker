# 🚀 GitHub Pages设置指南

## 问题诊断

如果GitHub Pages无法访问，可能是以下原因：

1. GitHub Pages功能未启用
2. 部署分支设置不正确
3. GitHub Actions权限不足
4. 构建失败

## ✅ 解决步骤

### 步骤1: 启用GitHub Pages

1. 打开你的GitHub仓库：https://github.com/yixuan1112-coder/personal-story-tracker
2. 点击 **Settings** (设置)
3. 在左侧菜单找到 **Pages**
4. 在 **Source** 部分：
   - 选择 **GitHub Actions** (不是Deploy from a branch)
   - 如果看不到这个选项，说明Actions部署已启用

### 步骤2: 检查GitHub Actions权限

1. 在 **Settings** 中，找到 **Actions** → **General**
2. 滚动到 **Workflow permissions**
3. 确保选择了：
   - ✅ **Read and write permissions**
   - ✅ **Allow GitHub Actions to create and approve pull requests**
4. 点击 **Save**

### 步骤3: 手动触发部署

1. 转到仓库的 **Actions** 标签页
2. 点击左侧的 **Deploy Demo to GitHub Pages**
3. 点击右侧的 **Run workflow** 按钮
4. 选择 **main** 分支
5. 点击绿色的 **Run workflow** 按钮

### 步骤4: 检查部署状态

1. 在 **Actions** 页面，你会看到一个新的工作流运行
2. 点击它查看详细信息
3. 等待所有步骤完成（绿色勾号）
4. 如果有红色叉号，点击查看错误信息

### 步骤5: 访问网站

部署成功后，访问：
**https://yixuan1112-coder.github.io/personal-story-tracker-demo**

## 🔧 常见问题

### 问题1: 404 Not Found

**原因**: GitHub Pages可能还没有启用或部署未完成

**解决**:
1. 等待5-10分钟让部署完成
2. 检查Settings → Pages是否显示网站URL
3. 确保URL包含正确的仓库名

### 问题2: 构建失败

**原因**: npm依赖或构建错误

**解决**:
1. 查看Actions日志中的错误信息
2. 确保frontend/package-lock.json已提交
3. 本地运行 `npm run build` 测试

### 问题3: 白屏或空白页

**原因**: basename配置问题

**解决**:
1. 检查package.json中的homepage设置
2. 确保index.js中的basename配置正确

## 📱 备用方案

如果GitHub Pages仍然无法工作，可以使用：

### 方案A: Vercel部署

1. 访问 https://vercel.com
2. 使用GitHub账号登录
3. 导入你的仓库
4. 设置：
   - Framework Preset: Create React App
   - Root Directory: frontend
   - Build Command: npm run build
   - Output Directory: build
5. 点击Deploy

### 方案B: Netlify部署

1. 访问 https://netlify.com
2. 使用GitHub账号登录
3. 点击 "New site from Git"
4. 选择你的仓库
5. 设置：
   - Base directory: frontend
   - Build command: npm run build
   - Publish directory: frontend/build
6. 点击Deploy

### 方案C: 使用局域网

同一WiFi的人可以访问：
**http://10.91.79.234:3000**

## 📞 需要帮助？

如果以上步骤都不行，请：
1. 截图Actions页面的错误信息
2. 截图Settings → Pages的配置
3. 告诉我具体的错误提示

---

**提示**: GitHub Pages部署通常需要3-5分钟才能生效，请耐心等待。