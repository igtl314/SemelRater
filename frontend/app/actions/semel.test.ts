import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSemel, rateSemel } from './semel';

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

describe('rateSemel', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should submit rating without image using JSON', async () => {
    // Arrange
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ message: 'Rating saved successfully!' }),
    });

    // Act
    const result = await rateSemel(1, 4, 'Great semla!');

    // Assert
    expect(result).toEqual({
      httpStatus: 200,
      message: 'Rating saved successfully!',
    });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/rate/1'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comment: 'Great semla!',
          rating: 4,
          name: '',
        }),
      })
    );
  });

  it('should send name field in request body', async () => {
    // Arrange
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ message: 'Rating saved successfully!' }),
    });

    // Act
    await rateSemel(1, 5, 'Great semla!', undefined, 'Erik Svensson');

    // Assert
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/rate/1'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comment: 'Great semla!',
          rating: 5,
          name: 'Erik Svensson',
        }),
      })
    );
  });

  it('should submit rating with image using FormData', async () => {
    // Arrange
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ message: 'Rating saved successfully!' }),
    });

    const mockFile = new File(['image-bytes'], 'review.jpg', { type: 'image/jpeg' });

    // Act
    const result = await rateSemel(1, 5, 'Amazing!', mockFile, 'Erik');

    // Assert
    expect(result).toEqual({
      httpStatus: 200,
      message: 'Rating saved successfully!',
    });
    
    // Verify FormData was used (no Content-Type header - browser sets it with boundary)
    const fetchCall = vi.mocked(global.fetch).mock.calls[0];
    expect(fetchCall[1]?.body).toBeInstanceOf(FormData);
    
    // Verify FormData contents
    const sentFormData = fetchCall[1]?.body as FormData;
    expect(sentFormData.get('rating')).toBe('5');
    expect(sentFormData.get('comment')).toBe('Amazing!');
    expect(sentFormData.get('name')).toBe('Erik');
    expect(sentFormData.get('image')).toBeInstanceOf(File);
  });

  it('should handle rate limit error', async () => {
    // Arrange
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({ error: 'Daily rating limit reached. Please try again tomorrow.' }),
    });

    // Act
    const result = await rateSemel(1, 3, 'Test');

    // Assert
    expect(result).toEqual({
      httpStatus: 429,
      message: 'Daily rating limit reached. Please try again tomorrow.',
    });
  });
});
