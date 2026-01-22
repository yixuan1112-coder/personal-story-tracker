from django.urls import path
from . import views

urlpatterns = [
    path('<int:entry_id>/', views.StoryDetailView.as_view(), name='story-detail'),
    path('<int:entry_id>/versions/', views.StoryVersionListView.as_view(), name='story-versions'),
]