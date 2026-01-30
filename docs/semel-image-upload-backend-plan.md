Plan: Backend image upload (S3)
TL;DR: Implement multipart upload support on the existing create endpoint, storing files in S3 via django-storages, validating type/size, and saving the resulting URL into the existing Semla.picture string field. This aligns with the plan’s S3 decision, keeps the current unauthenticated flow, and avoids a model migration.

Steps

Add S3 storage configuration and media settings in settings.py, driven by environment variables, and include django-storages in dependencies via requirements.txt. Configure default file storage and public media URL.
Update CreateSemlaSerializer to accept an uploaded file, validate MIME type and size (JPEG/PNG/WebP, max 5MB), and handle either a file or existing URL, in serializers.py.
Update CreateSemlaView to support multipart requests, save the uploaded file to storage, and write the resulting URL into Semla.picture, in views.py. Keep rate-limiting behavior intact.
Confirm API route behavior remains under /api/semlor/create in the project’s urls.py. No model migration required since Semla.picture remains a string.
Verification

Run backend tests (pytest) and add/extend tests for upload validation and storage URL assignment.
Manually POST multipart form data with an image to /api/semlor/create and confirm S3 object creation and picture URL response.
Verify 5MB limit and MIME-type rejection responses.
Decisions

Use S3-compatible storage via django-storages.
Keep the existing Semla.picture string field; store the uploaded file’s URL there.
Enforce 5MB and JPEG/PNG/WebP validation.
Keep endpoint unauthenticated for now.
GPT-5.2-Codex • 1x
