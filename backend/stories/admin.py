from django.contrib import admin
from .models import Story, StoryVersion


class StoryVersionInline(admin.TabularInline):
    """故事版本内联管理"""
    model = StoryVersion
    extra = 0
    readonly_fields = ('version_number', 'created_at')
    fields = ('version_number', 'content', 'created_at')


@admin.register(Story)
class StoryAdmin(admin.ModelAdmin):
    """故事管理"""
    list_display = ('entry', 'created_at', 'updated_at')
    search_fields = ('entry__title', 'content')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [StoryVersionInline]


@admin.register(StoryVersion)
class StoryVersionAdmin(admin.ModelAdmin):
    """故事版本管理"""
    list_display = ('story', 'version_number', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('story__entry__title', 'content')