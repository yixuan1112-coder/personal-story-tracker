from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User


class UserRegistrationSerializer(serializers.ModelSerializer):
    """用户注册序列化器"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('email', 'username', 'password', 'password_confirm', 'display_name')
    
    def validate_email(self, value):
        """验证邮箱格式和唯一性"""
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("该邮箱已被注册")
        return value.lower()
    
    def validate_username(self, value):
        """验证用户名唯一性"""
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("该用户名已被使用")
        return value
    
    def validate_password(self, value):
        """验证密码强度"""
        if len(value) < 8:
            raise serializers.ValidationError("密码长度至少8位")
        if value.isdigit():
            raise serializers.ValidationError("密码不能全为数字")
        if value.isalpha():
            raise serializers.ValidationError("密码必须包含数字")
        return value
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("密码不匹配")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    """用户登录序列化器"""
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError('邮箱或密码错误')
            if not user.is_active:
                raise serializers.ValidationError('用户账户已被禁用')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('必须提供邮箱和密码')
        
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    """用户资料序列化器"""
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'display_name', 'avatar', 
                 'theme', 'default_currency', 'created_at')
        read_only_fields = ('id', 'email', 'created_at')


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """用户资料更新序列化器"""
    class Meta:
        model = User
        fields = ('display_name', 'avatar', 'theme', 'default_currency')
        
    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance