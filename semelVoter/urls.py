from django.urls import path
from .views import SelmaViewList, RateSemlaView, SemlaCommentView, CreateSemlaView

urlpatterns = [
    path('semlor', SelmaViewList.as_view(), name='get_semla_list'),
    path('semlor/create', CreateSemlaView.as_view(), name='create_semla'),
    path('rate/<int:pk>', RateSemlaView.as_view(), name='rate_semla'),
    path('comments/<int:pk>', SemlaCommentView.as_view(), name='comment_list'),
]