import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CommentModal } from './CommentModal';
import { SemelContext } from '@/app/SemelProvider';

// Mock the rateSemel action
vi.mock('@/app/actions/semel', () => ({
  rateSemel: vi.fn().mockResolvedValue({ httpStatus: 200, message: 'Success' }),
}));

const mockSemel = {
  id: 1,
  bakery: 'Test Bakery',
  city: 'Stockholm',
  price: '45.00',
  kind: 'Traditional',
  vegan: false,
  picture: '',
  rating: 0,
  images: [],
};

const mockContext = {
  semels: [mockSemel],
  refreshSemels: vi.fn(),
  loading: false,
  error: null,
};

describe('CommentModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render image upload input', () => {
    render(
      <SemelContext.Provider value={mockContext}>
        <CommentModal 
          semel={mockSemel} 
          isOpen={true} 
          onOpenChange={() => {}} 
        />
      </SemelContext.Provider>
    );

    // Should have an image input field
    const imageInput = screen.getByLabelText(/image/i);
    expect(imageInput).toBeInTheDocument();
    expect(imageInput).toHaveAttribute('type', 'file');
    expect(imageInput).toHaveAttribute('accept', 'image/jpeg,image/png,image/webp');
  });

  it('should show image preview when file is selected', async () => {
    render(
      <SemelContext.Provider value={mockContext}>
        <CommentModal 
          semel={mockSemel} 
          isOpen={true} 
          onOpenChange={() => {}} 
        />
      </SemelContext.Provider>
    );

    const imageInput = screen.getByLabelText(/image/i);
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    // Create a DataTransfer to simulate file selection
    Object.defineProperty(imageInput, 'files', {
      value: [mockFile],
    });
    
    fireEvent.change(imageInput);

    // Should show the file name or preview
    expect(screen.getByText(/test\.jpg/i)).toBeInTheDocument();
  });

  it('should show validation error for invalid file type', async () => {
    render(
      <SemelContext.Provider value={mockContext}>
        <CommentModal 
          semel={mockSemel} 
          isOpen={true} 
          onOpenChange={() => {}} 
        />
      </SemelContext.Provider>
    );

    const imageInput = screen.getByLabelText(/image/i);
    const invalidFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    
    Object.defineProperty(imageInput, 'files', {
      value: [invalidFile],
    });
    
    fireEvent.change(imageInput);

    // Should show validation error
    expect(screen.getByText(/only jpeg, png, and webp/i)).toBeInTheDocument();
  });

  it('should include image in form submission', async () => {
    const { rateSemel } = await import('@/app/actions/semel');
    
    render(
      <SemelContext.Provider value={mockContext}>
        <CommentModal 
          semel={mockSemel} 
          isOpen={true} 
          onOpenChange={() => {}} 
        />
      </SemelContext.Provider>
    );

    // Fill in the form
    const ratingInput = screen.getByLabelText(/rating/i);
    fireEvent.change(ratingInput, { target: { value: '5' } });

    // Add image
    const imageInput = screen.getByLabelText(/image/i);
    const mockFile = new File(['image-bytes'], 'review.jpg', { type: 'image/jpeg' });
    Object.defineProperty(imageInput, 'files', {
      value: [mockFile],
    });
    fireEvent.change(imageInput);

    // Submit form
    const submitButton = screen.getByRole('button', { name: /add review/i });
    fireEvent.click(submitButton);

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(rateSemel).toHaveBeenCalledWith(1, 5, '', expect.any(File));
    });
  });
});
