from django.urls import path
from .views import SelmaViewList, RateSemlaView, SemlaCommentView

urlpatterns = [
    path('semlor', SelmaViewList.as_view(), name='get_semla_list'),
    path('rate/<int:pk>', RateSemlaView.as_view(), name='rate_semla'),
    path('comments/<int:pk>', SemlaCommentView.as_view(), name='comment_list'),
]