from django.db import models
from entries.models import Entry
from datetime import date
from decimal import Decimal


class ValuationRecord(models.Model):
    """价值评估记录模型"""
    entry = models.ForeignKey(Entry, on_delete=models.CASCADE, related_name='valuations')
    calculated_at = models.DateTimeField(auto_now_add=True)
    original_price = models.DecimalField(max_digits=10, decimal_places=2)
    current_value = models.DecimalField(max_digits=10, decimal_places=2)
    depreciation_rate = models.DecimalField(max_digits=5, decimal_places=4)  # 年折旧率
    
    # 市场因素
    category_factor = models.DecimalField(max_digits=3, decimal_places=2, default=1.0)
    condition_factor = models.DecimalField(max_digits=3, decimal_places=2, default=1.0)
    age_in_months = models.PositiveIntegerField()
    
    methodology = models.TextField(help_text='计算方法说明')
    
    class Meta:
        db_table = 'valuation_records'
        verbose_name = '价值评估记录'
        verbose_name_plural = '价值评估记录'
        ordering = ['-calculated_at']
    
    def __str__(self):
        return f"{self.entry.title} - {self.calculated_at.date()}"


class DepreciationRule(models.Model):
    """折旧规则模型"""
    category = models.CharField(max_length=100, unique=True)
    annual_rate = models.DecimalField(max_digits=5, decimal_places=4, help_text='年折旧率')
    min_value_percentage = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=10.0,
        help_text='最低价值百分比'
    )
    
    class Meta:
        db_table = 'depreciation_rules'
        verbose_name = '折旧规则'
        verbose_name_plural = '折旧规则'
    
    def __str__(self):
        return f"{self.category} - {self.annual_rate * 100}%/年"
    
    @classmethod
    def get_default_rules(cls):
        """获取默认折旧规则"""
        return {
            '电子产品': 0.25,  # 25%年折旧率
            '汽车': 0.15,
            '家具': 0.10,
            '服装': 0.30,
            '书籍': 0.05,
            '艺术品': -0.05,  # 可能升值
            '珠宝': 0.02,
            '其他': 0.12,
        }