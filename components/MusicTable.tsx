'use client';

import Link from 'next/link';
import { Edit, Trash2, Eye, Download } from 'lucide-react';
import { SheetMusic } from '@/types/database';

interface MusicTableProps {
  sheetMusic: SheetMusic[];
  onDelete: (id: number) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export default function MusicTable({
  sheetMusic,
  onDelete,
  isLoading,
  emptyMessage = 'Nenhuma partitura encontrada',
}: MusicTableProps) {
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

  if (sheetMusic.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto shadow-md rounded-lg">
      <table className="w-full bg-white">
        <thead className="bg-gray-100 border-b-2 border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Título
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Artista
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Compositor
            </th>
            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
              Dificuldade
            </th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sheetMusic.map((music) => (
            <tr
              key={music.id}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-6 py-4 font-medium text-gray-900">
                {music.title}
              </td>
              <td className="px-6 py-4 text-gray-600">
                {music.artist || '-'}
              </td>
              <td className="px-6 py-4 text-gray-600">
                {music.composer || '-'}
              </td>
              <td className="px-6 py-4 text-center">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(
                    music.difficulty_level
                  )}`}
                >
                  {getDifficultyLabel(music.difficulty_level)}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2 justify-end">
                  {music.file_url && (
                    <a
                      href={music.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg text-sm transition"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                  {/* Ver Detalhes */}
                  <Link
                    href={`/music/${music.id}`}
                    className="inline-flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg text-sm transition"
                    title="Ver detalhes"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  {/* Editar */}
                  <Link
                    href={`/music/${music.id}/edit`}
                    className="inline-flex items-center gap-2 bg-amber-100 hover:bg-amber-200 text-amber-700 px-3 py-1 rounded-lg text-sm transition"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>

                  {/* Deletar */}
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          `Tem certeza que quer deletar a partitura "${music.title}"?`
                        )
                      ) {
                        onDelete(music.id);
                      }
                    }}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 bg-red-100 hover:bg-red-200 disabled:bg-gray-200 text-red-700 disabled:text-gray-500 px-3 py-1 rounded-lg text-sm transition"
                    title="Deletar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
