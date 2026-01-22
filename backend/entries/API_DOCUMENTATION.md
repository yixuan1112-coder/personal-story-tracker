# 条目管理API文档

## 概述

条目管理API提供完整的CRUD操作，支持物品和人物两种类型的条目管理。API包含数据验证、用户权限控制、故事内容管理和媒体文件处理功能。

## 认证

所有API端点都需要JWT认证。请在请求头中包含：
```
Authorization: Bearer <your_jwt_token>
```

## 权限控制

- 用户只能访问和修改自己创建的条目
- 实现了`IsOwnerOrReadOnly`权限类，确保数据隔离

## API端点

### 1. 条目列表 - GET /api/entries/

获取当前用户的所有条目列表。

**查询参数：**
- `type`: 条目类型过滤 (`item` 或 `person`)
- `category`: 物品类别过滤
- `condition`: 物品状况过滤
- `relationship`: 人物关系过滤
- `is_private`: 是否私有过滤
- `min_importance`: 最小重要度过滤 (1-10)
- `tags`: 标签过滤，多个标签用逗号分隔
- `has_story`: 是否有故事内容 (`true`/`false`)
- `search`: 搜索标题、描述、故事内容和标签
- `ordering`: 排序字段 (`created_at`, `updated_at`, `importance_score`, `acquisition_date`, `meeting_date`)

**响应示例：**
```json
{
  "count": 25,
  "next": "http://localhost:8000/api/entries/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "type": "item",
      "title": "我的笔记本电脑",
      "description": "工作用的笔记本电脑",
      "importance_score": 8,
      "calculated_importance": 7.4,
      "primary_image": "http://localhost:8000/media/entry_media/laptop.jpg",
      "has_story": true,
      "tags": ["工作", "电子产品"],
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-20T14:20:00Z"
    }
  ]
}
```

### 2. 创建条目 - POST /api/entries/

创建新的条目。

**请求体示例（物品）：**
```json
{
  "type": "item",
  "title": "新物品",
  "description": "物品描述",
  "story_content": "这是物品的故事...",
  "acquisition_date": "2024-01-15",
  "acquisition_method": "purchase",
  "original_price": "999.99",
  "currency": "CNY",
  "category": "电子产品",
  "condition": "new",
  "importance_score": 8,
  "emotional_value": 9,
  "practical_value": 7,
  "frequency_of_use": 8,
  "duration_owned": 6,
  "tags": ["工作", "重要"],
  "is_private": false
}
```

**请求体示例（人物）：**
```json
{
  "type": "person",
  "title": "张三",
  "description": "我的好朋友",
  "story_content": "我们是如何认识的...",
  "relationship": "friend",
  "meeting_date": "2020-05-10",
  "contact_info": {
    "phone": "13800138000",
    "email": "zhangsan@example.com"
  },
  "importance_score": 9,
  "tags": ["朋友", "重要"]
}
```

### 3. 获取条目详情 - GET /api/entries/{id}/

获取特定条目的详细信息。

**响应示例：**
```json
{
  "id": 1,
  "type": "item",
  "title": "我的笔记本电脑",
  "description": "工作用的笔记本电脑",
  "story_content": "这台电脑陪伴我度过了很多重要时刻...",
  "story_last_modified": "2024-01-20T14:20:00Z",
  "acquisition_date": "2023-06-15",
  "acquisition_method": "purchase",
  "original_price": "8999.00",
  "currency": "CNY",
  "category": "电子产品",
  "condition": "good",
  "importance_score": 8,
  "emotional_value": 9,
  "practical_value": 8,
  "frequency_of_use": 9,
  "duration_owned": 7,
  "calculated_importance": 8.35,
  "importance_last_evaluated": "2024-01-20T10:00:00Z",
  "theme": "default",
  "decorations": ["border-gold"],
  "layout": "default",
  "tags": ["工作", "电子产品", "重要"],
  "is_private": false,
  "media_files": [
    {
      "id": 1,
      "type": "image",
      "file": "/media/entry_media/laptop.jpg",
      "file_url": "http://localhost:8000/media/entry_media/laptop.jpg",
      "caption": "我的笔记本电脑",
      "is_primary": true,
      "created_at": "2024-01-15T12:00:00Z"
    }
  ],
  "age_in_days": 220,
  "has_story": true,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-20T14:20:00Z"
}
```

