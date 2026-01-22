from rest_framework import serializers
from django.utils import timezone
from .models import Entry, EntryMedia


class EntryMediaSerializer(serializers.ModelSerializer):
    """条目媒体序列化器"""
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = EntryMedia
        fields = ['id', 'type', 'file', 'file_url', 'caption', 'is_primary', 'created_at']
        read_only_fields = ['id', 'created_at', 'file_url']
    
    def get_file_url(self, obj):
        """获取文件完整URL"""
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None


class EntrySerializer(serializers.ModelSerializer):
    """条目详情序列化器"""
    media_files = EntryMediaSerializer(many=True, read_only=True)
    calculated_importance = serializers.ReadOnlyField()
    age_in_days = serializers.ReadOnlyField()
    has_story = serializers.ReadOnlyField()
    
    class Meta:
        model = Entry
        fields = [
            'id', 'type', 'title', 'description', 'story_content', 'story_last_modified',
            'acquisition_date', 'acquisition_method', 'original_price', 'currency',
            'category', 'condition', 'relationship', 'meeting_date', 'contact_info',
            'importance_score', 'emotional_value', 'practical_value', 'frequency_of_use',
            'duration_owned', 'calculated_importance', 'importance_last_evaluated',
            'theme', 'decorations', 'layout', 'tags', 'is_private',
            'media_files', 'age_in_days', 'has_story', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'calculated_importance', 'age_in_days', 'has_story', 
            'story_last_modified', 'importance_last_evaluated', 'created_at', 'updated_at'
        ]
    
    def validate(self, data):
        """验证数据"""
        entry_type = data.get('type')
        
        # 物品类型验证
        if entry_type == 'item':
            if data.get('original_price') is not None and data.get('original_price') < 0:
                raise serializers.ValidationError({"original_price": "价格不能为负数"})
            
            # 验证获得日期不能是未来
            acquisition_date = data.get('acquisition_date')
            if acquisition_date and acquisition_date > timezone.now().date():
                raise serializers.ValidationError({"acquisition_date": "获得日期不能是未来日期"})
        
        # 人物类型验证
        if entry_type == 'person':
            # 验证认识日期不能是未来
            meeting_date = data.get('meeting_date')
            if meeting_date and meeting_date > timezone.now().date():
                raise serializers.ValidationError({"meeting_date": "认识日期不能是未来日期"})
        
        # 重要度分数验证
        importance_fields = ['importance_score', 'emotional_value', 'practical_value', 'frequency_of_use', 'duration_owned']
        for field in importance_fields:
            value = data.get(field)
            if value is not None and (value < 1 or value > 10):
                raise serializers.ValidationError({field: f"{field} 必须在1-10之间"})
        
        return data
    
    def create(self, validated_data):
        """创建条目"""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """更新条目"""
        # 检查重要度字段是否有变化
        importance_fields = ['importance_score', 'emotional_value', 'practical_value', 'frequency_of_use', 'duration_owned']
        importance_changed = any(
            field in validated_data and getattr(instance, field) != validated_data[field]
            for field in importance_fields
        )
        
        # 更新实例
        instance = super().update(instance, validated_data)
        
        # 如果重要度有变化，更新评估时间
        if importance_changed:
            instance.update_importance_evaluation()
        
        return instance


class EntryListSerializer(serializers.ModelSerializer):
    """条目列表序列化器 - 用于列表显示，减少数据量"""
    primary_image = serializers.SerializerMethodField()
    calculated_importance = serializers.ReadOnlyField()
    
    class Meta:
        model = Entry
        fields = [
            'id', 'type', 'title', 'description', 'importance_score',
            'calculated_importance', 'primary_image', 'created_at', 'updated_at'
        ]
    
    def get_primary_image(self, obj):
        """获取主要图片"""
        primary_media = obj.media_files.filter(is_primary=True, type='image').first()
        if primary_media:
            return self.context['request'].build_absolute_uri(primary_media.file.url)
        return None


class EntryCreateUpdateSerializer(serializers.ModelSerializer):
    """条目创建和更新序列化器"""
    
    class Meta:
        model = Entry
        fields = [
            'type', 'title', 'description',
            'acquisition_date', 'acquisition_method', 'original_price', 'currency',
            'category', 'condition', 'relationship', 'meeting_date',
            'importance_score', 'emotional_value', 'practical_value', 'frequency_of_use',
            'theme', 'decorations', 'tags', 'is_private'
        ]
    
    def validate(self, data):
        """验证数据"""
        entry_type = data.get('type')
        
        # 物品类型必填字段验证
        if entry_type == 'item':
            if not data.get('acquisition_date'):
                raise serializers.ValidationError("物品条目必须提供获得日期")
        
        # 人物类型必填字段验证
        if entry_type == 'person':
            if not data.get('relationship'):
                raise serializers.ValidationError("人物条目必须提供关系描述")
        
        return super().validate(data)


