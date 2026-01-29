from rest_framework import serializers
from .models import Semla, Ratings

class SemlaSerializer(serializers.ModelSerializer):
    rating = serializers.DecimalField(max_digits=3, decimal_places=2, coerce_to_string=False)
    class Meta:
        model = Semla
        fields = '__all__'


class CreateSemlaSerializer(serializers.ModelSerializer):
    """Serializer for creating new Semla entries"""
    
    class Meta:
        model = Semla
        fields = ['bakery', 'city', 'picture', 'vegan', 'price', 'kind']
        extra_kwargs = {
            'bakery': {'required': True},
            'city': {'required': True},
            'price': {'required': True},
            'kind': {'required': True},
            'vegan': {'required': False, 'default': False},
            'picture': {'required': False, 'default': '', 'allow_blank': True},
        }


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ratings
        fields = ['comment', "rating", "date"]