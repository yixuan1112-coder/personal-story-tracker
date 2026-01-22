from django.contrib import admin
from .models import ValuationRecord, DepreciationRule


@admin.register(ValuationRecord)
class ValuationRecordAdmin(admin.ModelAdmin):
    """价值评估记录管理"""
    list_display = ('entry', 'original_price', 'current_value', 'depreciation_rate', 'calculated_at')
    list_filter = ('calculated_at', 'depreciation_rate')
    search_fields = ('entry__title', 'entry__user__email')
    readonly_fields = ('calculated_at',)


@admin.register(DepreciationRule)
class DepreciationRuleAdmin(admin.ModelAdmin):
    """折旧规则管理"""
    list_display = ('category', 'annual_rate', 'min_value_percentage')
    search_fields = ('category',)