# Plan: Multi-image S3 Upload for Semla

## TL;DR
Add a `SemlaImage` model with FK to `Semla` storing a UUID identifier and S3 URL. Images are uploaded to S3 with UUID filenames. If any image upload fails, the Semla is still created without that image (graceful degradation). Migrate existing `Semla.picture` values into the new table.

## Key Changes from Original Plan

1. **UUID-based naming**: Each image gets a UUID that serves as both the S3 filename and the identifier in `SemlaImage`
2. **Graceful failure**: Failed S3 uploads don't block Semla creation - the Semla is created, failed images are skipped
3. **S3 storage**: All images uploaded to S3 bucket instead of local storage

## Steps

### 1. Create SemlaImage Model
Add to `models.py`:
- `id`: UUID primary key (used as S3 filename)
- `semla`: FK to Semla
- `image_url`: Full S3 URL string
- `created_at`: Timestamp

### 2. Migration
- Create `SemlaImage` table
- Migrate existing `Semla.picture` values:
  - Generate UUID for each existing picture
  - Create `SemlaImage` row with existing URL
- Deprecate `Semla.picture` field (keep for rollback safety, clear in future migration)

### 3. Update Serializers (`serializers.py`)
- `SemlaImageSerializer`: Serialize id (UUID) and image_url
- `SemlaSerializer`: Add `images` list field
- `CreateSemlaSerializer`: Accept `pictures[]` files, validate type/size per file

### 4. S3 Upload Utility (`utils.py`)
Create upload function:
```python
def upload_image_to_s3(file) -> tuple[UUID, str] | None:
    """
    Upload image to S3 with UUID filename.
    Returns (uuid, url) on success, None on failure.
    """
    image_uuid = uuid.uuid4()
    s3_key = f"semlor/{image_uuid}.{extension}"
    # Upload to S3
    # Return (image_uuid, full_url) or None if failed
```

### 5. Update CreateSemlaView (`views.py`)
Handle `pictures[]` multipart files:
```python
def create(request):
    # Validate and create Semla first
    semla = Semla.objects.create(...)
    
    # Process each image - failures don't stop creation
    for file in request.FILES.getlist('pictures'):
        result = upload_image_to_s3(file)
        if result:
            image_uuid, url = result
            SemlaImage.objects.create(
                id=image_uuid,
                semla=semla,
                image_url=url
            )
        # If upload fails, log warning but continue
    
    return Response(SemlaSerializer(semla).data)
```

### 6. Update Tests (`tests.py`)
- Test successful multi-file upload creates `SemlaImage` rows with UUIDs
- Test failed S3 upload still creates Semla (mock S3 failure)
- Test partial failure (some images succeed, some fail)
- Test migration of legacy `picture` data
- Test UUID is used as S3 filename

## Data Flow

```
Client uploads pictures[] 
    ↓
Validate files (type/size)
    ↓
Create Semla record
    ↓
For each valid file:
    ├─ Generate UUID
    ├─ Upload to S3 as {uuid}.{ext}
    ├─ Success? Create SemlaImage(id=uuid, url=s3_url)
    └─ Failure? Log warning, skip image
    ↓
Return Semla with images list
```

## SemlaImage Model Schema

| Field      | Type      | Description                          |
|------------|-----------|--------------------------------------|
| id         | UUID (PK) | Also used as S3 filename             |
| semla      | FK        | Reference to parent Semla            |
| image_url  | String    | Full S3 URL                          |
| created_at | DateTime  | Upload timestamp (ordering)          |

## API Response Shape

```json
{
  "id": 1,
  "name": "Bakery Semla",
  "images": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "image_url": "https://bucket.s3.amazonaws.com/semlor/550e8400-e29b-41d4-a716-446655440000.jpg"
    }
  ],
  ...
}
```

## Error Handling

| Scenario | Behavior |
|----------|----------|
| All uploads succeed | Semla created with all images |
| Some uploads fail | Semla created with successful images only |
| All uploads fail | Semla created with no images |
| S3 completely unavailable | Semla created with no images, error logged |

## Verification

1. **pytest**: Test upload success, partial failure, total failure scenarios
2. **Migration check**: Seed Semla with picture, run migrations, verify SemlaImage exists
3. **S3 verification**: Confirm UUID filename matches SemlaImage.id
4. **Graceful degradation**: Mock S3 errors, confirm Semla still created

### 7. Cleanup Old Implementation
- Review all code referencing `Semla.picture`
- Remove deprecated `picture` field usage from serializers and views
- Update any frontend references if needed
- Remove `Semla.picture` field in a final migration

## Decisions

- UUID as both primary key and S3 filename for simplicity
- Graceful degradation: never fail Semla creation due to image issues
- Log failed uploads for debugging but don't expose to client
- Ordering by `created_at` (upload time)
- Keep old `Semla.picture` field temporarily for rollback safety
