import logging
from django.shortcuts import render
from django.db import transaction
from .models import Semla, Ratings, RatingTracker, SemlaCreationTracker, SemlaImage
from rest_framework.response import Response
from .serializers import SemlaSerializer, CommentSerializer, CreateSemlaSerializer
from ipware import get_client_ip
from .utils import upload_image_to_s3

logger = logging.getLogger(__name__)


# Create your views here.
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.parsers import JSONParser, FormParser, MultiPartParser

class SelmaViewList(APIView):
    def get(self, request):
        """
        Get all Semlor.
        """
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
    parser_classes = [JSONParser, FormParser, MultiPartParser]
    
    CATEGORY_FIELDS = ['gradde', 'mandelmassa', 'lock', 'helhet', 'bulle']
    
    def post(self, request, pk):
        """
        Rate a specific Semla. Optionally include an image.
        Requires 5 category ratings: gradde, mandelmassa, lock, helhet, bulle (all 1-5).
        """
        # Get IP address and user agent - ipware validates X-Forwarded-For against trusted proxies
        client_ip, is_routable = get_client_ip(request)
        if not client_ip:
            # Reject requests where IP cannot be determined to prevent rate limit sharing
            return Response(
                {"error": "Unable to determine client IP address"},
                status=status.HTTP_400_BAD_REQUEST
            )
        ip_address = client_ip
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        # Check if this sender has exceeded the daily limit
        daily_count = RatingTracker.get_today_count(ip_address, user_agent)
        if daily_count >= 5:
            return Response(
                {"error": "Daily rating limit reached. Please try again tomorrow."},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )
        
        # Validate and extract category ratings
        category_ratings = {}
        for field in self.CATEGORY_FIELDS:
            value = request.data.get(field)
            if value is None:
                return Response(
                    {"error": f"Missing required field: {field}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            try:
                value = int(value)
                if value < 1 or value > 5:
                    return Response(
                        {"error": f"Invalid value for {field}: must be between 1 and 5"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                category_ratings[field] = value
            except (ValueError, TypeError):
                return Response(
                    {"error": f"Invalid value for {field}: must be an integer"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Calculate average rating from all 5 categories
        average_rating = sum(category_ratings.values()) / len(category_ratings)
        
        # Process the rating
        try:
            semla = Semla.objects.get(pk=pk)
            comment = request.data.get('comment')
            name = request.data.get('name')
            semla.update_rating(average_rating)
            rating = Ratings(
                semla=semla,
                rating=round(average_rating),
                comment=comment if comment and comment != '' else None,
                name=name if name and name != '' else None,
                gradde=category_ratings['gradde'],
                mandelmassa=category_ratings['mandelmassa'],
                lock=category_ratings['lock'],
                helhet=category_ratings['helhet'],
                bulle=category_ratings['bulle'],
                )
            rating.save()
            
            # Handle optional image upload
            image_file = request.FILES.get('image')
            if image_file:
                result = upload_image_to_s3(image_file)
                if result:
                    image_uuid, url = result
                    try:
                        SemlaImage.objects.create(
                            id=image_uuid,
                            semla=semla,
                            image_url=url
                        )
                    except Exception as e:
                        logger.error(f"Failed to create SemlaImage record for Semla {semla.id}: {e}")
                else:
                    logger.warning(f"Failed to upload review image for Semla {semla.id}")
            
            # Increment the count
            RatingTracker.increment_count(ip_address, user_agent)
            return Response({"message": "Rating saved successfully!"})
        except Semla.DoesNotExist:
            return Response(
                {"error": "Semla not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
class SemlaCommentView(APIView):
    def get(self, request, pk):
        """
        Get all comments for a specific Semla.
        """
        try:
            comments = Ratings.get_semel_rating(pk)
            serializer = CommentSerializer(comments, many=True)
            return Response(serializer.data)
        except Semla.DoesNotExist:
            return Response(
                {"error": f"No comments for Semla {pk} where found"}, 
                status=status.HTTP_404_NOT_FOUND
            )


class CreateSemlaView(APIView):
    parser_classes = [JSONParser, FormParser, MultiPartParser]

    def post(self, request):
        """
        Create a new Semla entry.
        """
        # Get IP address and user agent for rate limiting - ipware validates X-Forwarded-For against trusted proxies
        client_ip, is_routable = get_client_ip(request)
        if not client_ip:
            # Reject requests where IP cannot be determined to prevent rate limit sharing
            return Response(
                {"error": "Unable to determine client IP address"},
                status=status.HTTP_400_BAD_REQUEST
            )
        ip_address = client_ip
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        # Check if this sender has exceeded the daily limit
        daily_count = SemlaCreationTracker.get_today_count(ip_address, user_agent)
        if daily_count >= 5:
            return Response(
                {"error": "Daily creation limit reached. Please try again tomorrow."},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )
        
        serializer = CreateSemlaSerializer(data=request.data)
        if serializer.is_valid():
            # Wrap creation and counter increment in a transaction
            # to ensure atomicity and prevent inconsistent state
            with transaction.atomic():
                semla = serializer.save()
                
                # Handle multiple image uploads via pictures[]
                pictures = request.FILES.getlist('pictures')
                for file in pictures:
                    result = upload_image_to_s3(file)
                    if result:
                        image_uuid, url = result
                        SemlaImage.objects.create(
                            id=image_uuid,
                            semla=semla,
                            image_url=url
                        )
                    else:
                        logger.warning(f"Failed to upload image {file.name} for Semla {semla.id}")
                
                # Increment the creation count
                SemlaCreationTracker.increment_count(ip_address, user_agent)
            return Response(
                SemlaSerializer(semla).data,
                status=status.HTTP_201_CREATED
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
