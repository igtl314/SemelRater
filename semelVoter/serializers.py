from rest_framework import serializers
from .models import Semla, Ratings

class SemlaSerializer(serializers.ModelSerializer):
    rating = serializers.DecimalField(max_digits=3, decimal_places=2, coerce_to_string=False)
    class Meta:
        model = Semla
        fields = '__all__'

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ratings
        fields = ['comment', "rating", "date"]