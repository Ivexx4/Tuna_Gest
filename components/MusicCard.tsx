import Link from 'next/link';
import { SheetMusic } from '@/types/database';
import { Music, User, Edit, Download } from 'lucide-react';

interface MusicCardProps {
  music: SheetMusic;
  showLink?: boolean;
}

export default function MusicCard({ music, showLink = true }: MusicCardProps) {
  const getDifficultyLabel = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'Iniciante';
      case 'intermediate':
        return 'Intermédio';
      case 'advanced':
        return 'Avançado';
      default:
        return '-';
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const content = (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Music className="w-5 h-5" /> {music.title}
        </h3>
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(
            music.difficulty_level
          )}`}
        >
          {getDifficultyLabel(music.difficulty_level)}
        </span>
      </div>

      {music.artist && (
        <p className="text-gray-700 flex items-center gap-2">
          <User className="w-4 h-4 text-gray-500" /> Artista: {music.artist}
        </p>
      )}
      {music.composer && (
        <p className="text-gray-700 flex items-center gap-2">
          <Edit className="w-4 h-4 text-gray-500" /> Compositor: {music.composer}
        </p>
      )}
      {music.file_url && (
        <a
          href={music.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline flex items-center gap-2 mt-auto pt-2"
        >
          <Download className="w-4 h-4" />
          Baixar Partitura
        </a>
      )}
    </div>
  );

  return showLink ? (
    <Link href={`/music/${music.id}`} className="block hover:shadow-lg transition-shadow">
      {content}
    </Link>
  ) : (
    content
  );
}
