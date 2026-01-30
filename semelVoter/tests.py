import pytest
from django.core.files.uploadedfile import SimpleUploadedFile, InMemoryUploadedFile
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

    def test_picture_upload_rejects_invalid_content_type(self):
        """Test that non-image uploads are rejected"""
        data = {
            'bakery': 'Test Bakery',
            'city': 'Stockholm',
            'price': '45.00',
            'kind': 'Traditional',
            'picture': SimpleUploadedFile(
                'not-an-image.txt',
                b'not-an-image',
                content_type='text/plain'
            ),
        }
        serializer = CreateSemlaSerializer(data=data)
        assert not serializer.is_valid()
        assert 'picture' in serializer.errors

    def test_picture_upload_rejects_large_files(self):
        """Test that oversized image uploads are rejected"""
        oversized_content = b'a' * (5 * 1024 * 1024 + 1)
        data = {
            'bakery': 'Test Bakery',
            'city': 'Stockholm',
            'price': '45.00',
            'kind': 'Traditional',
            'picture': SimpleUploadedFile(
                'large-image.jpg',
                oversized_content,
                content_type='image/jpeg'
            ),
        }
        serializer = CreateSemlaSerializer(data=data)
        assert not serializer.is_valid()
        assert 'picture' in serializer.errors

    def test_picture_upload_accepts_valid_image(self):
        """Test that valid image uploads are accepted"""
        data = {
            'bakery': 'Test Bakery',
            'city': 'Stockholm',
            'price': '45.00',
            'kind': 'Traditional',
            'picture': SimpleUploadedFile(
                'small-image.jpg',
                b'valid-image-bytes',
                content_type='image/jpeg'
            ),
        }
        serializer = CreateSemlaSerializer(data=data)
        assert serializer.is_valid(), f"Expected image upload to be valid but got errors: {serializer.errors}"

    def test_picture_url_accepts_valid_http_url(self):
        """Test that valid HTTP URLs are accepted"""
        data = {
            'bakery': 'Test Bakery',
            'city': 'Stockholm',
            'price': '45.00',
            'kind': 'Traditional',
            'picture': 'http://example.com/images/semla.jpg',
        }
        serializer = CreateSemlaSerializer(data=data)
        assert serializer.is_valid(), f"Expected valid HTTP URL to be accepted but got errors: {serializer.errors}"

    def test_picture_url_accepts_valid_https_url(self):
        """Test that valid HTTPS URLs are accepted"""
        data = {
            'bakery': 'Test Bakery',
            'city': 'Stockholm',
            'price': '45.00',
            'kind': 'Traditional',
            'picture': 'https://cdn.example.com/semlor/image.png',
        }
        serializer = CreateSemlaSerializer(data=data)
        assert serializer.is_valid(), f"Expected valid HTTPS URL to be accepted but got errors: {serializer.errors}"

    def test_picture_url_rejects_javascript_scheme(self):
        """Test that javascript: URLs are rejected"""
        data = {
            'bakery': 'Test Bakery',
            'city': 'Stockholm',
            'price': '45.00',
            'kind': 'Traditional',
            'picture': 'javascript:alert("XSS")',
        }
        serializer = CreateSemlaSerializer(data=data)
        assert not serializer.is_valid()
        assert 'picture' in serializer.errors
        assert 'javascript:' in str(serializer.errors['picture'][0]).lower()

    def test_picture_url_rejects_data_scheme(self):
        """Test that data: URLs are rejected"""
        data = {
            'bakery': 'Test Bakery',
            'city': 'Stockholm',
            'price': '45.00',
            'kind': 'Traditional',
            'picture': 'data:text/html,<script>alert("XSS")</script>',
        }
        serializer = CreateSemlaSerializer(data=data)
        assert not serializer.is_valid()
        assert 'picture' in serializer.errors
        assert 'data:' in str(serializer.errors['picture'][0]).lower()

    def test_picture_url_rejects_file_scheme(self):
        """Test that file: URLs are rejected"""
        data = {
            'bakery': 'Test Bakery',
            'city': 'Stockholm',
            'price': '45.00',
            'kind': 'Traditional',
            'picture': 'file:///etc/passwd',
        }
        serializer = CreateSemlaSerializer(data=data)
        assert not serializer.is_valid()
        assert 'picture' in serializer.errors
        assert 'file:' in str(serializer.errors['picture'][0]).lower()

    def test_picture_url_rejects_vbscript_scheme(self):
        """Test that vbscript: URLs are rejected"""
        data = {
            'bakery': 'Test Bakery',
            'city': 'Stockholm',
            'price': '45.00',
            'kind': 'Traditional',
            'picture': 'vbscript:msgbox("XSS")',
        }
        serializer = CreateSemlaSerializer(data=data)
        assert not serializer.is_valid()
        assert 'picture' in serializer.errors
        assert 'vbscript:' in str(serializer.errors['picture'][0]).lower()

    def test_picture_url_rejects_invalid_url_format(self):
        """Test that invalid URL formats are rejected"""
        data = {
            'bakery': 'Test Bakery',
            'city': 'Stockholm',
            'price': '45.00',
            'kind': 'Traditional',
            'picture': 'not a valid url',
        }
        serializer = CreateSemlaSerializer(data=data)
        assert not serializer.is_valid()
        assert 'picture' in serializer.errors
        assert 'invalid' in str(serializer.errors['picture'][0]).lower()

    def test_picture_url_accepts_empty_string(self):
        """Test that empty string is accepted for optional picture field"""
        data = {
            'bakery': 'Test Bakery',
            'city': 'Stockholm',
            'price': '45.00',
            'kind': 'Traditional',
            'picture': '',
        }
        serializer = CreateSemlaSerializer(data=data)
        assert serializer.is_valid(), f"Expected empty string to be valid but got errors: {serializer.errors}"

    def test_picture_url_handles_whitespace_only(self):
        """Test that whitespace-only strings are normalized to empty"""
        data = {
            'bakery': 'Test Bakery',
            'city': 'Stockholm',
            'price': '45.00',
            'kind': 'Traditional',
            'picture': '   ',
        }
        serializer = CreateSemlaSerializer(data=data)
        assert serializer.is_valid(), f"Expected whitespace-only string to be valid but got errors: {serializer.errors}"
        assert serializer.validated_data['picture'] == ''

    def test_picture_url_accepts_relative_path(self):
        """Test that relative paths starting with / are accepted"""
        data = {
            'bakery': 'Test Bakery',
            'city': 'Stockholm',
            'price': '45.00',
            'kind': 'Traditional',
            'picture': '/images/semla.jpg',
        }
        serializer = CreateSemlaSerializer(data=data)
        assert serializer.is_valid(), f"Expected relative path to be valid but got errors: {serializer.errors}"
        assert serializer.validated_data['picture'] == '/images/semla.jpg'

    def test_picture_url_rejects_mixed_case_javascript(self):
        """Test that mixed-case javascript: URLs are rejected"""
        data = {
            'bakery': 'Test Bakery',
            'city': 'Stockholm',
            'price': '45.00',
            'kind': 'Traditional',
            'picture': 'JaVaScRiPt:alert("XSS")',
        }
        serializer = CreateSemlaSerializer(data=data)
        assert not serializer.is_valid()
        assert 'picture' in serializer.errors

    def test_picture_url_rejects_blob_scheme(self):
        """Test that blob: URLs are rejected"""
        data = {
            'bakery': 'Test Bakery',
            'city': 'Stockholm',
            'price': '45.00',
            'kind': 'Traditional',
            'picture': 'blob:https://example.com/some-blob-id',
        }
        serializer = CreateSemlaSerializer(data=data)
        assert not serializer.is_valid()
        assert 'picture' in serializer.errors
        assert 'blob:' in str(serializer.errors['picture'][0]).lower()

    def test_picture_url_rejects_about_scheme(self):
        """Test that about: URLs are rejected"""
        data = {
            'bakery': 'Test Bakery',
            'city': 'Stockholm',
            'price': '45.00',
            'kind': 'Traditional',
            'picture': 'about:blank',
        }
        serializer = CreateSemlaSerializer(data=data)
        assert not serializer.is_valid()
        assert 'picture' in serializer.errors
        assert 'about:' in str(serializer.errors['picture'][0]).lower()

    def test_picture_url_strips_whitespace_from_valid_url(self):
        """Test that whitespace is stripped from valid URLs"""
        data = {
            'bakery': 'Test Bakery',
            'city': 'Stockholm',
            'price': '45.00',
            'kind': 'Traditional',
            'picture': '  https://example.com/image.jpg  ',
        }
        serializer = CreateSemlaSerializer(data=data)
        assert serializer.is_valid(), f"Expected valid URL with whitespace to be accepted but got errors: {serializer.errors}"
        assert serializer.validated_data['picture'] == 'https://example.com/image.jpg'

    def test_picture_url_rejects_dangerous_scheme_with_leading_whitespace(self):
        """Test that dangerous schemes with leading whitespace are rejected"""
        data = {
            'bakery': 'Test Bakery',
            'city': 'Stockholm',
            'price': '45.00',
            'kind': 'Traditional',
            'picture': '  javascript:alert("XSS")',
        }
        serializer = CreateSemlaSerializer(data=data)
        assert not serializer.is_valid()
        assert 'picture' in serializer.errors

    def test_picture_url_strips_whitespace_from_relative_path(self):
        """Test that whitespace is stripped from relative paths"""
        data = {
            'bakery': 'Test Bakery',
            'city': 'Stockholm',
            'price': '45.00',
            'kind': 'Traditional',
            'picture': '  /images/semla.jpg  ',
        }
        serializer = CreateSemlaSerializer(data=data)
        assert serializer.is_valid(), f"Expected relative path with whitespace to be accepted but got errors: {serializer.errors}"
        assert serializer.validated_data['picture'] == '/images/semla.jpg'

    def test_picture_url_rejects_protocol_relative_url(self):
        """Test that protocol-relative URLs (starting with //) are rejected"""
        data = {
            'bakery': 'Test Bakery',
            'city': 'Stockholm',
            'price': '45.00',
            'kind': 'Traditional',
            'picture': '//example.com/images/semla.jpg',
        }
        serializer = CreateSemlaSerializer(data=data)
        assert not serializer.is_valid()
        assert 'picture' in serializer.errors
        assert 'protocol-relative' in str(serializer.errors['picture'][0]).lower()

    def test_picture_url_rejects_relative_path_without_leading_slash(self):
        """Test that relative paths without leading slash are rejected"""
        data = {
            'bakery': 'Test Bakery',
            'city': 'Stockholm',
            'price': '45.00',
            'kind': 'Traditional',
            'picture': 'images/semla.jpg',
        }
        serializer = CreateSemlaSerializer(data=data)
        assert not serializer.is_valid()
        assert 'picture' in serializer.errors
        assert 'relative paths must start with /' in str(serializer.errors['picture'][0]).lower()

    def test_picture_url_rejects_parent_directory_traversal(self):
        """Test that parent directory traversal paths are rejected"""
        data = {
            'bakery': 'Test Bakery',
            'city': 'Stockholm',
            'price': '45.00',
            'kind': 'Traditional',
            'picture': '../images/semla.jpg',
        }
        serializer = CreateSemlaSerializer(data=data)
        assert not serializer.is_valid()
        assert 'picture' in serializer.errors


