from rest_framework import serializers
from .models import Semla, Ratings

class SemlaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Semla
        fields = '__all__'

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ratings
        fields = ['comment', "rating", "date"]