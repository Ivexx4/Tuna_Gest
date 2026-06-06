'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { eventService } from '@/lib/services';
import { EventFormData } from '@/lib/schemas';
import EventForm from '@/components/EventForm';
import AuthenticatedLayout from '@/app/authenticated-layout';
import { toast } from 'sonner';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function NewEventPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: EventFormData) => {
    setIsLoading(true);
    try {
      const baseUrl = window.location.origin; // Get the base URL dynamically
      // Por enquanto, usa tuna_id = 1 (pode ser feito dinâmico depois)
      await eventService.createEvent({
        tuna_id: 1,
        title: data.title,
        description: data.description || undefined,
        event_type: data.event_type,
        location: data.location || undefined,
        event_date: data.event_date,
        duration_minutes: data.duration_minutes || undefined,
        required_sections: data.required_sections || [], // Pass required_sections
        expected_quorum: data.expected_quorum || undefined, // Pass expected_quorum
      }, baseUrl); // Pass baseUrl to createEvent

      toast.success(`${data.title} foi criado com sucesso!`);
      router.push('/events');
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      toast.error('Erro ao criar evento');
    } finally {
      setIsLoading(false);
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

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            ➕ Criar Novo Evento
          </h1>
          <p className="text-gray-600 mt-2">
            Adicione um novo evento à sua tuna preenchendo o formulário abaixo
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow p-8">
          <EventForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            onCancel={() => router.push('/events')}
          />
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">💡 Dicas</h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li>✓ Título e Data são obrigatórios</li>
            <li>✓ Tipo de Evento deve ser selecionado</li>
            <li>✓ Local e Descrição são opcionais</li>
            <li>✓ Seções Obrigatórias e Quórum Esperado são opcionais</li>
          </ul>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
