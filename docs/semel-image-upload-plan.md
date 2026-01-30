Plan: User image upload for Semlor
We’ll add authenticated image upload support with S3 storage and a Next.js Semla creation form. This includes backend model/storage changes, new API endpoints for creating Semlor with images, and frontend form + upload flow. Decisions: store images in S3 via django-storages, restrict to authenticated users, and enforce 5MB JPEG/PNG/WebP limits.

Steps

Update backend storage config for S3 (add env-driven settings and django-storages). Modify settings.py to include MEDIA settings, storage backend config, and allowed image constraints; add dependency in requirements.
Change Semla.picture to ImageField (or add new image field and migrate data). Update model and migrations in models.py and new migration in migrations.
Add create-Semla API endpoint with multipart upload handling and auth enforcement. Extend serializer to accept image file and validate size/type in serializers.py; add view in views.py and route in urls.py.
Update image serving paths in the frontend to use the backend-provided URL. Adjust SemelImage.tsx and any Semla shape in index.ts to expect an absolute URL.
Build a Next.js Semla creation form with file input and submit to the new API. Implement action in semel.ts and a page/component under app and/or components that handles multipart upload, shows validation errors, and requires auth.
Verification

Backend: run migrations and hit the create endpoint with a multipart request containing an image; confirm S3 object created and URL returned.
Frontend: submit the form with valid/invalid images, confirm errors for size/type, and verify the new Semla renders with its uploaded image.
Auth: unauthenticated requests should be rejected by the create endpoint.
Decisions

Storage: S3-compatible object storage via django-storages.
Flow: Next.js Semla creation form + image upload.
Auth: authenticated users only.
Constraints: max 5MB, JPEG/PNG/WebP only.