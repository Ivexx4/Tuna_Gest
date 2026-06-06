import { render, screen } from '@testing-library/react';
import MemberCard from '@/components/MemberCard';
import { Member } from '@/types/database';

const mockMember: Member = {
  id: '1',
  name: 'João Silva',
  email: 'joao@example.com',
  phone: '912345678',
  status: 'active',
  joining_date: '2023-01-01',
  bio: 'Membro dedicado',
  created_at: '2023-01-01',
  updated_at: '2023-01-01',
  user_id: 'user1'
};

describe('MemberCard Component', () => {
  it('renders member information correctly', () => {
    render(<MemberCard member={mockMember} showLink={false} />);
    
    // Check if name is rendered
    expect(screen.getByText('João Silva')).toBeInTheDocument();
    
    // Check if email is rendered
    expect(screen.getByText('joao@example.com')).toBeInTheDocument();
    
    // Check if status is rendered and translated to 'Ativo'
    expect(screen.getByText('Ativo')).toBeInTheDocument();
  });

  it('renders alumni status correctly', () => {
    const alumniMember = { ...mockMember, status: 'alumni' };
    render(<MemberCard member={alumniMember} showLink={false} />);
    
    expect(screen.getByText('Alumni')).toBeInTheDocument();
  });
});
