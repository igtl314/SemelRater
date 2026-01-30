from rest_framework import serializers
from decimal import Decimal
from .models import Semla, Ratings

class SemlaSerializer(serializers.ModelSerializer):
    rating = serializers.DecimalField(max_digits=3, decimal_places=2, coerce_to_string=False)
    class Meta:
        model = Semla
        fields = '__all__'


class CreateSemlaSerializer(serializers.ModelSerializer):
    """Serializer for creating new Semla entries"""

    picture = serializers.FileField(required=False, allow_null=True)
    
    class Meta:
        model = Semla
        fields = ['bakery', 'city', 'picture', 'vegan', 'price', 'kind']
        extra_kwargs = {
            'bakery': {'required': True},
            'city': {'required': True},
            'price': {'required': True},
            'kind': {'required': True},
            'vegan': {'required': False, 'default': False},
            'picture': {'required': False},
        }

    def validate_picture(self, value):
        if value in (None, ''):
            return value
        if isinstance(value, str):
            return value

        allowed_types = {'image/jpeg', 'image/png', 'image/webp'}
        content_type = getattr(value, 'content_type', None)
        if content_type not in allowed_types:
            raise serializers.ValidationError('Only JPEG, PNG, and WebP images are allowed.')

        max_size = 5 * 1024 * 1024
        if value.size > max_size:
            raise serializers.ValidationError('Image size must be 5MB or less.')

        return value

    def validate_price(self, value):
        """Ensure price is positive"""
        if value <= Decimal('0'):
            raise serializers.ValidationError("Price must be greater than zero.")
        return value


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ratings
        fields = ['comment', "rating", "date"]