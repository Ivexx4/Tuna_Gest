'use client';

import Link from 'next/link';
import { Edit, Trash2, Eye } from 'lucide-react';
import { Member } from '@/types/database';

interface MembersTableProps {
  members: Member[];
  onDelete: (id: number) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export default function MembersTable({
  members,
  onDelete,
  isLoading,
  emptyMessage = 'Nenhum membro encontrado',
}: MembersTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'alumni':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'inactive':
        return 'Inativo';
      case 'alumni':
        return 'Alumni';
      default:
        return status;
    }
  };

  if (members.length === 0) {
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
              Email
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Telefone
            </th>
            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
              Status
            </th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {members.map((member) => (
            <tr
              key={member.id}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-6 py-4 font-medium text-gray-900">
                {member.name}
              </td>
              <td className="px-6 py-4 text-gray-600">
                {member.email || '-'}
              </td>
              <td className="px-6 py-4 text-gray-600">
                {member.phone || '-'}
              </td>
              <td className="px-6 py-4 text-center">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                    member.status
                  )}`}
                >
                  {getStatusLabel(member.status)}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2 justify-end">
                  {/* Ver Perfil */}
                  <Link
                    href={`/members/${member.id}`}
                    className="inline-flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg text-sm transition"
                    title="Ver perfil"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  {/* Editar */}
                  <Link
                    href={`/members/${member.id}/edit`}
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
                          `Tem certeza que quer deletar ${member.name}?`
                        )
                      ) {
                        onDelete(member.id);
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

