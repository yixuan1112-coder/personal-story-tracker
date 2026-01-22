# 🌐 自定义域名配置指南

## 📋 前置要求

1. 您需要拥有一个域名（如：example.com）
2. 能够访问域名的DNS设置

## 🔧 配置步骤

### 步骤1: DNS配置

在您的域名提供商处添加以下DNS记录：

#### 对于根域名 (example.com)
```
类型: A
名称: @
值: 185.199.108.153
值: 185.199.109.153
值: 185.199.110.153
值: 185.199.111.153
```

#### 对于子域名 (www.example.com)
```
类型: CNAME
名称: www
值: yixuan1112-coder.github.io
```

### 步骤2: GitHub Pages配置

1. 访问仓库设置：
   https://github.com/yixuan1112-coder/personal-story-tracker/settings/pages

2. 在 "Custom domain" 输入框中填写您的域名：
   - 根域名：`example.com`
   - 子域名：`www.example.com`

3. 勾选 "Enforce HTTPS"

4. 点击 "Save"

### 步骤3: 创建CNAME文件

GitHub会自动创建CNAME文件，但您也可以手动创建：

```
# 在仓库根目录创建CNAME文件
echo "your-domain.com" > CNAME
git add CNAME
git commit -m "Add custom domain"
git push
```

## 🚨 常见问题解决

### 问题1: "Domain's DNS record could not be retrieved"
**解决方案：**
- 等待DNS传播（可能需要24-48小时）
- 检查DNS记录是否正确配置
- 使用DNS检查工具验证：https://www.whatsmydns.net/

### 问题2: "Domain does not resolve to the GitHub Pages server"
**解决方案：**
- 确认A记录指向正确的GitHub Pages IP地址
- 确认CNAME记录指向 `username.github.io`

### 问题3: "Certificate provisioning failed"
**解决方案：**
- 暂时取消勾选 "Enforce HTTPS"
- 等待24小时后重新勾选
- 确保域名DNS配置正确

### 问题4: "Both example.com and www.example.com are not properly configured"
**解决方案：**
- 只配置一个域名（推荐使用www子域名）
- 确保DNS记录类型正确

## 🔍 DNS配置验证

使用以下命令验证DNS配置：

```bash
# 检查A记录
nslookup example.com

# 检查CNAME记录
nslookup www.example.com

# 检查GitHub Pages连接
dig example.com +short
```

## 📱 推荐的域名提供商

- **Cloudflare** - 免费DNS，快速传播
- **Namecheap** - 便宜的域名注册
- **GoDaddy** - 知名域名提供商
- **阿里云** - 国内用户推荐

## ⚡ 快速测试

配置完成后，使用以下工具测试：

1. **DNS传播检查**：https://www.whatsmydns.net/
2. **SSL证书检查**：https://www.ssllabs.com/ssltest/
3. **网站可用性**：https://downforeveryoneorjustme.com/

## 🎯 最佳实践

1. **使用www子域名** - 更容易配置和管理
2. **启用HTTPS** - 提高安全性和SEO排名
3. **设置重定向** - 将根域名重定向到www子域名
4. **监控DNS** - 定期检查DNS记录是否正确

---

**💡 提示：如果遇到问题，建议先使用默认的GitHub Pages域名，等熟悉后再配置自定义域名。**