'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { eventService } from '@/lib/services';
import { EventFormData } from '@/lib/schemas';
import EventForm from '@/components/EventForm';
import AuthenticatedLayout from '@/app/authenticated-layout';
import { Event } from '@/types/database';
import { toast } from 'sonner';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = parseInt(params.id as string);

  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Carregar dados do evento
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data, error } = await eventService.getEventWithAttendances(eventId);
        if (error) throw error;
        setEvent(data);
      } catch (error) {
        console.error('Erro ao carregar evento:', error);
        toast.error('Erro ao carregar evento');
        router.push('/events');
      } finally {
        setIsFetching(false);
      }
    };

    fetchEvent();
  }, [eventId, router]);

  const handleSubmit = async (data: EventFormData) => {
    setIsLoading(true);
    try {
      await eventService.updateEvent(eventId, {
        title: data.title,
        description: data.description || undefined,
        event_type: data.event_type,
        location: data.location || undefined,
        event_date: data.event_date,
        duration_minutes: data.duration_minutes || undefined,
        required_sections: data.required_sections || [], // Pass required_sections
        expected_quorum: data.expected_quorum || undefined, // Pass expected_quorum
      });

      toast.success(`${data.title} foi atualizado com sucesso!`);
      router.push(`/events/${eventId}`);
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      toast.error('Erro ao atualizar evento');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando dados do evento...</p>
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

  return (
    <AuthenticatedLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <Link
          href={`/events/${eventId}`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para Detalhes do Evento
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            ✏️ Editar Evento
          </h1>
          <p className="text-gray-600 mt-2">
            Atualize as informações de {event.title}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow p-8">
          <EventForm
            initialData={event}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            onCancel={() => router.push(`/events/${eventId}`)}
          />
        </div>

        {/* Última atualização */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
          <p>
            <strong>Última atualização:</strong>{' '}
            {new Date(event.updated_at).toLocaleDateString('pt-PT')}
          </p>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
