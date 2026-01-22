from django.urls import path
from . import views

urlpatterns = [
    path('upload/', views.MediaUploadView.as_view(), name='media-upload'),
]