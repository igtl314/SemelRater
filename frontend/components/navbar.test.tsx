import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Navbar } from './navbar';

// Mock the createSemel action
vi.mock('@/app/actions/semel', () => ({
  createSemel: vi.fn(),
}));

// Mock the SemelContext
vi.mock('@/app/SemelProvider', () => ({
  useSemelContext: () => ({
    refreshSemlor: vi.fn(),
  }),
}));

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Create Semla button', () => {
    render(<Navbar />);
    
    expect(screen.getByRole('button', { name: /create semla/i })).toBeInTheDocument();
  });

  it('opens SemelCreatorModal when Create Semla button is clicked', async () => {
    const user = userEvent.setup();
    
    render(<Navbar />);
    
    const createButton = screen.getByRole('button', { name: /create semla/i });
    await user.click(createButton);

    // Modal should be open with the form
    expect(screen.getByText(/create new semla/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/bakery/i)).toBeInTheDocument();
  });
});
