import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CategoryForm from '@/components/CategoryForm';
import { FinancialCategory } from '@/types/database';

// Mock the props
const mockOnSubmit = jest.fn();
const mockOnClose = jest.fn();

describe('CategoryForm Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockOnSubmit.mockClear();
    mockOnClose.mockClear();
  });

  it('does not render when isOpen is false', () => {
    render(<CategoryForm isOpen={false} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders in "create" mode when no initialData is provided', () => {
    render(<CategoryForm isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
    
    expect(screen.getByText('Nova Categoria')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Criar Categoria' })).toBeInTheDocument();
  });

  it('renders in "edit" mode when initialData is provided', () => {
    const initialData: FinancialCategory = {
      id: '1',
      name: 'Quota',
      type: 'income',
      description: 'Pagamento mensal',
      created_at: '2023-01-01',
    };
    render(<CategoryForm isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} initialData={initialData} />);
    
    expect(screen.getByText('Editar Categoria')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Quota')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Receita')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Atualizar Categoria' })).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', async () => {
    render(<CategoryForm isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
    
    const closeButton = screen.getByRole('button', { name: /close/i }); // Use a generic name for the close button
    await userEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('shows validation errors for empty required fields', async () => {
    render(<CategoryForm isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: 'Criar Categoria' });
    await userEvent.click(submitButton);
    
    expect(await screen.findByText('Nome é obrigatório')).toBeInTheDocument();
    // The type field has a default, so it won't show an error initially
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with the correct data when form is valid', async () => {
    render(<CategoryForm isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
    
    await userEvent.type(screen.getByPlaceholderText('Ex: Salário, Renda, Material'), 'Venda de Merch');
    await userEvent.selectOptions(screen.getByRole('combobox'), 'income');
    
    const submitButton = screen.getByRole('button', { name: 'Criar Categoria' });
    await userEvent.click(submitButton);
    
    // Wait for the async submit to be called
    await screen.findByText('Nova Categoria'); // Re-assert something to wait for state updates
    
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Venda de Merch',
      type: 'income',
    }));
  });
});
