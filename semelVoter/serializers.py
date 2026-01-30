from rest_framework import serializers
from django.core.files.uploadedfile import UploadedFile
from django.core.validators import URLValidator
from django.core.exceptions import ValidationError as DjangoValidationError
from decimal import Decimal
from .models import Semla, Ratings

class SemlaSerializer(serializers.ModelSerializer):
    rating = serializers.DecimalField(max_digits=3, decimal_places=2, coerce_to_string=False)
    class Meta:
        model = Semla
        fields = '__all__'


class PictureField(serializers.Field):
    def to_internal_value(self, data):
        if data in (None, ''):
            return data
        if isinstance(data, str):
            return data
        if isinstance(data, UploadedFile):
            return data
        raise serializers.ValidationError('Invalid file upload.')

    def to_representation(self, value):
        return value


class CreateSemlaSerializer(serializers.ModelSerializer):
    """Serializer for creating new Semla entries"""

    picture = PictureField(required=False, allow_null=True)
    
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
            # Validate URL format and ensure only safe protocols
            if value.strip() == '':
                return ''
            
            # Check for dangerous URL schemes
            dangerous_schemes = ['javascript:', 'data:', 'file:', 'vbscript:']
            value_lower = value.lower().strip()
            for scheme in dangerous_schemes:
                if value_lower.startswith(scheme):
                    raise serializers.ValidationError(
                        f'URL scheme "{scheme}" is not allowed. Only http, https, and relative paths are permitted.'
                    )
            
            # Allow relative paths (starting with /)
            if value.startswith('/'):
                return value
            
            # For absolute URLs, validate format (must be http or https)
            validator = URLValidator(schemes=['http', 'https'])
            try:
                validator(value)
            except DjangoValidationError:
                raise serializers.ValidationError('Invalid URL format. Only valid http or https URLs, or relative paths starting with / are allowed.')
            
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