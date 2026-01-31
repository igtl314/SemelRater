import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSemel } from './semel';

describe('createSemel', () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    vi.resetAllMocks();
  });

  it('should create a new semel with image upload', async () => {
    // Arrange
    const mockSemel = {
      id: 1,
      bakery: 'Test Bakery',
      city: 'Stockholm',
      price: '45.00',
      kind: 'Classic',
      vegan: false,
      picture: '',
      rating: 0,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => mockSemel,
    });

    const formData = new FormData();
    formData.append('bakery', 'Test Bakery');
    formData.append('city', 'Stockholm');
    formData.append('price', '45.00');
    formData.append('kind', 'Classic');
    formData.append('vegan', 'false');
    
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    formData.append('pictures', mockFile);

    // Act
    const result = await createSemel(formData);

    // Assert
    expect(result).toEqual({
      success: true,
      data: mockSemel,
    });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/semlor'),
      expect.objectContaining({
        method: 'POST',
        body: formData,
      })
    );
  });

  it('should handle validation errors from backend', async () => {
    // Arrange
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        bakery: ['This field is required.'],
      }),
    });

    const formData = new FormData();
    formData.append('city', 'Stockholm');

    // Act
    const result = await createSemel(formData);

    // Assert
    expect(result).toEqual({
      success: false,
      error: 'Validation failed',
      errors: {
        bakery: ['This field is required.'],
      },
    });
  });

  it('should handle network errors', async () => {
    // Arrange
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const formData = new FormData();
    formData.append('bakery', 'Test Bakery');

    // Act
    const result = await createSemel(formData);

    // Assert
    expect(result).toEqual({
      success: false,
      error: 'Failed to create semel. Please try again.',
    });
  });
});
