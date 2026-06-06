'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFetch } from '@/hooks';
import { eventService } from '@/lib/services';
import { Event, EventAttendance, Member } from '@/types/database';
import AuthenticatedLayout from '@/app/authenticated-layout';
import Link from 'next/link';
import { ChevronLeft, BarChart2 } from 'lucide-react';
import { toast } from 'sonner';

// Extend EventAttendance to include member details for easier display
type EventAttendanceWithMember = EventAttendance & { member: Member };
type EventWithAttendances = Event & { attendances: EventAttendanceWithMember[] };

export default function AbsenteeismReportPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { data: events, loading: eventsLoading, error: eventsError } = useFetch<EventWithAttendances>(
    'events?select=*,attendances:event_attendances(*,member:members(*))'
  );

  const [absenteeismData, setAbsenteeismData] = useState<
    {
      member: Member;
      absentCount: number;
      declinedCount: number;
      totalEvents: number;
      absenteeismRate: string;
    }[]
  >([]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (events && !eventsLoading) {
      const memberStats: {
        [memberId: number]: {
          member: Member;
          absentCount: number;
          declinedCount: number;
          totalEvents: number;
        };
      } = {};

      events.forEach((event) => {
        event.attendances.forEach((attendance) => {
          if (!memberStats[attendance.member_id]) {
            memberStats[attendance.member_id] = {
              member: attendance.member,
              absentCount: 0,
              declinedCount: 0,
              totalEvents: 0,
            };
          }
          memberStats[attendance.member_id].totalEvents++;
          if (attendance.status === 'absent') {
            memberStats[attendance.member_id].absentCount++;
          } else if (attendance.status === 'declined') {
            memberStats[attendance.member_id].declinedCount++;
          }
        });
      });

      const processedData = Object.values(memberStats).map((stats) => {
        const totalAbsent = stats.absentCount + stats.declinedCount;
        const absenteeismRate =
          stats.totalEvents > 0
            ? ((totalAbsent / stats.totalEvents) * 100).toFixed(2)
            : '0.00';
        return { ...stats, absenteeismRate };
      });

      setAbsenteeismData(processedData.sort((a, b) => parseFloat(b.absenteeismRate) - parseFloat(a.absenteeismRate)));
    }
  }, [events, eventsLoading]);

  if (authLoading || eventsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando relatório...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (eventsError) {
    toast.error('Erro ao carregar dados para o relatório de absentismo');
    return (
      <AuthenticatedLayout>
        <div className="text-center py-12 text-red-600">
          <p>Erro ao carregar relatório: {eventsError.message}</p>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para Eventos
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            📊 Relatório de Absentismo
          </h1>
          <p className="text-gray-600 mt-2">
            Visão geral do absentismo dos membros em eventos
          </p>
        </div>

        {/* Report Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {absenteeismData.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Membro
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Eventos Totais
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Ausências
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Declínios
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Taxa de Absentismo
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {absenteeismData.map((data) => (
                  <tr key={data.member.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <Link href={`/members/${data.member.id}`} className="text-blue-600 hover:text-blue-800">
                        {data.member.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {data.totalEvents}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {data.absentCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {data.declinedCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      {data.absenteeismRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <BarChart2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg">Nenhum dado de absentismo disponível.</p>
              <p className="text-sm mt-2">Certifique-se de que existem eventos e presenças registadas.</p>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
