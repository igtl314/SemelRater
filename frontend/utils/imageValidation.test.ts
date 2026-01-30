import { describe, it, expect } from 'vitest';
import { validateImageFile, ImageValidationError } from './imageValidation';

describe('validateImageFile', () => {
  const FIVE_MB = 5 * 1024 * 1024;

  it('accepts valid JPEG file under 5MB', () => {
    const file = new File(['x'.repeat(1000)], 'test.jpg', { type: 'image/jpeg' });
    const result = validateImageFile(file);
    expect(result).toEqual({ valid: true });
  });

  it('accepts valid PNG file under 5MB', () => {
    const file = new File(['x'.repeat(1000)], 'test.png', { type: 'image/png' });
    const result = validateImageFile(file);
    expect(result).toEqual({ valid: true });
  });

  it('accepts valid WebP file under 5MB', () => {
    const file = new File(['x'.repeat(1000)], 'test.webp', { type: 'image/webp' });
    const result = validateImageFile(file);
    expect(result).toEqual({ valid: true });
  });

  it('rejects files larger than 5MB', () => {
    // Create a mock file object with size property
    const largeFile = {
      name: 'large.jpg',
      type: 'image/jpeg',
      size: FIVE_MB + 1,
    } as File;
    
    const result = validateImageFile(largeFile);
    expect(result).toEqual({
      valid: false,
      error: ImageValidationError.FileTooLarge,
      message: 'File size must be less than 5MB',
    });
  });

  it('rejects non-image files', () => {
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const result = validateImageFile(file);
    expect(result).toEqual({
      valid: false,
      error: ImageValidationError.InvalidType,
      message: 'Only JPEG, PNG, and WebP images are allowed',
    });
  });

  it('rejects GIF files', () => {
    const file = new File(['test'], 'test.gif', { type: 'image/gif' });
    const result = validateImageFile(file);
    expect(result).toEqual({
      valid: false,
      error: ImageValidationError.InvalidType,
      message: 'Only JPEG, PNG, and WebP images are allowed',
    });
  });

  it('accepts file exactly at 5MB limit', () => {
    const file = {
      name: 'exact.jpg',
      type: 'image/jpeg',
      size: FIVE_MB,
    } as File;
    
    const result = validateImageFile(file);
    expect(result).toEqual({ valid: true });
  });
});
