from django.db import models
from entries.models import Entry


class Story(models.Model):
    """故事模型"""
    entry = models.OneToOneField(Entry, on_delete=models.CASCADE, related_name='story')
    content = models.TextField(help_text='富文本故事内容')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'stories'
        verbose_name = '故事'
        verbose_name_plural = '故事'
    
    def __str__(self):
        return f"{self.entry.title} 的故事"


class StoryVersion(models.Model):
    """故事版本历史"""
    story = models.ForeignKey(Story, on_delete=models.CASCADE, related_name='versions')
    content = models.TextField()
    version_number = models.PositiveIntegerField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'story_versions'
        verbose_name = '故事版本'
        verbose_name_plural = '故事版本'
        ordering = ['-version_number']
        unique_together = ['story', 'version_number']
    
    def __str__(self):
        return f"{self.story.entry.title} - 版本 {self.version_number}"