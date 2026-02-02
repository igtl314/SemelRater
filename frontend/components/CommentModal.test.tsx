import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SemelContext } from '@/app/SemelProvider';

// Mock the rateSemel action
vi.mock('@/app/actions/semel', () => ({
  rateSemel: vi.fn().mockResolvedValue({ httpStatus: 200, message: 'Success' }),
}));

import { rateSemel } from '@/app/actions/semel';
import { CreateCommentModal } from './CreateCommentModal';

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

// Helper to fill all category ratings
const fillCategoryRatings = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText(/grädde/i), '5');
  await user.type(screen.getByLabelText(/mandelmassa/i), '4');
  await user.type(screen.getByLabelText(/lock/i), '3');
  await user.type(screen.getByLabelText(/bulle/i), '4');
  await user.type(screen.getByLabelText(/helhet/i), '5');
};

describe('CommentModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all 5 category rating inputs', () => {
    render(
      <SemelContext.Provider value={mockContext}>
        <CreateCommentModal 
          semel={mockSemel} 
          isOpen={true} 
          onOpenChange={() => {}} 
        />
      </SemelContext.Provider>
    );

    expect(screen.getByLabelText(/grädde/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mandelmassa/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/lock/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/bulle/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/helhet/i)).toBeInTheDocument();
  });

  it('should render image upload input', () => {
    render(
      <SemelContext.Provider value={mockContext}>
        <CreateCommentModal 
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
        <CreateCommentModal 
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
        <CreateCommentModal 
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

  it('should include image and category ratings in form submission', async () => {
    const user = userEvent.setup();
    
    render(
      <SemelContext.Provider value={mockContext}>
        <CreateCommentModal 
          semel={mockSemel} 
          isOpen={true} 
          onOpenChange={() => {}} 
        />
      </SemelContext.Provider>
    );

    // Fill in category ratings
    await fillCategoryRatings(user);

    // Add image
    const imageInput = screen.getByLabelText(/image/i);
    const mockFile = new File(['image-bytes'], 'review.jpg', { type: 'image/jpeg' });
    Object.defineProperty(imageInput, 'files', {
      value: [mockFile],
    });
    fireEvent.change(imageInput);

    // Submit form
    const submitButton = screen.getByRole('button', { name: /add review/i });
    await user.click(submitButton);

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(rateSemel).toHaveBeenCalledWith(
        1,
        { gradde: 5, mandelmassa: 4, lock: 3, helhet: 5, bulle: 4 },
        '',
        expect.any(File),
        ''
      );
    });
  });

  it('renders name input field', () => {
    render(
      <SemelContext.Provider value={mockContext}>
        <CreateCommentModal
          isOpen={true}
          semel={mockSemel}
          onOpenChange={() => {}}
        />
      </SemelContext.Provider>
    );

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
  });

  it('includes name and category ratings in form submission', async () => {
    const user = userEvent.setup();
    
    vi.mocked(rateSemel).mockResolvedValue({
      httpStatus: 200,
      message: 'Rating saved successfully!',
    });

    render(
      <SemelContext.Provider value={mockContext}>
        <CreateCommentModal
          isOpen={true}
          semel={mockSemel}
          onOpenChange={() => {}}
        />
      </SemelContext.Provider>
    );

    await fillCategoryRatings(user);
    await user.type(screen.getByLabelText(/comment/i), 'Great semla!');
    await user.type(screen.getByLabelText(/name/i), 'Erik Svensson');
    
    await user.click(screen.getByRole('button', { name: /add review/i }));

    await waitFor(() => {
      expect(rateSemel).toHaveBeenCalledWith(
        1,
        { gradde: 5, mandelmassa: 4, lock: 3, helhet: 5, bulle: 4 },
        'Great semla!',
        undefined,
        'Erik Svensson'
      );
    });
  });

  it('submits with empty name when not provided', async () => {
    const user = userEvent.setup();
    
    vi.mocked(rateSemel).mockResolvedValue({
      httpStatus: 200,
      message: 'Rating saved successfully!',
    });

    render(
      <SemelContext.Provider value={mockContext}>
        <CreateCommentModal
          isOpen={true}
          semel={mockSemel}
          onOpenChange={() => {}}
        />
      </SemelContext.Provider>
    );

    await fillCategoryRatings(user);
    await user.type(screen.getByLabelText(/comment/i), 'Nice!');
    
    await user.click(screen.getByRole('button', { name: /add review/i }));

    await waitFor(() => {
      expect(rateSemel).toHaveBeenCalledWith(
        1,
        { gradde: 5, mandelmassa: 4, lock: 3, helhet: 5, bulle: 4 },
        'Nice!',
        undefined,
        ''
      );
    });
  });
});