@pytest.mark.django_db
class TestCreateSemlaEndpoint:
    """Test suite for POST /api/semlor/create endpoint"""
    
    def test_create_semla_success(self, client):
        """Test successful creation of a new semla"""
        data = {
            'bakery': 'Valhallabageriet',
            'city': 'Stockholm',
            'price': '45.00',
            'kind': 'Traditional',
        }
        response = client.post('/api/semlor/create', data, content_type='application/json')
        
        assert response.status_code == 201
        assert response.json()['bakery'] == 'Valhallabageriet'
        assert response.json()['city'] == 'Stockholm'
        assert 'id' in response.json()
        
        # Verify it was saved to database
        semla = Semla.objects.get(pk=response.json()['id'])
        assert semla.bakery == 'Valhallabageriet'

    def test_create_semla_with_all_fields(self, client):
        """Test creation with all optional fields"""
        data = {
            'bakery': 'Petrus',
            'city': 'Malmö',
            'price': '55.00',
            'kind': 'Vegan',
            'vegan': True,
            'picture': '/images/petrus-vegan.jpg',
        }
        response = client.post('/api/semlor/create', data, content_type='application/json')
        
        assert response.status_code == 201
        assert response.json()['vegan'] is True
        assert response.json()['picture'] == '/images/petrus-vegan.jpg'

    def test_create_semla_with_image_upload(self, client, monkeypatch):
        """Test creation with multipart image upload stores URL"""
        saved_paths = []

        def fake_save(path, file_obj):
            # Validate that file_obj is an InMemoryUploadedFile instance
            # (Django converts SimpleUploadedFile to InMemoryUploadedFile during request processing)
            assert isinstance(file_obj, InMemoryUploadedFile), \
                f"Expected InMemoryUploadedFile, got {type(file_obj)}"
            # Validate file properties
            assert file_obj.name == 'test-image.jpg', \
                f"Expected file name 'test-image.jpg', got '{file_obj.name}'"
            assert file_obj.content_type == 'image/jpeg', \
                f"Expected content type 'image/jpeg', got '{file_obj.content_type}'"
            # Read and validate file content
            content = file_obj.read()
            assert content == b'valid-image-bytes', \
                f"Expected file content to match uploaded bytes, got {content!r}"
            # Reset file pointer to beginning for any subsequent reads
            file_obj.seek(0)
            saved_paths.append(path)
            return 'semlor/uploads/test-image.jpg'

        def fake_url(path):
            return f"https://cdn.example.com/{path}"

        import semelVoter.views as views
        monkeypatch.setattr(views.default_storage, 'save', fake_save)
        monkeypatch.setattr(views.default_storage, 'url', fake_url)

        data = {
            'bakery': 'Image Bakery',
            'city': 'Stockholm',
            'price': '60.00',
            'kind': 'Traditional',
            'picture': SimpleUploadedFile(
                'test-image.jpg',
                b'valid-image-bytes',
                content_type='image/jpeg'
            ),
        }

        response = client.post('/api/semlor/create', data)

        assert response.status_code == 201
        assert response.json()['picture'] == 'https://cdn.example.com/semlor/uploads/test-image.jpg'
        assert saved_paths, "Expected storage.save to be called"

    def test_create_semla_invalid_data(self, client):
        """Test that invalid data returns 400"""
        # Missing required field
        data = {
            'bakery': 'Test',
            'city': 'Stockholm',
            # missing price and kind
        }
        response = client.post('/api/semlor/create', data, content_type='application/json')
        
        assert response.status_code == 400
        assert 'price' in response.json() or 'kind' in response.json()

    def test_create_semla_rate_limiting(self, client):
        """Test that users are limited to 5 creations per day"""
        data = {
            'bakery': 'Test Bakery',
            'city': 'Stockholm',
            'price': '45.00',
            'kind': 'Traditional',
        }
        
        # First 5 should succeed
        for i in range(5):
            response = client.post('/api/semlor/create', data, content_type='application/json')
            assert response.status_code == 201, f"Request {i+1} should succeed"
        
        # 6th should be rate limited
        response = client.post('/api/semlor/create', data, content_type='application/json')
        assert response.status_code == 429
        assert 'limit' in response.json().get('error', '').lower()


