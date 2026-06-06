'use client';

import { useState } from 'react';
import { Event, EventAttendance, Member } from '@/types/database';
import { eventService } from '@/lib/services';
import { toast } from 'sonner';

interface EventAttendanceManagerProps {
  event: Event & { attendances: (EventAttendance & { member: Member })[] };
  onAttendanceUpdate: () => void; // Callback to refetch event data
}

export default function EventAttendanceManager({
  event,
  onAttendanceUpdate,
}: EventAttendanceManagerProps) {
  const [loadingStates, setLoadingStates] = useState<{ [key: number]: boolean }>({});

  const handleSetAttendance = async (memberId: number, status: string) => {
    setLoadingStates((prev) => ({ ...prev, [memberId]: true }));
    try {
      await eventService.setAttendance(event.id, memberId, status);
      toast.success(`Presença de ${event.attendances.find(a => a.member_id === memberId)?.member.name} atualizada para ${status}!`);
      onAttendanceUpdate(); // Refetch event data to update UI
    } catch (error) {
      console.error('Erro ao atualizar presença:', error);
      toast.error('Erro ao atualizar presença');
    } finally {
      setLoadingStates((prev) => ({ ...prev, [memberId]: false }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'absent':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'declined':
        return 'Recusado';
      case 'pending':
        return 'Pendente';
      case 'absent':
        return 'Ausente';
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Confirmação de Presenças</h3>

      {event.attendances.length === 0 ? (
        <p className="text-gray-500">Nenhum membro registado para este evento ainda.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Membro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {event.attendances.map((attendance) => (
                <tr key={attendance.member.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {attendance.member.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        attendance.status
                      )}`}
                    >
                      {getStatusLabel(attendance.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleSetAttendance(attendance.member.id, 'confirmed')}
                        disabled={loadingStates[attendance.member.id] || attendance.status === 'confirmed'}
                        className="px-3 py-1 border border-green-300 text-green-700 rounded-md text-xs font-medium hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => handleSetAttendance(attendance.member.id, 'declined')}
                        disabled={loadingStates[attendance.member.id] || attendance.status === 'declined'}
                        className="px-3 py-1 border border-red-300 text-red-700 rounded-md text-xs font-medium hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Recusar
                      </button>
                      <button
                        onClick={() => handleSetAttendance(attendance.member.id, 'absent')}
                        disabled={loadingStates[attendance.member.id] || attendance.status === 'absent'}
                        className="px-3 py-1 border border-gray-300 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Ausente
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
