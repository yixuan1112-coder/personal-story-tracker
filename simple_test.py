#!/usr/bin/env python
"""
简单的API测试
"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_endpoints():
    print("测试API端点...")
    
    # 测试注册
    print("\n1. 测试注册端点")
    register_data = {
        "username": "testuser123",
        "email": "test123@example.com", 
        "password": "testpass123",
        "password_confirm": "testpass123",
        "display_name": "测试用户123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register/", json=register_data)
        print(f"注册响应状态: {response.status_code}")
        if response.content:
            print(f"注册响应内容: {response.text}")
    except Exception as e:
        print(f"注册请求错误: {e}")
    
    # 测试登录
    print("\n2. 测试登录端点")
    login_data = {
        "username": "testuser123",
        "password": "testpass123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login/", json=login_data)
        print(f"登录响应状态: {response.status_code}")
        print(f"登录响应内容: {response.text}")
        
        if response.status_code == 200:
            token_data = response.json()
            access_token = token_data.get("access")
            print(f"获得访问令牌: {access_token[:50]}...")
            
            # 测试受保护的端点
            print("\n3. 测试条目端点")
            headers = {"Authorization": f"Bearer {access_token}"}
            entries_response = requests.get(f"{BASE_URL}/entries/", headers=headers)
            print(f"条目响应状态: {entries_response.status_code}")
            print(f"条目响应内容: {entries_response.text}")
            
    except Exception as e:
        print(f"登录请求错误: {e}")

if __name__ == "__main__":
    test_endpoints()