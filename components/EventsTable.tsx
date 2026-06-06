'use client';

import Link from 'next/link';
import { Edit, Trash2, Eye } from 'lucide-react';
import { Event } from '@/types/database';

// Define a type for Event with Quorum Summary, matching what's passed from EventsPage
type EventWithQuorumSummary = Event & {
  quorumSummary?: {
    confirmed: number;
    totalExpected: number;
  };
};

interface EventsTableProps {
  events: EventWithQuorumSummary[]; // Use the extended type
  onDelete: (id: number) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export default function EventsTable({
  events,
  onDelete,
  isLoading,
  emptyMessage = 'Nenhum evento encontrado',
}: EventsTableProps) {
  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'rehearsal':
        return 'Ensaio';
      case 'performance':
        return 'Atuação';
      case 'social':
        return 'Reunião Social';
      case 'meeting':
        return 'Reunião';
      default:
        return type;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'rehearsal':
        return 'bg-blue-100 text-blue-800';
      case 'performance':
        return 'bg-purple-100 text-purple-800';
      case 'social':
        return 'bg-green-100 text-green-800';
      case 'meeting':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (events.length === 0) {
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
              Data
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Local
            </th>
            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
              Tipo
            </th>
            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
              Quórum
            </th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {events.map((event) => (
            <tr
              key={event.id}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-6 py-4 font-medium text-gray-900">
                {event.title}
              </td>
              <td className="px-6 py-4 text-gray-600">
                {new Date(event.event_date).toLocaleDateString('pt-PT', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </td>
              <td className="px-6 py-4 text-gray-600">
                {event.location || '-'}
              </td>
              <td className="px-6 py-4 text-center">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getEventTypeColor(
                    event.event_type
                  )}`}
                >
                  {getEventTypeLabel(event.event_type)}
                </span>
              </td>
              <td className="px-6 py-4 text-center text-gray-700">
                {event.quorumSummary ? (
                  <span className="font-semibold">
                    {event.quorumSummary.confirmed} / {event.quorumSummary.totalExpected}
                  </span>
                ) : (
                  '-'
                )}
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2 justify-end">
                  {/* Ver Detalhes */}
                  <Link
                    href={`/events/${event.id}`}
                    className="inline-flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg text-sm transition"
                    title="Ver detalhes"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  {/* Editar */}
                  <Link
                    href={`/events/${event.id}/edit`}
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
                          `Tem certeza que quer deletar o evento "${event.title}"?`
                        )
                      ) {
                        onDelete(event.id);
                      }
                    }}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 bg-red-100 hover:bg-red-200 disabled:bg-gray-200 text-red-700 disabled:text-gray-500 px-3 py-1 rounded-lg text-sm transition"
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
