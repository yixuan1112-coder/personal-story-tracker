from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from datetime import date
from decimal import Decimal
from entries.models import Entry
from .models import ValuationRecord, DepreciationRule
from .serializers import ValuationRecordSerializer, DepreciationRuleSerializer
from .utils import ValuationCalculator


class ValuationDetailView(generics.RetrieveAPIView):
    """价值评估详情视图"""
    serializer_class = ValuationRecordSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        entry_id = self.kwargs['entry_id']
        entry = get_object_or_404(Entry, id=entry_id, user=self.request.user)
        
        # 获取最新的价值评估记录
        latest_valuation = entry.valuations.first()
        if not latest_valuation:
            # 如果没有评估记录，自动计算一个
            calculator = ValuationCalculator()
            latest_valuation = calculator.calculate_valuation(entry)
        
        return latest_valuation


class CalculateValuationView(generics.CreateAPIView):
    """计算价值评估视图"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, entry_id):
        entry = get_object_or_404(Entry, id=entry_id, user=request.user)
        
        if entry.type != 'item' or not entry.original_price:
            return Response(
                {'error': '只能为有原始价格的物品条目计算价值'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        calculator = ValuationCalculator()
        valuation = calculator.calculate_valuation(entry)
        
        serializer = ValuationRecordSerializer(valuation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ValuationHistoryView(generics.ListAPIView):
    """价值评估历史视图"""
    serializer_class = ValuationRecordSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        entry_id = self.kwargs['entry_id']
        entry = get_object_or_404(Entry, id=entry_id, user=self.request.user)
        return entry.valuations.all()


class DepreciationRuleListView(generics.ListAPIView):
    """折旧规则列表视图"""
    queryset = DepreciationRule.objects.all()
    serializer_class = DepreciationRuleSerializer
    permission_classes = [IsAuthenticated]