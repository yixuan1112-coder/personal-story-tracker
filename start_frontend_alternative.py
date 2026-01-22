#!/usr/bin/env python
"""
前端启动替代方案 - 使用Python创建简单的Web界面演示
当Node.js不可用时的临时解决方案
"""
import http.server
import socketserver
import webbrowser
import threading
import time
import os
from pathlib import Path

def create_demo_html():
    """创建演示HTML页面"""
    html_content = """
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>个人故事追踪器 - 演示版</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            color: white;
            margin-bottom: 40px;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        
        .card {
            background: white;
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        
        .card:hover {
            transform: translateY(-5px);
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px;
            border-radius: 15px;
            text-align: center;
        }
        
        .stat-number {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .stat-label {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .entries-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        
        .entry-card {
            background: white;
            border-radius: 10px;
            padding: 20px;
            border-left: 4px solid #667eea;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .entry-type {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9rem;
            margin-bottom: 15px;
        }
        
        .entry-title {
            font-size: 1.3rem;
            font-weight: bold;
            margin-bottom: 10px;
            color: #333;
        }
        
        .entry-description {
            color: #666;
            line-height: 1.6;
            margin-bottom: 15px;
        }
        
        .entry-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.9rem;
            color: #888;
        }
        
        .importance-stars {
            color: #ffd700;
        }
        
        .btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 25px;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        
        .notice {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 30px;
        }
        
        .notice h3 {
            margin-bottom: 10px;
        }
        
        .api-demo {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin-top: 20px;
        }
        
        .api-demo h4 {
            margin-bottom: 15px;
            color: #495057;
        }
        
        .api-endpoint {
            background: #e9ecef;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌟 个人故事追踪器</h1>
            <p>演示版 - 您的珍贵回忆管理系统</p>
        </div>
        
        <div class="notice">
            <h3>📢 演示说明</h3>
            <p>这是一个静态演示页面。要体验完整的React前端，请确保Node.js正确安装并重启命令行，然后运行 <code>npm install && npm start</code></p>
        </div>
        
        <div class="card">
            <h2>📊 统计概览</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">3</div>
                    <div class="stat-label">总条目数</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">2</div>
                    <div class="stat-label">物品条目</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">1</div>
                    <div class="stat-label">人物条目</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">100%</div>
                    <div class="stat-label">有故事的条目</div>
                </div>
            </div>
        </div>
        
        <div class="card">
            <h2>📝 我的条目</h2>
            <div class="entries-grid">
                <div class="entry-card">
                    <div class="entry-type">物品</div>
                    <div class="entry-title">ThinkPad X1 Carbon</div>
                    <div class="entry-description">我的第一台笔记本电脑，陪伴我度过了大学四年。记录了从懵懂新生到即将毕业的成长历程...</div>
                    <div class="entry-meta">
                        <span>2026-01-22</span>
                        <span class="importance-stars">⭐⭐⭐⭐⭐ 9/10</span>
                    </div>
                </div>
                
                <div class="entry-card">
                    <div class="entry-type">人物</div>
                    <div class="entry-title">李明</div>
                    <div class="entry-description">我的大学室友，也是我最好的朋友之一。四年的室友生活让我们建立了深厚的友谊...</div>
                    <div class="entry-meta">
                        <span>2026-01-22</span>
                        <span class="importance-stars">⭐⭐⭐⭐ 8/10</span>
                    </div>
                </div>
                
                <div class="entry-card">
                    <div class="entry-type">物品</div>
                    <div class="entry-title">奶奶的老式手表</div>
                    <div class="entry-description">奶奶留给我的珍贵手表，承载着家族的回忆。这块手表见证了三代人的爱情和亲情...</div>
                    <div class="entry-meta">
                        <span>2026-01-22</span>
                        <span class="importance-stars">⭐⭐⭐⭐⭐ 10/10</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="card">
            <h2>🚀 功能特色</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                <div>
                    <h4>📱 现代化界面</h4>
                    <p>Material-UI设计，响应式布局，支持深色主题</p>
                </div>
                <div>
                    <h4>🔍 智能搜索</h4>
                    <p>全文搜索，标签过滤，重要度排序</p>
                </div>
                <div>
                    <h4>📊 数据分析</h4>
                    <p>统计图表，趋势分析，重要度计算</p>
                </div>
                <div>
                    <h4>✍️ 故事记录</h4>
                    <p>富文本编辑，版本历史，实时保存</p>
                </div>
            </div>
        </div>
        
        <div class="card api-demo">
            <h3>🔗 API 演示</h3>
            <p>后端API已经运行在 <strong>http://localhost:8000</strong>，您可以直接访问：</p>
            
            <h4>可用端点：</h4>
            <div class="api-endpoint">GET /api/entries/ - 获取所有条目</div>
            <div class="api-endpoint">POST /api/auth/login/ - 用户登录</div>
            <div class="api-endpoint">GET /api/entries/statistics/ - 获取统计信息</div>
            
            <p style="margin-top: 15px;">
                <a href="http://localhost:8000/admin" class="btn" target="_blank">访问管理后台</a>
                <a href="http://localhost:8000/api/entries/" class="btn" target="_blank" style="margin-left: 10px;">查看API数据</a>
            </p>
        </div>
        
        <div class="card">
            <h2>🛠️ 完整前端启动指南</h2>
            <p>要体验完整的React前端应用，请按以下步骤操作：</p>
            <ol style="margin: 20px 0; padding-left: 20px; line-height: 1.8;">
                <li>确保Node.js已正确安装并添加到PATH环境变量</li>
                <li>重启命令行窗口</li>
                <li>运行: <code style="background: #f1f3f4; padding: 2px 6px; border-radius: 3px;">cd personal-story-tracker/frontend</code></li>
                <li>运行: <code style="background: #f1f3f4; padding: 2px 6px; border-radius: 3px;">npm install</code></li>
                <li>运行: <code style="background: #f1f3f4; padding: 2px 6px; border-radius: 3px;">npm start</code></li>
                <li>访问: <code style="background: #f1f3f4; padding: 2px 6px; border-radius: 3px;">http://localhost:3000</code></li>
            </ol>
        </div>
    </div>
    
    <script>
        // 简单的交互效果
        document.querySelectorAll('.entry-card').forEach(card => {
            card.addEventListener('click', function() {
                alert('在完整版本中，这里会打开条目详情页面！\\n\\n条目: ' + this.querySelector('.entry-title').textContent);
            });
        });
        
        // 显示当前时间
        function updateTime() {
            const now = new Date();
            const timeStr = now.toLocaleString('zh-CN');
            document.title = '个人故事追踪器 - ' + timeStr;
        }
        
        updateTime();
        setInterval(updateTime, 1000);
    </script>
</body>
</html>
"""
    
    # 创建演示HTML文件
    demo_dir = Path("frontend_demo")
    demo_dir.mkdir(exist_ok=True)
    
    with open(demo_dir / "index.html", "w", encoding="utf-8") as f:
        f.write(html_content)
    
    return demo_dir

def start_server():
    """启动简单的HTTP服务器"""
    demo_dir = create_demo_html()
    
    # 切换到演示目录
    os.chdir(demo_dir)
    
    PORT = 3002
    Handler = http.server.SimpleHTTPRequestHandler
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"🌐 演示服务器启动成功！")
        print(f"📍 访问地址: http://localhost:{PORT}")
        print(f"🔗 后端API: http://localhost:8000")
        print(f"⚡ 管理后台: http://localhost:8000/admin")
        print(f"\n💡 这是一个静态演示页面")
        print(f"   要体验完整React前端，请安装Node.js后运行 npm start")
        print(f"\n按 Ctrl+C 停止服务器")
        
        # 自动打开浏览器
        def open_browser():
            time.sleep(1)
            webbrowser.open(f'http://localhost:{PORT}')
        
        threading.Thread(target=open_browser, daemon=True).start()
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print(f"\n🛑 服务器已停止")

if __name__ == "__main__":
    start_server()