from django.shortcuts import render
from .models import Semla, Ratings
from rest_framework.response import Response
from .serializers import SemlaSerializer 

# Create your views here.
from rest_framework.views import APIView

class SelmaViewList(APIView):
    def get(self,request):
        semlor = Semla.objects.all()
        serializer = SemlaSerializer(semlor, many=True)
        return Response(serializer.data)

        
        
