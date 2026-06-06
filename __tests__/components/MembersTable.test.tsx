import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MembersTable from '@/components/MembersTable';

const mockMembers = [
  {
    id: 1,
    name: 'João Silva',
    email: 'joao@example.com',
    phone: '912345678',
    status: 'active',
    created_at: '2023-01-01',
    tuna_id: 1,
  },
  {
    id: 2,
    name: 'Maria Santos',
    email: 'maria@example.com',
    phone: null,
    status: 'inactive',
    created_at: '2023-01-01',
    tuna_id: 1,
  },
];

const mockOnDelete = jest.fn();

describe('MembersTable Component', () => {
  beforeEach(() => {
    mockOnDelete.mockClear();
    // Mock the global confirm dialog
    window.confirm = jest.fn(() => true);
  });

  it('renders the empty message when no members are provided', () => {
    render(<MembersTable members={[]} onDelete={mockOnDelete} emptyMessage="Nenhum registo" />);
    expect(screen.getByText('Nenhum registo')).toBeInTheDocument();
  });

  it('renders a table with members', () => {
    render(<MembersTable members={mockMembers as any} onDelete={mockOnDelete} />);
    
    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('joao@example.com')).toBeInTheDocument();
    expect(screen.getByText('Ativo')).toBeInTheDocument();
    
    expect(screen.getByText('Maria Santos')).toBeInTheDocument();
    expect(screen.getByText('Inativo')).toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked and confirmed', async () => {
    render(<MembersTable members={mockMembers as any} onDelete={mockOnDelete} />);
    
    const deleteButtons = screen.getAllByTitle('Deletar');
    await userEvent.click(deleteButtons[0]);
    
    expect(window.confirm).toHaveBeenCalledWith('Tem certeza que quer deletar João Silva?');
    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });

  it('disables delete buttons when isLoading is true', () => {
    render(<MembersTable members={mockMembers as any} onDelete={mockOnDelete} isLoading={true} />);
    
    const deleteButtons = screen.getAllByTitle('Deletar');
    expect(deleteButtons[0]).toBeDisabled();
    expect(deleteButtons[1]).toBeDisabled();
  });
});
