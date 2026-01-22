from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.utils import timezone
from decimal import Decimal
from datetime import date, timedelta
from .models import Entry, EntryMedia

User = get_user_model()


class EntryModelTest(TestCase):
    """Entry模型测试"""
    
    def setUp(self):
        """设置测试数据"""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    def test_create_item_entry(self):
        """测试创建物品条目"""
        entry = Entry.objects.create(
            user=self.user,
            type='item',
            title='我的笔记本电脑',
            description='工作用的笔记本电脑',
            acquisition_date=date.today() - timedelta(days=365),
            acquisition_method='purchase',
            original_price=Decimal('8999.00'),
            currency='CNY',
            category='电子产品',
            condition='good'
        )
        
        self.assertEqual(entry.title, '我的笔记本电脑')
        self.assertEqual(entry.type, 'item')
        self.assertEqual(entry.user, self.user)
        self.assertEqual(entry.original_price, Decimal('8999.00'))
        self.assertEqual(entry.currency, 'CNY')
        self.assertEqual(entry.get_acquisition_method_display(), '购买')
        self.assertEqual(entry.get_condition_display(), '良好')
    
    def test_create_person_entry(self):
        """测试创建人物条目"""
        entry = Entry.objects.create(
            user=self.user,
            type='person',
            title='张三',
            description='我的好朋友',
            relationship='friend',
            meeting_date=date.today() - timedelta(days=1000),
            contact_info={'phone': '13800138000', 'email': 'zhangsan@example.com'}
        )
        
        self.assertEqual(entry.title, '张三')
        self.assertEqual(entry.type, 'person')
        self.assertEqual(entry.relationship, 'friend')
        self.assertEqual(entry.get_relationship_display(), '朋友')
        self.assertEqual(entry.contact_info['phone'], '13800138000')
    
    def test_story_content_management(self):
        """测试故事内容管理"""
        entry = Entry.objects.create(
            user=self.user,
            type='item',
            title='测试物品',
            story_content='这是一个有趣的故事...'
        )
        
        self.assertTrue(entry.has_story)
        self.assertIsNotNone(entry.story_last_modified)
        
        # 测试更新故事内容
        old_modified_time = entry.story_last_modified
        entry.story_content = '这是更新后的故事内容...'
        entry.save()
        
        self.assertNotEqual(entry.story_last_modified, old_modified_time)
    
    def test_importance_calculation(self):
        """测试重要度计算"""
        entry = Entry.objects.create(
            user=self.user,
            type='item',
            title='测试物品',
            emotional_value=8,
            practical_value=6,
            frequency_of_use=7,
            duration_owned=9
        )
        
        # 计算期望值: 8*0.35 + 6*0.25 + 7*0.25 + 9*0.15 = 7.4
        expected_importance = 8 * 0.35 + 6 * 0.25 + 7 * 0.25 + 9 * 0.15
        self.assertEqual(entry.calculated_importance, round(expected_importance, 2))
    
    def test_age_calculation(self):
        """测试年龄计算"""
        # 测试物品年龄
        acquisition_date = date.today() - timedelta(days=100)
        item_entry = Entry.objects.create(
            user=self.user,
            type='item',
            title='测试物品',
            acquisition_date=acquisition_date
        )
        self.assertEqual(item_entry.age_in_days, 100)
        
        # 测试人物年龄
        meeting_date = date.today() - timedelta(days=200)
        person_entry = Entry.objects.create(
            user=self.user,
            type='person',
            title='测试人物',
            meeting_date=meeting_date
        )
        self.assertEqual(person_entry.age_in_days, 200)
    
    def test_validation_constraints(self):
        """测试验证约束"""
        # 测试重要度分数范围验证
        with self.assertRaises(ValidationError):
            entry = Entry(
                user=self.user,
                type='item',
                title='测试物品',
                importance_score=11  # 超出范围
            )
            entry.full_clean()
        
        with self.assertRaises(ValidationError):
            entry = Entry(
                user=self.user,
                type='item',
                title='测试物品',
                emotional_value=0  # 低于范围
            )
            entry.full_clean()
    
    def test_future_date_validation(self):
        """测试未来日期验证"""
        future_date = date.today() + timedelta(days=1)
        
        # 测试获得日期不能是未来
        entry = Entry(
            user=self.user,
            type='item',
            title='测试物品',
            acquisition_date=future_date
        )
        with self.assertRaises(ValidationError):
            entry.clean()
        
        # 测试认识日期不能是未来
        entry = Entry(
            user=self.user,
            type='person',
            title='测试人物',
            meeting_date=future_date
        )
        with self.assertRaises(ValidationError):
            entry.clean()
    
    def test_negative_price_validation(self):
        """测试负价格验证"""
        entry = Entry(
            user=self.user,
            type='item',
            title='测试物品',
            original_price=Decimal('-100.00')
        )
        with self.assertRaises(ValidationError):
            entry.clean()
    
    def test_string_representation(self):
        """测试字符串表示"""
        entry = Entry.objects.create(
            user=self.user,
            type='item',
            title='测试物品'
        )
        self.assertEqual(str(entry), '物品: 测试物品')
    
    def test_update_importance_evaluation(self):
        """测试更新重要度评估时间"""
        entry = Entry.objects.create(
            user=self.user,
            type='item',
            title='测试物品'
        )
        
        self.assertIsNone(entry.importance_last_evaluated)
        entry.update_importance_evaluation()
        self.assertIsNotNone(entry.importance_last_evaluated)
    
    def test_get_primary_media(self):
        """测试获取主要媒体文件"""
        entry = Entry.objects.create(
            user=self.user,
            type='item',
            title='测试物品'
        )
        
        # 创建媒体文件
        media1 = EntryMedia.objects.create(
            entry=entry,
            type='image',
            file='test1.jpg',
            is_primary=False
        )
        
        media2 = EntryMedia.objects.create(
            entry=entry,
            type='image',
            file='test2.jpg',
            is_primary=True
        )
        
        primary_media = entry.get_primary_media()
        self.assertEqual(primary_media, media2)
    
    def test_tags_and_decorations(self):
        """测试标签和装饰功能"""
        entry = Entry.objects.create(
            user=self.user,
            type='item',
            title='测试物品',
            tags=['电子产品', '工作', '重要'],
            decorations=['border-gold', 'shadow-large']
        )
        
        self.assertIn('电子产品', entry.tags)
        self.assertIn('border-gold', entry.decorations)
        self.assertEqual(len(entry.tags), 3)
        self.assertEqual(len(entry.decorations), 2)


