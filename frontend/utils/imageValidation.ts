/**
 * Maximum allowed file size in bytes (5MB)
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Allowed image MIME types
 */
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Enum for image validation errors
 */
export enum ImageValidationError {
  FileTooLarge = 'FILE_TOO_LARGE',
  InvalidType = 'INVALID_TYPE',
}

/**
 * Result of image validation
 */
type ValidationResult =
  | { valid: true }
  | { valid: false; error: ImageValidationError; message: string };

/**
 * Validates an image file for upload.
 * Checks that the file is under 5MB and is a JPEG, PNG, or WebP image.
 * 
 * @param file - The file to validate
 * @returns ValidationResult indicating whether the file is valid
 */
export function validateImageFile(file: File): ValidationResult {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: ImageValidationError.FileTooLarge,
      message: 'File size must be less than 5MB',
    };
  }

  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: ImageValidationError.InvalidType,
      message: 'Only JPEG, PNG, and WebP images are allowed',
    };
  }

  return { valid: true };
}