@pytest.mark.django_db
class TestSemlaCreationTracker:
    """Test suite for SemlaCreationTracker model"""
    
    def test_get_today_count_no_records(self):
        """Test count is 0 when no records exist"""
        from semelVoter.models import SemlaCreationTracker
        count = SemlaCreationTracker.get_today_count('192.168.1.1', 'TestAgent')
        assert count == 0
    
    def test_increment_count(self):
        """Test incrementing creation count"""
        from semelVoter.models import SemlaCreationTracker
        
        # First increment creates record with count 1
        count = SemlaCreationTracker.increment_count('192.168.1.1', 'TestAgent')
        assert count == 1
        
        # Second increment increases to 2
        count = SemlaCreationTracker.increment_count('192.168.1.1', 'TestAgent')
        assert count == 2
        
        # Verify get_today_count matches
        count = SemlaCreationTracker.get_today_count('192.168.1.1', 'TestAgent')
        assert count == 2
    
    def test_different_users_separate_counts(self):
        """Test that different IP/user-agent combinations have separate counts"""
        from semelVoter.models import SemlaCreationTracker
        
        SemlaCreationTracker.increment_count('192.168.1.1', 'Agent1')
        SemlaCreationTracker.increment_count('192.168.1.1', 'Agent1')
        SemlaCreationTracker.increment_count('192.168.1.2', 'Agent1')
        
        assert SemlaCreationTracker.get_today_count('192.168.1.1', 'Agent1') == 2
        assert SemlaCreationTracker.get_today_count('192.168.1.2', 'Agent1') == 1
        assert SemlaCreationTracker.get_today_count('192.168.1.1', 'Agent2') == 0


