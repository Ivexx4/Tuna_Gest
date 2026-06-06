'use client';

import Link from 'next/link';
import { Edit, Trash2, Eye } from 'lucide-react';
import { InstrumentSection } from '@/types/database';

interface SectionsTableProps {
  sections: InstrumentSection[];
  onDelete: (id: number) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export default function SectionsTable({
  sections,
  onDelete,
  isLoading,
  emptyMessage = 'Nenhuma seção encontrada',
}: SectionsTableProps) {
  if (sections.length === 0) {
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
              Nome
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Nome de Exibição
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Cor
            </th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sections.map((section) => (
            <tr
              key={section.id}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-6 py-4 font-medium text-gray-900">
                {section.name}
              </td>
              <td className="px-6 py-4 text-gray-600">
                {section.display_name}
              </td>
              <td className="px-6 py-4 text-gray-600">
                {section.color ? (
                  <span
                    className="inline-block w-6 h-6 rounded-full border border-gray-300"
                    style={{ backgroundColor: section.color }}
                    title={section.color}
                  ></span>
                ) : (
                  '-'
                )}
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2 justify-end">
                  {/* Ver Detalhes */}
                  <Link
                    href={`/settings/sections/${section.id}`}
                    className="inline-flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg text-sm transition"
                    title="Ver detalhes"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  {/* Editar */}
                  <Link
                    href={`/settings/sections/${section.id}/edit`}
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
                          `Tem certeza que quer deletar a seção "${section.display_name}"?`
                        )
                      ) {
                        onDelete(section.id);
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