class EntryMediaModelTest(TestCase):
    """EntryMedia模型测试"""
    
    def setUp(self):
        """设置测试数据"""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.entry = Entry.objects.create(
            user=self.user,
            type='item',
            title='测试物品'
        )
    
    def test_create_entry_media(self):
        """测试创建条目媒体"""
        media = EntryMedia.objects.create(
            entry=self.entry,
            type='image',
            file='test_image.jpg',
            caption='测试图片',
            is_primary=True
        )
        
        self.assertEqual(media.entry, self.entry)
        self.assertEqual(media.type, 'image')
        self.assertEqual(media.caption, '测试图片')
        self.assertTrue(media.is_primary)
    
    def test_string_representation(self):
        """测试字符串表示"""
        media = EntryMedia.objects.create(
            entry=self.entry,
            type='image',
            file='test_image.jpg'
        )
        
        expected_str = f"{self.entry.title} - 图片"
        self.assertEqual(str(media), expected_str)
    
    def test_media_ordering(self):
        """测试媒体文件排序"""
        # 创建多个媒体文件
        media1 = EntryMedia.objects.create(
            entry=self.entry,
            type='image',
            file='test1.jpg',
            is_primary=False
        )
        
        media2 = EntryMedia.objects.create(
            entry=self.entry,
            type='image',
            file='test2.jpg',
            is_primary=True
        )
        
        media3 = EntryMedia.objects.create(
            entry=self.entry,
            type='video',
            file='test.mp4',
            is_primary=False
        )
        
        # 获取排序后的媒体文件
        media_list = list(self.entry.media_files.all())
        
        # 主要媒体应该排在第一位
        self.assertEqual(media_list[0], media2)
        self.assertTrue(media_list[0].is_primary)