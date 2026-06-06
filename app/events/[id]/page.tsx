'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { eventService } from '@/lib/services';
import AuthenticatedLayout from '@/app/authenticated-layout';
import { Event, EventAttendance, Member } from '@/types/database';
import { toast } from 'sonner';
import Link from 'next/link';
import { ChevronLeft, Edit, Trash2 } from 'lucide-react';
import EventAttendanceManager from '@/components/EventAttendanceManager';
import EventQuorumDashboard from '@/components/EventQuorumDashboard';
import { supabase } from '@/lib/supabase'; // Import supabase client

// Extend Event type to include attendances for this page
type EventWithAttendances = Event & {
  attendances: (EventAttendance & { member: Member })[];
};

export default function EventDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = parseInt(params.id as string);

  const [event, setEvent] = useState<EventWithAttendances | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Carregar dados do evento
  const fetchEvent = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await eventService.getEventWithAttendances(eventId);
      if (error) throw error;
      setEvent(data);
    } catch (error) {
      console.error('Erro ao carregar evento:', error);
      toast.error('Erro ao carregar evento');
      router.push('/events');
    } finally {
      setIsLoading(false);
    }
  }, [eventId, router]);

  useEffect(() => {
    fetchEvent();

    // Setup Realtime subscription
    const channel = supabase
      .channel(`event_attendances:${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'event_attendances',
          filter: `event_id=eq.${eventId}`, // Only listen for changes related to this event
        },
        (payload) => {
          console.log('Realtime change received!', payload);
          // Re-fetch event data to get the latest attendances
          fetchEvent();
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchEvent, eventId]);

  const handleDelete = async () => {
    if (
      !confirm(
        `Tem certeza que quer deletar o evento "${event?.title}"? Essa ação é permanente.`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await eventService.deleteEvent(eventId);
      toast.success('Evento deletado com sucesso');
      router.push('/events');
    } catch (error) {
      console.error('Erro ao deletar:', error);
      toast.error('Erro ao deletar evento');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando detalhes do evento...</p>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (!event) {
    return (
      <AuthenticatedLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Evento não encontrado</p>
          <Link href="/events" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
            Voltar para Eventos
          </Link>
        </div>
      </AuthenticatedLayout>
    );
  }

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'rehearsal':
        return 'Ensaio';
      case 'performance':
        return 'Atuação';
      case 'social':
        return 'Social';
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

  return (
    <AuthenticatedLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para Eventos
        </Link>

        {/* Header com Ações */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
            <span
              className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${getEventTypeColor(
                event.event_type
              )}`}
            >
              {getEventTypeLabel(event.event_type)}
            </span>
          </div>

          <div className="flex gap-2">
            <Link
              href={`/events/${eventId}/edit`}
              className="inline-flex items-center gap-2 bg-amber-100 hover:bg-amber-200 text-amber-700 px-4 py-2 rounded-lg font-medium transition"
            >
              <Edit className="w-4 h-4" />
              Editar
            </Link>

            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 bg-red-100 hover:bg-red-200 disabled:bg-gray-200 text-red-700 disabled:text-gray-500 px-4 py-2 rounded-lg font-medium transition"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? 'Deletando...' : 'Deletar'}
            </button>
          </div>
        </div>

        {/* Informações Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card - Data e Hora */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">
              Data e Hora
            </h3>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(event.event_date).toLocaleDateString('pt-PT', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          {/* Card - Local */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">
              Local
            </h3>
            <p className="text-lg font-semibold text-gray-900">
              {event.location || <span className="text-gray-400">-</span>}
            </p>
          </div>

          {/* Card - Duração */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">
              Duração
            </h3>
            <p className="text-lg font-semibold text-gray-900">
              {event.duration_minutes ? `${event.duration_minutes} minutos` : <span className="text-gray-400">-</span>}
            </p>
          </div>

          {/* Card - Criado Por */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">
              Criado Por
            </h3>
            <p className="text-lg font-semibold text-gray-900">
              {event.created_by || <span className="text-gray-400">N/A</span>}
            </p>
          </div>
        </div>

        {/* Descrição */}
        {event.description && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">
              Descrição
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
          </div>
        )}

        {/* Attendance Manager */}
        {event && <EventAttendanceManager event={event} onAttendanceUpdate={fetchEvent} />}

        {/* Quorum Dashboard */}
        {event && <EventQuorumDashboard eventId={event.id} />}

        {/* Datas */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600 space-y-1">
          <p>
            <strong>Criado:</strong>{' '}
            {new Date(event.created_at).toLocaleDateString('pt-PT')}
          </p>
          <p>
            <strong>Última atualização:</strong>{' '}
            {new Date(event.updated_at).toLocaleDateString('pt-PT')}
          </p>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
