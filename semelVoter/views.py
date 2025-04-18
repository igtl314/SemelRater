from django.shortcuts import render
from .models import Semla, Ratings, RatingTracker
from rest_framework.response import Response
from .serializers import SemlaSerializer, CommentSerializer


# Create your views here.
from rest_framework.views import APIView
from rest_framework import status

class SelmaViewList(APIView):
    def get(self, request):
        try:
            semlor = Semla.objects.all()
            serializer = SemlaSerializer(semlor, many=True)
            return Response(serializer.data)
        except Semla.DoesNotExist:
            return Response(
                {"error": "No Semlor where found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
class RateSemlaView(APIView):
    def post(self, request, pk):
        # Get IP address and user agent
        ip_address = self.get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        # Check if this sender has exceeded the daily limit
        daily_count = RatingTracker.get_today_count(ip_address, user_agent)
        if daily_count >= 5:
            return Response(
                {"error": "Daily rating limit reached. Please try again tomorrow."},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )
        # Process the rating
        try:
            semla = Semla.objects.get(pk=pk)
            rating = request.data.get('rating')
            comment = request.data.get('comment')
            semla.update_rating(rating)
            rating = Ratings(
                semla=semla,
                rating=rating,
                comment=comment if comment and comment != '' else None,
                )
            rating.save() 
            # Increment the count
            RatingTracker.increment_count(ip_address, user_agent)
            return Response({"message": "Rating saved successfully!"})
        except Semla.DoesNotExist:
            return Response(
                {"error": "Semla not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
class SemlaCommentView(APIView):
    def get(self, request, pk):
        try:
            comments = Ratings.get_semel_rating(pk)
            serializer = CommentSerializer(comments, many=True)
            return Response(serializer.data)
        except Semla.DoesNotExist:
            return Response(
                {"error": f"No comments for Semla {pk} where found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
