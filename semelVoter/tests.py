import pytest
from decimal import Decimal
from semelVoter.serializers import CreateSemlaSerializer
from semelVoter.models import Semla


@pytest.mark.django_db
class TestCreateSemlaSerializer:
    """Test suite for CreateSemlaSerializer validation"""
    
    def test_valid_data_passes_validation(self):
        """Test that valid semla data passes serializer validation"""
        valid_data = {
            'bakery': 'Valhallabageriet',
            'city': 'Stockholm',
            'price': '45.00',
            'kind': 'Traditional',
        }
        serializer = CreateSemlaSerializer(data=valid_data)
        assert serializer.is_valid(), f"Serializer should be valid but got errors: {serializer.errors}"
        
    def test_required_fields_validation(self):
        """Test that all required fields are validated"""
        # Missing bakery
        data = {'city': 'Stockholm', 'price': '45.00', 'kind': 'Traditional'}
        serializer = CreateSemlaSerializer(data=data)
        assert not serializer.is_valid()
        assert 'bakery' in serializer.errors
        
        # Missing city
        data = {'bakery': 'Test', 'price': '45.00', 'kind': 'Traditional'}
        serializer = CreateSemlaSerializer(data=data)
        assert not serializer.is_valid()
        assert 'city' in serializer.errors
        
        # Missing price
        data = {'bakery': 'Test', 'city': 'Stockholm', 'kind': 'Traditional'}
        serializer = CreateSemlaSerializer(data=data)
        assert not serializer.is_valid()
        assert 'price' in serializer.errors
        
        # Missing kind
        data = {'bakery': 'Test', 'city': 'Stockholm', 'price': '45.00'}
        serializer = CreateSemlaSerializer(data=data)
        assert not serializer.is_valid()
        assert 'kind' in serializer.errors
        
    def test_optional_fields(self):
        """Test that optional fields work correctly"""
        # Without vegan field (should default to False)
        data = {
            'bakery': 'Test',
            'city': 'Stockholm',
            'price': '45.00',
            'kind': 'Traditional',
        }
        serializer = CreateSemlaSerializer(data=data)
        assert serializer.is_valid()
        semla = serializer.save()
        assert semla.vegan is False
        
        # With vegan=True
        data['vegan'] = True
        serializer = CreateSemlaSerializer(data=data)
        assert serializer.is_valid()
        semla = serializer.save()
        assert semla.vegan is True
        
        # Without picture field (should be optional)
        data = {
            'bakery': 'Test',
            'city': 'Stockholm',
            'price': '45.00',
            'kind': 'Traditional',
        }
        serializer = CreateSemlaSerializer(data=data)
        assert serializer.is_valid()
        semla = serializer.save()
        assert semla.picture == ''
        
        # With picture field
        data['picture'] = '/images/test.jpg'
        serializer = CreateSemlaSerializer(data=data)
        assert serializer.is_valid()
        semla = serializer.save()
        assert semla.picture == '/images/test.jpg'
