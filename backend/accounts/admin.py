from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """用户管理界面"""
    list_display = ('email', 'username', 'display_name', 'is_active', 'created_at')
    list_filter = ('is_active', 'is_staff', 'theme', 'created_at')
    search_fields = ('email', 'username', 'display_name')
    ordering = ('-created_at',)
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('个人信息', {
            'fields': ('display_name', 'avatar', 'theme', 'default_currency')
        }),
        ('时间信息', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at')
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2', 'display_name'),
        }),
    )