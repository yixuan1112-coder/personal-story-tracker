from datetime import date
from decimal import Decimal
from .models import ValuationRecord, DepreciationRule


class ValuationCalculator:
    """价值计算器"""
    
    def __init__(self):
        self.condition_factors = {
            'new': 1.0,
            'excellent': 0.9,
            'good': 0.75,
            'fair': 0.6,
            'poor': 0.4,
        }
    
    def calculate_valuation(self, entry):
        """计算条目的当前价值"""
        if entry.type != 'item' or not entry.original_price or not entry.acquisition_date:
            raise ValueError("无法计算价值：缺少必要信息")
        
        # 计算物品年龄（月数）
        today = date.today()
        age_in_months = (today.year - entry.acquisition_date.year) * 12 + \
                       (today.month - entry.acquisition_date.month)
        
        # 获取折旧率
        depreciation_rate = self._get_depreciation_rate(entry.category)
        
        # 获取状况因子
        condition_factor = self.condition_factors.get(entry.condition, 0.75)
        
        # 计算折旧后价值
        monthly_rate = depreciation_rate / 12
        depreciation_factor = (1 - monthly_rate) ** age_in_months
        
        # 应用最低价值限制
        min_value_percentage = self._get_min_value_percentage(entry.category)
        min_depreciation_factor = min_value_percentage / 100
        depreciation_factor = max(depreciation_factor, min_depreciation_factor)
        
        # 计算当前价值
        current_value = entry.original_price * depreciation_factor * condition_factor
        
        # 创建评估记录
        methodology = f"使用{entry.category}类别的年折旧率{depreciation_rate*100:.1f}%，" \
                     f"状况因子{condition_factor}，物品年龄{age_in_months}个月进行计算"
        
        valuation = ValuationRecord.objects.create(
            entry=entry,
            original_price=entry.original_price,
            current_value=current_value,
            depreciation_rate=depreciation_rate,
            category_factor=Decimal('1.0'),
            condition_factor=Decimal(str(condition_factor)),
            age_in_months=age_in_months,
            methodology=methodology
        )
        
        return valuation
    
    def _get_depreciation_rate(self, category):
        """获取类别的折旧率"""
        try:
            rule = DepreciationRule.objects.get(category=category)
            return rule.annual_rate
        except DepreciationRule.DoesNotExist:
            # 使用默认规则
            default_rules = DepreciationRule.get_default_rules()
            return Decimal(str(default_rules.get(category, 0.12)))
    
    def _get_min_value_percentage(self, category):
        """获取最低价值百分比"""
        try:
            rule = DepreciationRule.objects.get(category=category)
            return rule.min_value_percentage
        except DepreciationRule.DoesNotExist:
            return Decimal('10.0')  # 默认最低10%