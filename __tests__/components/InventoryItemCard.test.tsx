import { render, screen } from '@testing-library/react';
import InventoryItemCard from '@/components/InventoryItemCard';
import { InventoryItem } from '@/types/database';

const mockItem: InventoryItem = {
  id: '1',
  name: 'Guitarra Acústica',
  code: 'GUI-001',
  item_type: 'Instrumento',
  status: 'available',
  description: 'Guitarra em bom estado',
  created_at: '2023-01-01',
  updated_at: '2023-01-01',
};

describe('InventoryItemCard Component', () => {
  it('renders item information correctly', () => {
    render(<InventoryItemCard item={mockItem} showLink={false} />);
    
    expect(screen.getByText('Guitarra Acústica')).toBeInTheDocument();
    expect(screen.getByText('Código: GUI-001')).toBeInTheDocument();
    expect(screen.getByText('Tipo: Instrumento')).toBeInTheDocument();
    expect(screen.getByText('Disponível')).toBeInTheDocument();
    expect(screen.getByText('Guitarra em bom estado')).toBeInTheDocument();
  });

  it('renders damaged status correctly', () => {
    const damagedItem = { ...mockItem, status: 'damaged' };
    render(<InventoryItemCard item={damagedItem} showLink={false} />);
    
    expect(screen.getByText('Danificado')).toBeInTheDocument();
  });

  it('renders an image if image_url is provided', () => {
    const itemWithImage = { ...mockItem, image_url: 'https://example.com/guitarra.jpg' };
    render(<InventoryItemCard item={itemWithImage} showLink={false} />);
    
    const image = screen.getByAltText('Guitarra Acústica');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/guitarra.jpg');
  });
});
