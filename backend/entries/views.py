from rest_framework import viewsets, status, filters, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count
from django.utils import timezone
from .models import Entry, EntryMedia
from .serializers import (
    EntrySerializer, 
    EntryListSerializer, 
    EntryCreateUpdateSerializer,
    EntryMediaSerializer,
    StoryContentSerializer
)


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    自定义权限：只有条目的所有者才能编辑
    """
    def has_object_permission(self, request, view, obj):
        # 读取权限对所有请求都允许
        # 但写入权限只给条目的所有者
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user


class EntryViewSet(viewsets.ModelViewSet):
    """条目视图集 - 提供完整的CRUD操作"""
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['type', 'category', 'condition', 'relationship', 'is_private']
    search_fields = ['title', 'description', 'story_content', 'tags']
    ordering_fields = ['created_at', 'updated_at', 'importance_score', 'calculated_importance', 'acquisition_date', 'meeting_date']
    ordering = ['-updated_at']
    
    def get_queryset(self):
        """获取当前用户的条目"""
        queryset = Entry.objects.filter(user=self.request.user).prefetch_related('media_files')
        
        # 支持按重要度过滤
        min_importance = self.request.query_params.get('min_importance')
        if min_importance:
            try:
                min_importance = int(min_importance)
                queryset = queryset.filter(importance_score__gte=min_importance)
            except ValueError:
                pass
        
        # 支持按标签过滤
        tags = self.request.query_params.get('tags')
        if tags:
            tag_list = [tag.strip() for tag in tags.split(',')]
            for tag in tag_list:
                queryset = queryset.filter(tags__contains=[tag])
        
        # 支持按是否有故事过滤
        has_story = self.request.query_params.get('has_story')
        if has_story is not None:
            if has_story.lower() in ['true', '1']:
                queryset = queryset.exclude(story_content__isnull=True).exclude(story_content='')
            elif has_story.lower() in ['false', '0']:
                queryset = queryset.filter(Q(story_content__isnull=True) | Q(story_content=''))
        
        return queryset
    
    def get_serializer_class(self):
        """根据动作选择序列化器"""
        if self.action == 'list':
            return EntryListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return EntryCreateUpdateSerializer
        elif self.action == 'update_story':
            return StoryContentSerializer
        return EntrySerializer
    
    def perform_create(self, serializer):
        """创建条目时设置用户"""
        serializer.save(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        """创建条目"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        entry = serializer.save()
        
        # 返回完整的条目信息
        response_serializer = EntrySerializer(entry, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        """更新条目"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        entry = serializer.save()
        
        # 返回完整的条目信息
        response_serializer = EntrySerializer(entry, context={'request': request})
        return Response(response_serializer.data)
    
    @action(detail=True, methods=['put', 'patch'])
    def update_story(self, request, pk=None):
        """更新条目的故事内容"""
        entry = self.get_object()
        serializer = StoryContentSerializer(entry, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def by_importance(self, request):
        """按重要度排序的条目列表"""
        queryset = self.filter_queryset(self.get_queryset())
        
        # 获取所有条目并在Python中排序（因为calculated_importance是属性）
        entries = list(queryset)
        entries.sort(key=lambda x: (x.calculated_importance, x.importance_score), reverse=True)
        
        # 手动分页
        page = self.paginate_queryset(entries)
        if page is not None:
            serializer = EntryListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = EntryListSerializer(entries, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """最近更新的条目"""
        queryset = self.filter_queryset(self.get_queryset())[:10]  # 最近10个
        serializer = EntryListSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """按类型分组的条目统计"""
        queryset = self.get_queryset()
        
        items = queryset.filter(type='item')
        persons = queryset.filter(type='person')
        
        return Response({
            'items': {
                'count': items.count(),
                'categories': list(items.values_list('category', flat=True).distinct().exclude(category='')),
                'recent': EntryListSerializer(items[:5], many=True, context={'request': request}).data
            },
            'persons': {
                'count': persons.count(),
                'relationships': list(persons.values_list('relationship', flat=True).distinct().exclude(relationship='')),
                'recent': EntryListSerializer(persons[:5], many=True, context={'request': request}).data
            }
        })
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """条目统计信息"""
        queryset = self.get_queryset()
        total_count = queryset.count()
        item_count = queryset.filter(type='item').count()
        person_count = queryset.filter(type='person').count()
        
        # 统计有故事的条目
        with_story_count = queryset.exclude(story_content__isnull=True).exclude(story_content='').count()
        
        # 统计重要度分布
        importance_distribution = {}
        for i in range(1, 11):
            importance_distribution[str(i)] = queryset.filter(importance_score=i).count()
        
        return Response({
            'total_count': total_count,
            'item_count': item_count,
            'person_count': person_count,
            'with_story_count': with_story_count,
            'without_story_count': total_count - with_story_count,
            'importance_distribution': importance_distribution,
            'categories': list(queryset.filter(type='item').values_list('category', flat=True).distinct().exclude(category='')),
            'relationships': list(queryset.filter(type='person').values_list('relationship', flat=True).distinct().exclude(relationship='')),
            'tags': self._get_all_tags(queryset),
        })
    
    def _get_all_tags(self, queryset):
        """获取所有标签及其使用次数"""
        tag_counts = {}
        for entry in queryset:
            for tag in entry.tags:
                tag_counts[tag] = tag_counts.get(tag, 0) + 1
        return sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)[:20]  # 返回前20个最常用标签
    
    @action(detail=True, methods=['post'])
    def upload_media(self, request, pk=None):
        """为条目上传媒体文件"""
        entry = self.get_object()
        
        # 检查是否设置为主要图片
        is_primary = request.data.get('is_primary', False)
        if is_primary:
            # 取消其他主要图片
            EntryMedia.objects.filter(entry=entry, is_primary=True).update(is_primary=False)
        
        serializer = EntryMediaSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(entry=entry)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['delete'])
    def delete_media(self, request, pk=None):
        """删除条目的媒体文件"""
        entry = self.get_object()
        media_id = request.data.get('media_id')
        
        if not media_id:
            return Response({'error': '请提供media_id'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            media = EntryMedia.objects.get(id=media_id, entry=entry)
            media.delete()
            return Response({'message': '媒体文件已删除'}, status=status.HTTP_200_OK)
        except EntryMedia.DoesNotExist:
            return Response({'error': '媒体文件不存在'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def set_primary_media(self, request, pk=None):
        """设置主要媒体文件"""
        entry = self.get_object()
        media_id = request.data.get('media_id')
        
        if not media_id:
            return Response({'error': '请提供media_id'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # 取消所有主要媒体
            EntryMedia.objects.filter(entry=entry, is_primary=True).update(is_primary=False)
            
            # 设置新的主要媒体
            media = EntryMedia.objects.get(id=media_id, entry=entry)
            media.is_primary = True
            media.save()
            
            return Response({'message': '主要媒体文件已设置'}, status=status.HTTP_200_OK)
        except EntryMedia.DoesNotExist:
            return Response({'error': '媒体文件不存在'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['get'])
    def search_advanced(self, request):
        """高级搜索"""
        queryset = self.get_queryset()
        
        # 按日期范围搜索
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        
        if date_from:
            try:
                from datetime import datetime
                date_from = datetime.strptime(date_from, '%Y-%m-%d').date()
                queryset = queryset.filter(
                    Q(acquisition_date__gte=date_from) | Q(meeting_date__gte=date_from)
                )
            except ValueError:
                pass
        
        if date_to:
            try:
                from datetime import datetime
                date_to = datetime.strptime(date_to, '%Y-%m-%d').date()
                queryset = queryset.filter(
                    Q(acquisition_date__lte=date_to) | Q(meeting_date__lte=date_to)
                )
            except ValueError:
                pass
        
        # 按价格范围搜索（仅物品）
        price_min = request.query_params.get('price_min')
        price_max = request.query_params.get('price_max')
        
        if price_min:
            try:
                price_min = float(price_min)
                queryset = queryset.filter(original_price__gte=price_min)
            except ValueError:
                pass
        
        if price_max:
            try:
                price_max = float(price_max)
                queryset = queryset.filter(original_price__lte=price_max)
            except ValueError:
                pass
        
        # 应用其他过滤器
        queryset = self.filter_queryset(queryset)
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = EntryListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = EntryListSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)