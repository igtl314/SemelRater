from rest_framework import serializers
from decimal import Decimal
from .models import Semla, Ratings, SemlaImage


class SemlaImageSerializer(serializers.ModelSerializer):
    """Serializer for SemlaImage model"""
    id = serializers.UUIDField(read_only=True)
    
    class Meta:
        model = SemlaImage
        fields = ['id', 'image_url']

class SemlaSerializer(serializers.ModelSerializer):
    rating = serializers.DecimalField(max_digits=3, decimal_places=2, coerce_to_string=False)
    images = SemlaImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Semla
        fields = '__all__'


class CreateSemlaSerializer(serializers.ModelSerializer):
    """Serializer for creating new Semla entries"""
    
    class Meta:
        model = Semla
        fields = ['bakery', 'city', 'vegan', 'price', 'kind']
        extra_kwargs = {
            'bakery': {'required': True},
            'city': {'required': True},
            'price': {'required': True},
            'kind': {'required': True},
            'vegan': {'required': False, 'default': False},
        }

    def validate_price(self, value):
        """Ensure price is positive"""
        if value <= Decimal('0'):
            raise serializers.ValidationError("Price must be greater than zero.")
        return value


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ratings
        fields = ['comment', "rating", "date", "name"]