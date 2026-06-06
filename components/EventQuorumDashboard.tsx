'use client';

import { useEffect, useState } from 'react';
import { eventService } from '@/lib/services';
import { EventQuorumBySection } from '@/types/database';
import { toast } from 'sonner';

interface EventQuorumDashboardProps {
  eventId: number;
}

export default function EventQuorumDashboard({ eventId }: EventQuorumDashboardProps) {
  const [quorumData, setQuorumData] = useState<EventQuorumBySection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuorumData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await eventService.getQuorumBySections(eventId);
        if (error) throw error;
        setQuorumData(data || []);
      } catch (err: any) {
        console.error('Erro ao carregar dados de quórum:', err);
        setError('Erro ao carregar dados de quórum: ' + err.message);
        toast.error('Erro ao carregar dados de quórum');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuorumData();
  }, [eventId]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Carregando dados de quórum...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p>{error}</p>
      </div>
    );
  }

  if (quorumData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-500">Nenhum dado de quórum disponível para este evento.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Dashboard de Quórum por Seção</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Seção
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Confirmados
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pendentes
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Recusados
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ausentes
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Membros
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {quorumData.map((data) => (
              <tr key={data.section_id || 'no-section'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {data.section_name || 'Sem Seção'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-green-600 font-semibold">
                  {data.confirmed_count}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-yellow-600 font-semibold">
                  {data.pending_count}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-red-600 font-semibold">
                  {data.declined_count}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600 font-semibold">
                  {data.absent_count}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                  {data.total_section_members}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
