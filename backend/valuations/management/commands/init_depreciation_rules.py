from django.core.management.base import BaseCommand
from valuations.models import DepreciationRule
from decimal import Decimal


class Command(BaseCommand):
    help = '初始化默认折旧规则'

    def handle(self, *args, **options):
        default_rules = {
            '电子产品': {'rate': 0.25, 'min_value': 10.0},
            '汽车': {'rate': 0.15, 'min_value': 15.0},
            '家具': {'rate': 0.10, 'min_value': 20.0},
            '服装': {'rate': 0.30, 'min_value': 5.0},
            '书籍': {'rate': 0.05, 'min_value': 30.0},
            '艺术品': {'rate': -0.05, 'min_value': 50.0},  # 可能升值
            '珠宝': {'rate': 0.02, 'min_value': 40.0},
            '其他': {'rate': 0.12, 'min_value': 15.0},
        }

        created_count = 0
        for category, data in default_rules.items():
            rule, created = DepreciationRule.objects.get_or_create(
                category=category,
                defaults={
                    'annual_rate': Decimal(str(data['rate'])),
                    'min_value_percentage': Decimal(str(data['min_value']))
                }
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'创建折旧规则: {category} - {data["rate"]*100}%/年')
                )

        if created_count > 0:
            self.stdout.write(
                self.style.SUCCESS(f'成功创建 {created_count} 个折旧规则')
            )
        else:
            self.stdout.write(
                self.style.WARNING('所有折旧规则已存在，无需创建')
            )