class EntryListSerializer(serializers.ModelSerializer):
    """条目列表序列化器 - 用于列表显示，减少数据量"""
    primary_image = serializers.SerializerMethodField()
    calculated_importance = serializers.ReadOnlyField()
    has_story = serializers.ReadOnlyField()
    
    class Meta:
        model = Entry
        fields = [
            'id', 'type', 'title', 'description', 'importance_score',
            'calculated_importance', 'primary_image', 'has_story', 'tags',
            'created_at', 'updated_at'
        ]
    
    def get_primary_image(self, obj):
        """获取主要图片"""
        primary_media = obj.media_files.filter(is_primary=True, type='image').first()
        if primary_media:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(primary_media.file.url)
            return primary_media.file.url
        return None


class EntryCreateUpdateSerializer(serializers.ModelSerializer):
    """条目创建和更新序列化器"""
    
    class Meta:
        model = Entry
        fields = [
            'type', 'title', 'description', 'story_content',
            'acquisition_date', 'acquisition_method', 'original_price', 'currency',
            'category', 'condition', 'relationship', 'meeting_date', 'contact_info',
            'importance_score', 'emotional_value', 'practical_value', 'frequency_of_use',
            'duration_owned', 'theme', 'decorations', 'layout', 'tags', 'is_private'
        ]
    
    def validate(self, data):
        """验证数据"""
        entry_type = data.get('type')
        
        # 物品类型必填字段验证
        if entry_type == 'item':
            if not data.get('title'):
                raise serializers.ValidationError({"title": "物品条目必须提供标题"})
            
            # 验证价格
            original_price = data.get('original_price')
            if original_price is not None and original_price < 0:
                raise serializers.ValidationError({"original_price": "价格不能为负数"})
            
            # 验证获得日期
            acquisition_date = data.get('acquisition_date')
            if acquisition_date and acquisition_date > timezone.now().date():
                raise serializers.ValidationError({"acquisition_date": "获得日期不能是未来日期"})
        
        # 人物类型必填字段验证
        elif entry_type == 'person':
            if not data.get('title'):
                raise serializers.ValidationError({"title": "人物条目必须提供姓名"})
            
            # 验证认识日期
            meeting_date = data.get('meeting_date')
            if meeting_date and meeting_date > timezone.now().date():
                raise serializers.ValidationError({"meeting_date": "认识日期不能是未来日期"})
        
        # 重要度分数验证
        importance_fields = ['importance_score', 'emotional_value', 'practical_value', 'frequency_of_use', 'duration_owned']
        for field in importance_fields:
            value = data.get(field)
            if value is not None and (value < 1 or value > 10):
                raise serializers.ValidationError({field: f"{field} 必须在1-10之间"})
        
        return data
    
    def create(self, validated_data):
        """创建条目"""
        validated_data['user'] = self.context['request'].user
        return Entry.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        """更新条目"""
        # 检查重要度字段是否有变化
        importance_fields = ['importance_score', 'emotional_value', 'practical_value', 'frequency_of_use', 'duration_owned']
        importance_changed = any(
            field in validated_data and getattr(instance, field) != validated_data[field]
            for field in importance_fields
        )
        
        # 更新字段
        for field, value in validated_data.items():
            setattr(instance, field, value)
        
        instance.save()
        
        # 如果重要度有变化，更新评估时间
        if importance_changed:
            instance.update_importance_evaluation()
        
        return instance


class StoryContentSerializer(serializers.ModelSerializer):
    """故事内容专用序列化器"""
    
    class Meta:
        model = Entry
        fields = ['id', 'story_content', 'story_last_modified', 'has_story']
        read_only_fields = ['id', 'story_last_modified', 'has_story']
    
    def update(self, instance, validated_data):
        """更新故事内容"""
        old_content = instance.story_content
        new_content = validated_data.get('story_content', '')
        
        # 如果内容有变化，更新修改时间
        if old_content != new_content:
            instance.story_content = new_content
            instance.story_last_modified = timezone.now()
            instance.save(update_fields=['story_content', 'story_last_modified'])
        
        return instance