from django.shortcuts import render
from .models import Semla, Ratings
from rest_framework.response import Response
from .serializers import SemlaSerializer, CommentSerializer
from .utils import updateSemelRating

# Create your views here.
from rest_framework.views import APIView

class SelmaViewList(APIView):
    def get(self,request):
        semlor = Semla.objects.all()
        serializer = SemlaSerializer(semlor, many=True)
        return Response(serializer.data)
class RateSemlaView(APIView):
    def post(self, request, pk):
        semla = Semla.objects.get(pk=pk)
        rating = request.data.get('rating')
        old_ratings = semla.ratings.all()
        updateSemelRating(semla, old_ratings,rating)
        comment = request.data.get('comment')
        rating = Ratings(
            semla=semla,
            rating=rating,
            comment=comment if comment and comment != '' else None,
            )
        rating.save()
        return Response({"message": "Rating saved successfully!"})
    
class SemlaCommentView(APIView):
    def get(self, request, pk):
        semla = Semla.objects.get(pk=pk)
        comments = semla.ratings.all().exclude(comment__isnull=True)
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)
