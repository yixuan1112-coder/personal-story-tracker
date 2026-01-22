from rest_framework import serializers
from .models import Story, StoryVersion


class StorySerializer(serializers.ModelSerializer):
    """故事序列化器"""
    
    class Meta:
        model = Story
        fields = ['id', 'content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class StoryVersionSerializer(serializers.ModelSerializer):
    """故事版本序列化器"""
    
    class Meta:
        model = StoryVersion
        fields = ['id', 'content', 'version_number', 'created_at']
        read_only_fields = ['id', 'created_at']