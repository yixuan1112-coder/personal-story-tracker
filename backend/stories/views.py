from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from entries.models import Entry
from .models import Story, StoryVersion
from .serializers import StorySerializer, StoryVersionSerializer


class StoryDetailView(generics.RetrieveUpdateAPIView):
    """故事详情视图"""
    serializer_class = StorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        entry_id = self.kwargs['entry_id']
        entry = get_object_or_404(Entry, id=entry_id, user=self.request.user)
        story, created = Story.objects.get_or_create(entry=entry)
        return story
    
    def perform_update(self, serializer):
        """更新故事时创建版本历史"""
        story = serializer.instance
        
        # 创建版本历史
        if story.content:  # 如果已有内容，保存为历史版本
            last_version = story.versions.first()
            version_number = (last_version.version_number + 1) if last_version else 1
            
            StoryVersion.objects.create(
                story=story,
                content=story.content,
                version_number=version_number
            )
        
        serializer.save()


class StoryVersionListView(generics.ListAPIView):
    """故事版本历史列表"""
    serializer_class = StoryVersionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        entry_id = self.kwargs['entry_id']
        entry = get_object_or_404(Entry, id=entry_id, user=self.request.user)
        
        try:
            story = Story.objects.get(entry=entry)
            return story.versions.all()
        except Story.DoesNotExist:
            return StoryVersion.objects.none()