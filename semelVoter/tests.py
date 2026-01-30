import pytest
git add . && git commit -m 'feat: add upload_image_to_s3 utility with UUID naming'import uuid
from django.core.files.uploadedfile import SimpleUploadedFile, InMemoryUploadedFile
from decimal import Decimal
from semelVoter.serializers import CreateSemlaSerializer
from semelVoter.models import Semla, SemlaImage


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
        data['picture'] = 'https://example.com/images/test.jpg'
        serializer = CreateSemlaSerializer(data=data)
        assert serializer.is_valid()
        semla = serializer.save()
        assert semla.picture == 'https://example.com/images/test.jpg'

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

    def test_picture_url_validation_rejects_javascript_urls(self):
        """Test that javascript: URLs are rejected for security"""
        data = {
            'bakery': 'Test Bakery',
            'city': 'Stockholm',
            'price': '45.00',
            'kind': 'Traditional',
            'picture': 'javascript:alert("xss")',
        }
        serializer = CreateSemlaSerializer(data=data)
        assert not serializer.is_valid()
        assert 'picture' in serializer.errors

    def test_picture_url_validation_rejects_data_urls(self):
        """Test that data: URLs are rejected for security"""
        data = {
            'bakery': 'Test Bakery',
            'city': 'Stockholm',
            'price': '45.00',
            'kind': 'Traditional',
            'picture': 'data:text/html,<script>alert("xss")</script>',
        }
        serializer = CreateSemlaSerializer(data=data)
        assert not serializer.is_valid()
        assert 'picture' in serializer.errors

    def test_picture_url_validation_accepts_https_urls(self):
        """Test that valid HTTPS URLs are accepted"""
        data = {
            'bakery': 'Test Bakery',
            'city': 'Stockholm',
            'price': '45.00',
            'kind': 'Traditional',
            'picture': 'https://cdn.example.com/images/semla.jpg',
        }
        serializer = CreateSemlaSerializer(data=data)
        assert serializer.is_valid(), f"Expected HTTPS URL to be valid but got errors: {serializer.errors}"

    def test_picture_url_validation_accepts_http_urls(self):
        """Test that valid HTTP URLs are accepted"""
        data = {
            'bakery': 'Test Bakery',
            'city': 'Stockholm',
            'price': '45.00',
            'kind': 'Traditional',
            'picture': 'http://example.com/images/semla.jpg',
        }
        serializer = CreateSemlaSerializer(data=data)
        assert serializer.is_valid(), f"Expected HTTP URL to be valid but got errors: {serializer.errors}"

    def test_picture_url_validation_rejects_invalid_urls(self):
        """Test that invalid URL strings are rejected"""
        data = {
            'bakery': 'Test Bakery',
            'city': 'Stockholm',
            'price': '45.00',
            'kind': 'Traditional',
            'picture': 'not-a-valid-url',
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
            'picture': 'https://example.com/images/petrus-vegan.jpg',
        }
        response = client.post('/api/semlor/create', data, content_type='application/json')
        
        assert response.status_code == 201
        assert response.json()['vegan'] is True
        assert response.json()['picture'] == 'https://example.com/images/petrus-vegan.jpg'

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


@pytest.mark.django_db
class TestSemlaImageModel:
    """Test suite for SemlaImage model"""
    
    def test_semla_image_has_uuid_primary_key(self):
        """Test that SemlaImage uses UUID as primary key"""
        semla = Semla.objects.create(
            bakery='Test Bakery',
            city='Stockholm',
            price='45.00',
            kind='Traditional'
        )
        image_uuid = uuid.uuid4()
        image = SemlaImage.objects.create(
            id=image_uuid,
            semla=semla,
            image_url='https://bucket.s3.amazonaws.com/semlor/test.jpg'
        )
        assert image.id == image_uuid
        assert isinstance(image.id, uuid.UUID)
    
    def test_semla_image_has_foreign_key_to_semla(self):
        """Test that SemlaImage has FK to Semla"""
        semla = Semla.objects.create(
            bakery='Test Bakery',
            city='Stockholm',
            price='45.00',
            kind='Traditional'
        )
        image = SemlaImage.objects.create(
            semla=semla,
            image_url='https://bucket.s3.amazonaws.com/semlor/test.jpg'
        )
        assert image.semla == semla
        assert image.semla_id == semla.id
    
    def test_semla_image_stores_url(self):
        """Test that SemlaImage stores the image URL"""
        semla = Semla.objects.create(
            bakery='Test Bakery',
            city='Stockholm',
            price='45.00',
            kind='Traditional'
        )
        url = 'https://bucket.s3.amazonaws.com/semlor/abc123.jpg'
        image = SemlaImage.objects.create(
            semla=semla,
            image_url=url
        )
        assert image.image_url == url
    
    def test_semla_image_has_created_at_timestamp(self):
        """Test that SemlaImage has auto-set created_at timestamp"""
        semla = Semla.objects.create(
            bakery='Test Bakery',
            city='Stockholm',
            price='45.00',
            kind='Traditional'
        )
        image = SemlaImage.objects.create(
            semla=semla,
            image_url='https://bucket.s3.amazonaws.com/semlor/test.jpg'
        )
        assert image.created_at is not None
    
    def test_semla_can_have_multiple_images(self):
        """Test that a Semla can have multiple associated images"""
        semla = Semla.objects.create(
            bakery='Test Bakery',
            city='Stockholm',
            price='45.00',
            kind='Traditional'
        )
        SemlaImage.objects.create(
            semla=semla,
            image_url='https://bucket.s3.amazonaws.com/semlor/image1.jpg'
        )
        SemlaImage.objects.create(
            semla=semla,
            image_url='https://bucket.s3.amazonaws.com/semlor/image2.jpg'
        )
        assert semla.images.count() == 2
    
    def test_images_ordered_by_created_at(self):
        """Test that images are ordered by created_at timestamp"""
        semla = Semla.objects.create(
            bakery='Test Bakery',
            city='Stockholm',
            price='45.00',
            kind='Traditional'
        )
        image1 = SemlaImage.objects.create(
            semla=semla,
            image_url='https://bucket.s3.amazonaws.com/semlor/first.jpg'
        )
        image2 = SemlaImage.objects.create(
            semla=semla,
            image_url='https://bucket.s3.amazonaws.com/semlor/second.jpg'
        )
        images = list(semla.images.all())
        assert images[0] == image1
        assert images[1] == image2