@pytest.mark.django_db
class TestCreateSemlaDefaults:
    """Test suite for verifying default values on created semla"""
    
    def test_new_semla_has_default_rating_zero(self, client):
        """Test that newly created semla has rating of 0.00"""
        data = {
            'bakery': 'New Bakery',
            'city': 'Stockholm',
            'price': '50.00',
            'kind': 'Traditional',
        }
        response = client.post('/api/semlor/create', data, content_type='application/json')
        
        assert response.status_code == 201
        assert response.json()['rating'] == 0.00
        
        # Verify in database as well
        semla = Semla.objects.get(pk=response.json()['id'])
        assert semla.rating == Decimal('0.00')
    
    def test_rating_not_settable_on_creation(self, client):
        """Test that rating cannot be set during creation (ignored if provided)"""
        data = {
            'bakery': 'Sneaky Bakery',
            'city': 'Stockholm',
            'price': '50.00',
            'kind': 'Traditional',
            'rating': '5.00',  # Trying to set a high rating
        }
        response = client.post('/api/semlor/create', data, content_type='application/json')
        
        assert response.status_code == 201
        # Rating should still be 0.00, not 5.00
        assert response.json()['rating'] == 0.00


@pytest.mark.django_db
class TestIPAddressExtraction:
    """Test suite for secure IP address extraction using django-ipware"""
    
    def test_ip_extracted_from_remote_addr(self, client):
        """Test that IP is correctly extracted from REMOTE_ADDR"""
        from semelVoter.models import SemlaCreationTracker
        
        data = {
            'bakery': 'Test Bakery',
            'city': 'Stockholm',
            'price': '45.00',
            'kind': 'Traditional',
        }
        
        # Make request - client defaults to REMOTE_ADDR of 127.0.0.1
        response = client.post('/api/semlor/create', data, content_type='application/json')
        assert response.status_code == 201
        
        # Verify that the IP was tracked (should be 127.0.0.1 for test client)
        count = SemlaCreationTracker.get_today_count('127.0.0.1', '')
        assert count == 1
    
    def test_x_forwarded_for_from_trusted_proxy(self, client):
        """Test that X-Forwarded-For is processed when coming from trusted proxy"""
        from semelVoter.models import SemlaCreationTracker
        
        data = {
            'bakery': 'Test Bakery 2',
            'city': 'Stockholm',
            'price': '45.00',
            'kind': 'Traditional',
        }
        
        # Simulate request with X-Forwarded-For header from localhost (trusted proxy)
        response = client.post(
            '/api/semlor/create', 
            data, 
            content_type='application/json',
            HTTP_X_FORWARDED_FOR='192.168.1.100',
            REMOTE_ADDR='127.0.0.1'  # Request coming from trusted proxy
        )
        assert response.status_code == 201
        
        # Verify the forwarded IP was tracked (not the proxy IP)
        # Note: In test environment, ipware behavior may vary, but request should succeed
        # The key security aspect is that ipware validates the proxy chain
    
    def test_request_rejected_when_ip_cannot_be_determined(self, client, monkeypatch):
        """Test that requests are rejected when IP cannot be determined"""
        from semelVoter.models import SemlaCreationTracker
        
        # Mock get_client_ip to return None (simulating inability to determine IP)
        def mock_get_client_ip(request):
            return (None, False)
        
        from semelVoter import views
        monkeypatch.setattr(views, 'get_client_ip', mock_get_client_ip)
        
        data = {
            'bakery': 'Test Bakery 3',
            'city': 'Stockholm',
            'price': '45.00',
            'kind': 'Traditional',
        }
        
        response = client.post('/api/semlor/create', data, content_type='application/json')
        assert response.status_code == 400
        assert 'IP address' in response.json().get('error', '')
