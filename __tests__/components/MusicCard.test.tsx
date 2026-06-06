import { render, screen } from '@testing-library/react';
import MusicCard from '@/components/MusicCard';
import { SheetMusic } from '@/types/database';

const mockMusic: SheetMusic = {
  id: '1',
  title: 'Serenata',
  artist: 'Tuna Académica',
  composer: 'Popular',
  difficulty_level: 'intermediate',
  file_url: 'https://example.com/serenata.pdf',
  created_at: '2023-01-01',
  updated_at: '2023-01-01',
};

describe('MusicCard Component', () => {
  it('renders music information correctly', () => {
    render(<MusicCard music={mockMusic} showLink={false} />);
    
    expect(screen.getByText('Serenata')).toBeInTheDocument();
    expect(screen.getByText('Artista: Tuna Académica')).toBeInTheDocument();
    expect(screen.getByText('Compositor: Popular')).toBeInTheDocument();
    expect(screen.getByText('Intermédio')).toBeInTheDocument();
  });

  it('renders a download link if file_url is provided', () => {
    render(<MusicCard music={mockMusic} showLink={false} />);
    
    const downloadLink = screen.getByText('Baixar Partitura');
    expect(downloadLink).toBeInTheDocument();
    expect(downloadLink).toHaveAttribute('href', mockMusic.file_url);
  });

  it('does not render a download link if file_url is not provided', () => {
    const musicWithoutUrl = { ...mockMusic, file_url: undefined };
    render(<MusicCard music={musicWithoutUrl} showLink={false} />);
    
    const downloadLink = screen.queryByText('Baixar Partitura');
    expect(downloadLink).not.toBeInTheDocument();
  });
});
