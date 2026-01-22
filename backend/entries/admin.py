from django.contrib import admin
from .models import Entry, EntryMedia


class EntryMediaInline(admin.TabularInline):
    """条目媒体内联管理"""
    model = EntryMedia
    extra = 1
    fields = ('type', 'file', 'caption', 'is_primary')


@admin.register(Entry)
class EntryAdmin(admin.ModelAdmin):
    """条目管理"""
    list_display = ('title', 'type', 'user', 'importance_score', 'has_story', 'created_at')
    list_filter = ('type', 'category', 'condition', 'relationship', 'is_private', 'created_at')
    search_fields = ('title', 'description', 'story_content', 'user__email', 'user__username')
    readonly_fields = ('calculated_importance', 'age_in_days', 'has_story', 'created_at', 'updated_at', 'story_last_modified', 'importance_last_evaluated')
    inlines = [EntryMediaInline]
    
    fieldsets = (
        ('基本信息', {
            'fields': ('user', 'type', 'title', 'description')
        }),
        ('故事内容', {
            'fields': ('story_content', 'story_last_modified', 'has_story'),
            'classes': ('collapse',)
        }),
        ('物品信息', {
            'fields': ('acquisition_date', 'acquisition_method', 'original_price', 
                      'currency', 'category', 'condition'),
            'classes': ('collapse',)
        }),
        ('人物信息', {
            'fields': ('relationship', 'meeting_date', 'contact_info'),
            'classes': ('collapse',)
        }),
        ('重要度评估', {
            'fields': ('importance_score', 'emotional_value', 'practical_value', 
                      'frequency_of_use', 'duration_owned', 'calculated_importance', 
                      'importance_last_evaluated')
        }),
        ('视觉定制', {
            'fields': ('theme', 'decorations', 'layout', 'tags', 'is_private'),
            'classes': ('collapse',)
        }),
        ('统计信息', {
            'fields': ('age_in_days', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        """优化查询性能"""
        return super().get_queryset(request).select_related('user')
    
    def save_model(self, request, obj, form, change):
        """保存时更新重要度评估时间"""
        if change:  # 如果是编辑操作
            original = Entry.objects.get(pk=obj.pk)
            importance_fields = ['importance_score', 'emotional_value', 'practical_value', 'frequency_of_use', 'duration_owned']
            if any(getattr(original, field) != getattr(obj, field) for field in importance_fields):
                obj.update_importance_evaluation()
        super().save_model(request, obj, form, change)


@admin.register(EntryMedia)
class EntryMediaAdmin(admin.ModelAdmin):
    """条目媒体管理"""
    list_display = ('entry', 'type', 'caption', 'is_primary', 'created_at')
    list_filter = ('type', 'is_primary', 'created_at')
    search_fields = ('entry__title', 'caption')
    
    def get_queryset(self, request):
        """优化查询性能"""
        return super().get_queryset(request).select_related('entry', 'entry__user')