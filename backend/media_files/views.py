from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.files.storage import default_storage
from PIL import Image
import os


class MediaUploadView(generics.CreateAPIView):
    """媒体文件上传视图"""
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request, *args, **kwargs):
        """处理文件上传"""
        file = request.FILES.get('file')
        if not file:
            return Response({'error': '没有提供文件'}, status=status.HTTP_400_BAD_REQUEST)
        
        # 验证文件类型
        allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if file.content_type not in allowed_types:
            return Response({'error': '不支持的文件类型'}, status=status.HTTP_400_BAD_REQUEST)
        
        # 验证文件大小 (10MB)
        if file.size > 10 * 1024 * 1024:
            return Response({'error': '文件大小超过限制'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # 保存文件
            filename = default_storage.save(f'uploads/{file.name}', file)
            file_url = default_storage.url(filename)
            
            # 如果是图片，获取尺寸信息
            file_info = {
                'filename': filename,
                'url': file_url,
                'size': file.size,
                'content_type': file.content_type,
            }
            
            if file.content_type.startswith('image/'):
                try:
                    with Image.open(file) as img:
                        file_info['width'] = img.width
                        file_info['height'] = img.height
                except Exception:
                    pass  # 如果无法获取图片信息，忽略错误
            
            return Response(file_info, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({'error': '文件上传失败'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)