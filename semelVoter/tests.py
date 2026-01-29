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

    def test_price_must_be_positive(self):
        """Test that price must be a positive value"""
        base_data = {
            'bakery': 'Test',
            'city': 'Stockholm',
            'kind': 'Traditional',
        }
        
        # Zero price should be rejected
        data = {**base_data, 'price': '0.00'}
        serializer = CreateSemlaSerializer(data=data)
        assert not serializer.is_valid()
        assert 'price' in serializer.errors
        
        # Negative price should be rejected
        data = {**base_data, 'price': '-10.00'}
        serializer = CreateSemlaSerializer(data=data)
        assert not serializer.is_valid()
        assert 'price' in serializer.errors
        
        # Valid positive price should pass
        data = {**base_data, 'price': '0.01'}
        serializer = CreateSemlaSerializer(data=data)
        assert serializer.is_valid()

    def test_price_format_validation(self):
        """Test that price respects decimal format (max 5 digits, 2 decimals)"""
        base_data = {
            'bakery': 'Test',
            'city': 'Stockholm',
            'kind': 'Traditional',
        }
        
        # Valid prices
        valid_prices = ['0.01', '45.00', '100.50', '999.99']
        for price in valid_prices:
            data = {**base_data, 'price': price}
            serializer = CreateSemlaSerializer(data=data)
            assert serializer.is_valid(), f"Price {price} should be valid but got: {serializer.errors}"
        
        # Price too large (exceeds max digits)
        data = {**base_data, 'price': '10000.00'}
        serializer = CreateSemlaSerializer(data=data)
        assert not serializer.is_valid()
        assert 'price' in serializer.errors
        
        # Invalid format (not a number)
        data = {**base_data, 'price': 'not-a-price'}
        serializer = CreateSemlaSerializer(data=data)
        assert not serializer.is_valid()
        assert 'price' in serializer.errors

    def test_empty_strings_rejected(self):
        """Test that empty strings are rejected for required string fields"""
        base_data = {
            'bakery': 'Test',
            'city': 'Stockholm',
            'price': '45.00',
            'kind': 'Traditional',
        }
        
        # Empty bakery
        data = {**base_data, 'bakery': ''}
        serializer = CreateSemlaSerializer(data=data)
        assert not serializer.is_valid()
        assert 'bakery' in serializer.errors
        
        # Empty city
        data = {**base_data, 'city': ''}
        serializer = CreateSemlaSerializer(data=data)
        assert not serializer.is_valid()
        assert 'city' in serializer.errors
        
        # Empty kind
        data = {**base_data, 'kind': ''}
        serializer = CreateSemlaSerializer(data=data)
        assert not serializer.is_valid()
        assert 'kind' in serializer.errors

    def test_whitespace_only_strings_rejected(self):
        """Test that whitespace-only strings are rejected"""
        base_data = {
            'bakery': 'Test',
            'city': 'Stockholm',
            'price': '45.00',
            'kind': 'Traditional',
        }
        
        # Whitespace-only bakery
        data = {**base_data, 'bakery': '   '}
        serializer = CreateSemlaSerializer(data=data)
        assert not serializer.is_valid()
        assert 'bakery' in serializer.errors
        
        # Whitespace-only city
        data = {**base_data, 'city': '\t\n'}
        serializer = CreateSemlaSerializer(data=data)
        assert not serializer.is_valid()
        assert 'city' in serializer.errors
        
        # Whitespace-only kind
        data = {**base_data, 'kind': '  '}
        serializer = CreateSemlaSerializer(data=data)
        assert not serializer.is_valid()
        assert 'kind' in serializer.errors

    def test_strings_are_trimmed(self):
        """Test that leading/trailing whitespace is trimmed from valid strings"""
        data = {
            'bakery': '  Valhallabageriet  ',
            'city': ' Stockholm ',
            'price': '45.00',
            'kind': ' Traditional ',
        }
        serializer = CreateSemlaSerializer(data=data)
        assert serializer.is_valid()
        semla = serializer.save()
        assert semla.bakery == 'Valhallabageriet'
        assert semla.city == 'Stockholm'
        assert semla.kind == 'Traditional'
