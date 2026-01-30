import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SemelCreatorModal } from './SemelCreatorModal';

// Mock the createSemel action
vi.mock('@/app/actions/semel', () => ({
  createSemel: vi.fn(),
}));

// Mock the SemelContext
const mockRefreshSemels = vi.fn();
vi.mock('@/app/SemelProvider', () => ({
  SemelContext: {
    Provider: ({ children }: { children: React.ReactNode }) => children,
  },
}));

import { createSemel } from '@/app/actions/semel';

describe('SemelCreatorModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(
      <SemelCreatorModal 
        isOpen={true} 
        onOpenChange={() => {}} 
        onSuccess={mockRefreshSemels}
      />
    );

    expect(screen.getByLabelText(/bakery/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/kind/i)).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: /vegan/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/image/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
  });

  it('submits form data successfully', async () => {
    const user = userEvent.setup();
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

    vi.mocked(createSemel).mockResolvedValue({
      success: true,
      data: mockSemel,
    });

    render(
      <SemelCreatorModal 
        isOpen={true} 
        onOpenChange={() => {}} 
        onSuccess={mockRefreshSemels}
      />
    );

    await user.type(screen.getByLabelText(/bakery/i), 'Test Bakery');
    await user.type(screen.getByLabelText(/city/i), 'Stockholm');
    await user.type(screen.getByLabelText(/price/i), '45.00');
    await user.type(screen.getByLabelText(/kind/i), 'Classic');
    
    await user.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(createSemel).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockRefreshSemels).toHaveBeenCalled();
    });
  });

  it('displays validation errors from backend', async () => {
    const user = userEvent.setup();
    
    vi.mocked(createSemel).mockResolvedValue({
      success: false,
      error: 'Validation failed',
      errors: {
        bakery: ['This field is required.'],
      },
    });

    render(
      <SemelCreatorModal 
        isOpen={true} 
        onOpenChange={() => {}} 
        onSuccess={mockRefreshSemels}
      />
    );

    // Fill required fields to allow form submission
    await user.type(screen.getByLabelText(/bakery/i), 'Test');
    await user.type(screen.getByLabelText(/city/i), 'Test');
    await user.type(screen.getByLabelText(/price/i), '10');
    await user.type(screen.getByLabelText(/kind/i), 'Test');
    
    await user.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      const messageEl = screen.getByTestId('form-message');
      expect(messageEl).toHaveTextContent(/validation failed/i);
    });
  });

  it('handles file upload', async () => {
    const user = userEvent.setup();
    
    vi.mocked(createSemel).mockResolvedValue({
      success: true,
      data: {
        id: 1,
        bakery: 'Test',
        city: 'Test',
        price: '10.00',
        kind: 'Classic',
        vegan: false,
        picture: '',
        rating: 0,
      },
    });

    render(
      <SemelCreatorModal 
        isOpen={true} 
        onOpenChange={() => {}} 
        onSuccess={mockRefreshSemels}
      />
    );

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/image/i) as HTMLInputElement;
    
    await user.upload(input, file);

    expect(input.files?.[0]).toBe(file);
    expect(input.files?.length).toBe(1);
  });

  it('displays error when file is too large', async () => {
    const user = userEvent.setup();

    render(
      <SemelCreatorModal 
        isOpen={true} 
        onOpenChange={() => {}} 
        onSuccess={mockRefreshSemels}
      />
    );

    // Create a file larger than 5MB (5 * 1024 * 1024 = 5242880 bytes)
    const largeContent = new Array(6 * 1024 * 1024).fill('a').join('');
    const largeFile = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });
    
    const input = screen.getByLabelText(/image/i) as HTMLInputElement;
    await user.upload(input, largeFile);

    // Should display validation error
    expect(screen.getByText(/file size must be less than 5mb/i)).toBeInTheDocument();
  });

  it('displays error when file type is invalid', async () => {
    render(
      <SemelCreatorModal 
        isOpen={true} 
        onOpenChange={() => {}} 
        onSuccess={mockRefreshSemels}
      />
    );

    // Create a GIF file (not allowed)
    const gifFile = new File(['test'], 'test.gif', { type: 'image/gif' });
    
    const input = screen.getByLabelText(/image/i) as HTMLInputElement;
    
    // Use fireEvent to bypass accept attribute filtering
    fireEvent.change(input, { target: { files: [gifFile] } });

    // Should display validation error
    expect(screen.getByText(/only jpeg, png, and webp images are allowed/i)).toBeInTheDocument();
  });

  it('clears image error when valid file is selected', async () => {
    render(
      <SemelCreatorModal 
        isOpen={true} 
        onOpenChange={() => {}} 
        onSuccess={mockRefreshSemels}
      />
    );

    const input = screen.getByLabelText(/image/i) as HTMLInputElement;

    // First, upload an invalid file using fireEvent  
    const gifFile = new File(['test'], 'test.gif', { type: 'image/gif' });
    fireEvent.change(input, { target: { files: [gifFile] } });

    // Error should be visible
    expect(screen.getByText(/only jpeg, png, and webp images are allowed/i)).toBeInTheDocument();

    // Now upload a valid file
    const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    fireEvent.change(input, { target: { files: [validFile] } });

    // Error should be cleared
    expect(screen.queryByText(/only jpeg, png, and webp images are allowed/i)).not.toBeInTheDocument();
  });
});