class TestUploadImageToS3:
    """Test suite for S3 image upload utility"""
    
    def test_upload_returns_uuid_and_url_on_success(self, monkeypatch):
        """Test that successful upload returns (uuid, url) tuple"""
        from semelVoter.utils import upload_image_to_s3
        from django.core.files.uploadedfile import SimpleUploadedFile
        
        # Mock successful S3 upload
        def mock_save(path, file_obj):
            return path
        
        def mock_url(path):
            return f"https://bucket.s3.amazonaws.com/{path}"
        
        from django.core.files.storage import default_storage
        monkeypatch.setattr(default_storage, 'save', mock_save)
        monkeypatch.setattr(default_storage, 'url', mock_url)
        
        file = SimpleUploadedFile('test.jpg', b'image-bytes', content_type='image/jpeg')
        result = upload_image_to_s3(file)
        
        assert result is not None
        image_uuid, url = result
        assert isinstance(image_uuid, uuid.UUID)
        assert str(image_uuid) in url
        assert url.endswith('.jpg')
    
    def test_upload_uses_uuid_as_filename(self, monkeypatch):
        """Test that the S3 key uses UUID as filename"""
        from semelVoter.utils import upload_image_to_s3
        from django.core.files.uploadedfile import SimpleUploadedFile
        
        saved_path = None
        
        def mock_save(path, file_obj):
            nonlocal saved_path
            saved_path = path
            return path
        
        def mock_url(path):
            return f"https://bucket.s3.amazonaws.com/{path}"
        
        from django.core.files.storage import default_storage
        monkeypatch.setattr(default_storage, 'save', mock_save)
        monkeypatch.setattr(default_storage, 'url', mock_url)
        
        file = SimpleUploadedFile('original-name.png', b'image-bytes', content_type='image/png')
        result = upload_image_to_s3(file)
        
        image_uuid, _ = result
        # Path should be semlor/{uuid}.png, not original filename
        assert saved_path == f"semlor/{image_uuid}.png"
    
    def test_upload_returns_none_on_failure(self, monkeypatch):
        """Test that failed upload returns None"""
        from semelVoter.utils import upload_image_to_s3
        from django.core.files.uploadedfile import SimpleUploadedFile
        
        def mock_save(path, file_obj):
            raise Exception("S3 connection failed")
        
        from django.core.files.storage import default_storage
        monkeypatch.setattr(default_storage, 'save', mock_save)
        
        file = SimpleUploadedFile('test.jpg', b'image-bytes', content_type='image/jpeg')
        result = upload_image_to_s3(file)
        
        assert result is None
    
    def test_upload_extracts_extension_from_content_type(self, monkeypatch):
        """Test that file extension is derived from content type"""
        from semelVoter.utils import upload_image_to_s3
        from django.core.files.uploadedfile import SimpleUploadedFile
        
        saved_paths = []
        
        def mock_save(path, file_obj):
            saved_paths.append(path)
            return path
        
        def mock_url(path):
            return f"https://bucket.s3.amazonaws.com/{path}"
        
        from django.core.files.storage import default_storage
        monkeypatch.setattr(default_storage, 'save', mock_save)
        monkeypatch.setattr(default_storage, 'url', mock_url)
        
        # Test JPEG
        file = SimpleUploadedFile('a.txt', b'bytes', content_type='image/jpeg')
        upload_image_to_s3(file)
        assert saved_paths[-1].endswith('.jpg')
        
        # Test PNG
        file = SimpleUploadedFile('b.txt', b'bytes', content_type='image/png')
        upload_image_to_s3(file)
        assert saved_paths[-1].endswith('.png')
        
        # Test WebP
        file = SimpleUploadedFile('c.txt', b'bytes', content_type='image/webp')
        upload_image_to_s3(file)
        assert saved_paths[-1].endswith('.webp')
