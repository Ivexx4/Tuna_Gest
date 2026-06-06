'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFetch, useDelete } from '@/hooks';
import { eventService } from '@/lib/services';
import { Event, EventQuorumBySection } from '@/types/database'; // Import EventQuorumBySection
import AuthenticatedLayout from '@/app/authenticated-layout';
import EventsTable from '@/components/EventsTable';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

// Define a type for Event with Quorum Summary
type EventWithQuorumSummary = Event & {
  quorumSummary?: {
    confirmed: number;
    totalExpected: number;
  };
};

export default function EventsPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { data: events, loading, error, refetch } = useFetch<Event>(
    'events'
  );
  // Assuming tunaId is 1 for now, similar to other services
  const { data: quorumSummaries, loading: quorumLoading } = useFetch<EventQuorumBySection>(
    'event_quorum_by_section'
  );
  const { execute: deleteEvent, loading: deleteLoading } = useDelete('events');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventType, setSelectedEventType] = useState<string>('');
  const [filteredEvents, setFilteredEvents] = useState<EventWithQuorumSummary[]>([]);

  // Redireciona se não autenticado
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Combine events with quorum summaries and apply filters
  useEffect(() => {
    if (!events || quorumLoading) return;

    const eventsWithQuorum: EventWithQuorumSummary[] = events.map((event) => {
      const eventQuorumData = quorumSummaries?.filter(
        (summary) => summary.event_id === event.id
      );

      let confirmed = 0;
      let totalExpected = 0;

      if (eventQuorumData && eventQuorumData.length > 0) {
        confirmed = eventQuorumData.reduce((sum, qs) => sum + qs.confirmed_count, 0);
        // This is a simplified totalExpected, ideally it should come from event.expected_quorum
        // or a more complex calculation based on required_sections and total_section_members
        totalExpected = event.expected_quorum || 0; // Use expected_quorum from event
      }

      return {
        ...event,
        quorumSummary: {
          confirmed,
          totalExpected,
        },
      };
    });

    let currentFilteredEvents = eventsWithQuorum;

    // Filter by search term
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      currentFilteredEvents = currentFilteredEvents.filter(
        (event) =>
          event.title.toLowerCase().includes(term) ||
          event.location?.toLowerCase().includes(term) ||
          event.description?.toLowerCase().includes(term)
      );
    }

    // Filter by event type
    if (selectedEventType !== '') {
      currentFilteredEvents = currentFilteredEvents.filter(
        (event) => event.event_type === selectedEventType
      );
    }

    setFilteredEvents(currentFilteredEvents);
  }, [searchTerm, events, selectedEventType, quorumSummaries, quorumLoading]);

  const handleDelete = async (id: number) => {
    try {
      await deleteEvent(id);
      toast.success('Evento deletado com sucesso!');
      refetch();
    } catch (err) {
      toast.error('Erro ao deletar evento');
      console.error(err);
    }
  };

  if (authLoading || loading || quorumLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const now = new Date();
  const upcomingEvents = events?.filter(event => new Date(event.event_date) >= now) || [];
  const pastEvents = events?.filter(event => new Date(event.event_date) < now) || [];

  const eventTypes = [
    { value: 'rehearsal', label: 'Ensaio' },
    { value: 'performance', label: 'Atuação' },
    { value: 'social', label: 'Social' },
    { value: 'meeting', label: 'Reunião' },
  ];

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🗓️ Eventos</h1>
            <p className="text-gray-600 mt-1">
              Gerencie todos os eventos da tuna
            </p>
          </div>
          <Link
            href="/events/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            <Plus className="w-5 h-5" />
            Novo Evento
          </Link>
        </div>

        {/* Barra de Pesquisa e Filtros */}
        <div className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex items-center gap-3 bg-gray-100 rounded-lg px-4">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Pesquisa por título, local ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent py-2 outline-none"
            />
          </div>

          {/* Filter by Event Type */}
          <select
            value={selectedEventType}
            onChange={(e) => setSelectedEventType(e.target.value)}
            className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          >
            <option value="">Todos os Tipos</option>
            {eventTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Info Card */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            Erro ao carregar eventos: {error.message}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Total de Eventos</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {events?.length || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Próximos Eventos</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {upcomingEvents.length}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Eventos Passados</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {pastEvents.length}
            </p>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-lg shadow">
          {loading || quorumLoading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
              <p>Carregando eventos...</p>
            </div>
          ) : (
            <EventsTable
              events={filteredEvents}
              onDelete={handleDelete}
              isLoading={deleteLoading}
              emptyMessage={
                searchTerm || selectedEventType
                  ? 'Nenhum evento encontrado com os filtros aplicados'
                  : 'Nenhum evento registado ainda. Começa por criar um!'
              }
            />
          )}
        </div>

        {/* Info Box */}
        {events?.length === 0 && !loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <h3 className="font-semibold text-blue-900 mb-2">
              Começa a adicionar eventos
            </h3>
            <p className="text-blue-700 mb-4">
              Clica no botão acima para criar o primeiro evento da tua tuna
            </p>
            <Link
              href="/events/new"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              Criar Primeiro Evento
            </Link>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
