import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventForm from '@/components/EventForm';

// Mock the useFetch hook
jest.mock('@/hooks', () => ({
  useFetch: jest.fn(() => ({
    data: [
      { id: '1', display_name: 'Guitarras' },
      { id: '2', display_name: 'Pandeiretas' },
    ],
    isLoading: false,
    error: null,
  })),
}));

// Mock the schemas
jest.mock('@/lib/schemas', () => {
  const { z } = require('zod');
  return {
    eventSchema: z.object({
      title: z.string().min(1, 'Título é obrigatório'),
      event_type: z.string().min(1, 'Tipo é obrigatório'),
      event_date: z.string().min(1, 'Data é obrigatória'),
    }),
  };
});

const mockOnSubmit = jest.fn();
const mockOnCancel = jest.fn();

describe('EventForm Component', () => {
  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
  });

  it('renders the form fields correctly', () => {
    render(<EventForm onSubmit={mockOnSubmit} />);
    
    expect(screen.getByText('Título *')).toBeInTheDocument();
    expect(screen.getByText('Tipo de Evento *')).toBeInTheDocument();
    expect(screen.getByText('Data e Hora do Evento *')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Criar Evento' })).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    render(<EventForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    await userEvent.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('shows validation errors for required fields', async () => {
    render(<EventForm onSubmit={mockOnSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: 'Criar Evento' });
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Título é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('Data é obrigatória')).toBeInTheDocument();
    });
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
