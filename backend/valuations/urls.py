from django.urls import path
from . import views

urlpatterns = [
    path('<int:entry_id>/', views.ValuationDetailView.as_view(), name='valuation-detail'),
    path('<int:entry_id>/calculate/', views.CalculateValuationView.as_view(), name='calculate-valuation'),
    path('<int:entry_id>/history/', views.ValuationHistoryView.as_view(), name='valuation-history'),
    path('rules/', views.DepreciationRuleListView.as_view(), name='depreciation-rules'),
]