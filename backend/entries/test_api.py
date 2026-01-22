from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal
from datetime import date, timedelta
from .models import Entry, EntryMedia

User = get_user_model()


class EntryAPITest(TestCase):
    """条目API测试"""
    
    def setUp(self):
        """设置测试数据"""
        self.client = APIClient()
        
        # 创建测试用户
        self.user1 = User.objects.create_user(
            username='testuser1',
            email='test1@example.com',
            password='testpass123'
        )
        self.user2 = User.objects.create_user(
            username='testuser2',
            email='test2@example.com',
            password='testpass123'
        )
        
        # 创建测试条目
        self.item_entry = Entry.objects.create(
            user=self.user1,
            type='item',
            title='测试物品',
            description='测试物品描述',
            acquisition_date=date.today() - timedelta(days=100),
            acquisition_method='purchase',
            original_price=Decimal('999.99'),
            currency='CNY',
            category='电子产品',
            condition='good',
            importance_score=8
        )
        
        self.person_entry = Entry.objects.create(
            user=self.user1,
            type='person',
            title='张三',
            description='我的朋友',
            relationship='friend',
            meeting_date=date.today() - timedelta(days=365),
            importance_score=7
        )
        
        # 创建其他用户的条目
        self.other_user_entry = Entry.objects.create(
            user=self.user2,
            type='item',
            title='其他用户的物品',
            description='其他用户的物品描述'
        )
    
    def test_authentication_required(self):
        """测试需要认证"""
        url = reverse('entry-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_list_entries(self):
        """测试获取条目列表"""
        self.client.force_authenticate(user=self.user1)
        url = reverse('entry-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)  # 只能看到自己的条目
        
        # 验证返回的字段
        entry_data = response.data['results'][0]
        expected_fields = ['id', 'type', 'title', 'description', 'importance_score', 
                          'calculated_importance', 'primary_image', 'has_story', 'tags',
                          'created_at', 'updated_at']
        for field in expected_fields:
            self.assertIn(field, entry_data)
    
    def test_retrieve_entry(self):
        """测试获取单个条目"""
        self.client.force_authenticate(user=self.user1)
        url = reverse('entry-detail', kwargs={'pk': self.item_entry.pk})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], '测试物品')
        self.assertEqual(response.data['type'], 'item')
        
        # 验证详细字段
        detailed_fields = ['story_content', 'acquisition_date', 'original_price', 
                          'media_files', 'age_in_days', 'calculated_importance']
        for field in detailed_fields:
            self.assertIn(field, response.data)
    
    def test_create_item_entry(self):
        """测试创建物品条目"""
        self.client.force_authenticate(user=self.user1)
        url = reverse('entry-list')
        
        data = {
            'type': 'item',
            'title': '新物品',
            'description': '新物品描述',
            'acquisition_date': date.today().isoformat(),
            'acquisition_method': 'gift',
            'original_price': '199.99',
            'currency': 'CNY',
            'category': '书籍',
            'condition': 'new',
            'importance_score': 6,
            'tags': ['礼物', '书籍']
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # 验证创建的条目
        entry = Entry.objects.get(id=response.data['id'])
        self.assertEqual(entry.user, self.user1)
        self.assertEqual(entry.title, '新物品')
        self.assertEqual(entry.type, 'item')
        self.assertEqual(entry.original_price, Decimal('199.99'))
        self.assertEqual(entry.tags, ['礼物', '书籍'])
    
    def test_create_person_entry(self):
        """测试创建人物条目"""
        self.client.force_authenticate(user=self.user1)
        url = reverse('entry-list')
        
        data = {
            'type': 'person',
            'title': '李四',
            'description': '我的同事',
            'relationship': 'colleague',
            'meeting_date': (date.today() - timedelta(days=30)).isoformat(),
            'contact_info': {'phone': '13800138000', 'email': 'lisi@example.com'},
            'importance_score': 5
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # 验证创建的条目
        entry = Entry.objects.get(id=response.data['id'])
        self.assertEqual(entry.user, self.user1)
        self.assertEqual(entry.title, '李四')
        self.assertEqual(entry.type, 'person')
        self.assertEqual(entry.relationship, 'colleague')
        self.assertEqual(entry.contact_info['phone'], '13800138000')
    
    def test_update_entry(self):
        """测试更新条目"""
        self.client.force_authenticate(user=self.user1)
        url = reverse('entry-detail', kwargs={'pk': self.item_entry.pk})
        
        data = {
            'title': '更新后的物品',
            'description': '更新后的描述',
            'importance_score': 9,
            'tags': ['更新', '测试']
        }
        
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 验证更新
        self.item_entry.refresh_from_db()
        self.assertEqual(self.item_entry.title, '更新后的物品')
        self.assertEqual(self.item_entry.importance_score, 9)
        self.assertEqual(self.item_entry.tags, ['更新', '测试'])
    
    def test_delete_entry(self):
        """测试删除条目"""
        self.client.force_authenticate(user=self.user1)
        url = reverse('entry-detail', kwargs={'pk': self.item_entry.pk})
        
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # 验证删除
        self.assertFalse(Entry.objects.filter(pk=self.item_entry.pk).exists())
    
    def test_user_data_isolation(self):
        """测试用户数据隔离"""
        self.client.force_authenticate(user=self.user1)
        
        # 尝试访问其他用户的条目
        url = reverse('entry-detail', kwargs={'pk': self.other_user_entry.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        
        # 尝试更新其他用户的条目
        response = self.client.patch(url, {'title': '恶意更新'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        
        # 尝试删除其他用户的条目
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_validation_errors(self):
        """测试数据验证"""
        self.client.force_authenticate(user=self.user1)
        url = reverse('entry-list')
        
        # 测试负价格
        data = {
            'type': 'item',
            'title': '测试物品',
            'original_price': '-100.00'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('original_price', response.data)
        
        # 测试未来日期
        data = {
            'type': 'item',
            'title': '测试物品',
            'acquisition_date': (date.today() + timedelta(days=1)).isoformat()
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('acquisition_date', response.data)
        
        # 测试重要度分数范围
        data = {
            'type': 'item',
            'title': '测试物品',
            'importance_score': 11
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('importance_score', response.data)
    
    def test_story_content_management(self):
        """测试故事内容管理"""
        self.client.force_authenticate(user=self.user1)
        
        # 更新故事内容
        url = reverse('entry-update-story', kwargs={'pk': self.item_entry.pk})
        data = {'story_content': '这是一个有趣的故事...'}
        
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 验证故事内容和修改时间
        self.item_entry.refresh_from_db()
        self.assertEqual(self.item_entry.story_content, '这是一个有趣的故事...')
        self.assertIsNotNone(self.item_entry.story_last_modified)
        self.assertTrue(self.item_entry.has_story)
    
    def test_filtering_and_search(self):
        """测试过滤和搜索"""
        self.client.force_authenticate(user=self.user1)
        url = reverse('entry-list')
        
        # 按类型过滤
        response = self.client.get(url, {'type': 'item'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        
        # 按重要度过滤
        response = self.client.get(url, {'min_importance': '8'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        
        # 搜索标题
        response = self.client.get(url, {'search': '测试物品'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_custom_endpoints(self):
        """测试自定义端点"""
        self.client.force_authenticate(user=self.user1)
        
        # 测试按重要度排序
        url = reverse('entry-by-importance')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 测试最近条目
        url = reverse('entry-recent')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 测试统计信息
        url = reverse('entry-statistics')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        expected_stats = ['total_count', 'item_count', 'person_count', 
                         'with_story_count', 'importance_distribution']
        for stat in expected_stats:
            self.assertIn(stat, response.data)
        
        # 测试按类型分组
        url = reverse('entry-by-type')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('items', response.data)
        self.assertIn('persons', response.data)
    
    def test_media_management(self):
        """测试媒体文件管理"""
        self.client.force_authenticate(user=self.user1)
        
        # 创建媒体文件
        media = EntryMedia.objects.create(
            entry=self.item_entry,
            type='image',
            file='test_image.jpg',
            caption='测试图片'
        )
        
        # 测试设置主要媒体
        url = reverse('entry-set-primary-media', kwargs={'pk': self.item_entry.pk})
        data = {'media_id': media.id}
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 验证设置
        media.refresh_from_db()
        self.assertTrue(media.is_primary)
        
        # 测试删除媒体
        url = reverse('entry-delete-media', kwargs={'pk': self.item_entry.pk})
        data = {'media_id': media.id}
        
        response = self.client.delete(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 验证删除
        self.assertFalse(EntryMedia.objects.filter(id=media.id).exists())
    
    def test_advanced_search(self):
        """测试高级搜索"""
        self.client.force_authenticate(user=self.user1)
        url = reverse('entry-search-advanced')
        
        # 按日期范围搜索
        date_from = (date.today() - timedelta(days=200)).isoformat()
        date_to = date.today().isoformat()
        
        response = self.client.get(url, {
            'date_from': date_from,
            'date_to': date_to
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 按价格范围搜索
        response = self.client.get(url, {
            'price_min': '500',
            'price_max': '1500'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)  # 应该找到测试物品