### 4. 更新条目 - PUT/PATCH /api/entries/{id}/

更新现有条目。支持部分更新（PATCH）和完整更新（PUT）。

### 5. 删除条目 - DELETE /api/entries/{id}/

删除指定条目。

## 自定义端点

### 1. 更新故事内容 - PUT/PATCH /api/entries/{id}/update_story/

专门用于更新条目的故事内容。

**请求体：**
```json
{
  "story_content": "更新后的故事内容..."
}
```

### 2. 按重要度排序 - GET /api/entries/by_importance/

获取按重要度排序的条目列表（先按计算重要度，再按重要度分数）。

### 3. 最近条目 - GET /api/entries/recent/

获取最近更新的10个条目。

### 4. 按类型分组 - GET /api/entries/by_type/

获取按类型分组的条目统计和最近条目。

**响应示例：**
```json
{
  "items": {
    "count": 15,
    "categories": ["电子产品", "书籍", "衣物"],
    "recent": [...]
  },
  "persons": {
    "count": 10,
    "relationships": ["朋友", "家人", "同事"],
    "recent": [...]
  }
}
```

### 5. 统计信息 - GET /api/entries/statistics/

获取详细的条目统计信息。

**响应示例：**
```json
{
  "total_count": 25,
  "item_count": 15,
  "person_count": 10,
  "with_story_count": 18,
  "without_story_count": 7,
  "importance_distribution": {
    "1": 0,
    "2": 1,
    "3": 2,
    "4": 3,
    "5": 5,
    "6": 4,
    "7": 3,
    "8": 4,
    "9": 2,
    "10": 1
  },
  "categories": ["电子产品", "书籍", "衣物"],
  "relationships": ["朋友", "家人", "同事"],
  "tags": [
    ["工作", 8],
    ["重要", 6],
    ["电子产品", 5]
  ]
}
```

### 6. 高级搜索 - GET /api/entries/search_advanced/

支持更复杂的搜索条件。

**查询参数：**
- `date_from`: 开始日期 (YYYY-MM-DD)
- `date_to`: 结束日期 (YYYY-MM-DD)
- `price_min`: 最小价格
- `price_max`: 最大价格
- 以及所有基本列表端点的参数

## 媒体文件管理

### 1. 上传媒体文件 - POST /api/entries/{id}/upload_media/

为条目上传媒体文件。

**请求体（multipart/form-data）：**
- `file`: 文件
- `type`: 媒体类型 (`image` 或 `video`)
- `caption`: 说明文字
- `is_primary`: 是否设为主要媒体

### 2. 设置主要媒体 - POST /api/entries/{id}/set_primary_media/

设置条目的主要媒体文件。

**请求体：**
```json
{
  "media_id": 1
}
```

### 3. 删除媒体文件 - DELETE /api/entries/{id}/delete_media/

删除条目的媒体文件。

**请求体：**
```json
{
  "media_id": 1
}
```

## 数据验证

### 通用验证
- `title`: 必填，最大200字符
- `importance_score`, `emotional_value`, `practical_value`, `frequency_of_use`, `duration_owned`: 1-10之间的整数
- `tags`: 字符串数组
- `is_private`: 布尔值

### 物品特有验证
- `original_price`: 不能为负数
- `acquisition_date`: 不能是未来日期
- `currency`: 3字符货币代码

### 人物特有验证
- `meeting_date`: 不能是未来日期
- `contact_info`: JSON对象

## 错误响应

API使用标准HTTP状态码：

- `200 OK`: 成功
- `201 Created`: 创建成功
- `400 Bad Request`: 请求数据无效
- `401 Unauthorized`: 未认证
- `403 Forbidden`: 权限不足
- `404 Not Found`: 资源不存在
- `500 Internal Server Error`: 服务器错误

**错误响应示例：**
```json
{
  "original_price": ["价格不能为负数"],
  "acquisition_date": ["获得日期不能是未来日期"]
}
```

## 分页

列表端点支持分页，默认每页20条记录。

**分页参数：**
- `page`: 页码
- `page_size`: 每页记录数（最大100）

## 性能优化

- 使用`select_related`和`prefetch_related`优化数据库查询
- 列表视图使用简化的序列化器减少数据传输
- 支持字段过滤和搜索以减少不必要的数据加载