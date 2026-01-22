from rest_framework import serializers
from .models import ValuationRecord, DepreciationRule


class ValuationRecordSerializer(serializers.ModelSerializer):
    """价值评估记录序列化器"""
    
    class Meta:
        model = ValuationRecord
        fields = [
            'id', 'calculated_at', 'original_price', 'current_value',
            'depreciation_rate', 'category_factor', 'condition_factor',
            'age_in_months', 'methodology'
        ]
        read_only_fields = ['id', 'calculated_at']


class DepreciationRuleSerializer(serializers.ModelSerializer):
    """折旧规则序列化器"""
    
    class Meta:
        model = DepreciationRule
        fields = ['id', 'category', 'annual_rate', 'min_value_percentage']