'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { eventSchema, EventFormData } from '@/lib/schemas';
import { Event, InstrumentSection } from '@/types/database';
import { useFetch } from '@/hooks'; // Import useFetch

interface EventFormProps {
  initialData?: Event;
  onSubmit: (data: EventFormData) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
}

export default function EventForm({
  initialData,
  onSubmit,
  isLoading,
  onCancel,
}: EventFormProps) {
  const { data: sections } = useFetch<InstrumentSection>('sections'); // Fetch sections

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      event_type: initialData?.event_type || 'rehearsal',
      location: initialData?.location || '',
      event_date: initialData?.event_date
        ? new Date(initialData.event_date).toISOString().slice(0, 16)
        : '',
      duration_minutes: initialData?.duration_minutes || undefined,
      required_sections: initialData?.required_sections || [], // Initialize as empty array
      expected_quorum: initialData?.expected_quorum || undefined,
    },
  });

  const handleFormSubmit = async (data: EventFormData) => {
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      console.error('Erro ao submeter:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Título */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Título *
        </label>
        <input
          type="text"
          {...register('title')}
          placeholder="Ex: Ensaio Geral para Festival"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
            errors.title
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 bg-white'
          }`}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* Descrição */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descrição
        </label>
        <textarea
          {...register('description')}
          placeholder="Detalhes sobre o evento..."
          rows={3}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none ${
            errors.description
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 bg-white'
          }`}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Dois por linha */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tipo de Evento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Evento *
          </label>
          <select
            {...register('event_type')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
              errors.event_type
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 bg-white'
            }`}
          >
            <option value="rehearsal">Ensaio</option>
            <option value="performance">Atuação</option>
            <option value="social">Social</option>
            <option value="meeting">Reunião</option>
          </select>
          {errors.event_type && (
            <p className="mt-1 text-sm text-red-600">
              {errors.event_type.message}
            </p>
          )}
        </div>

        {/* Local */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Local
          </label>
          <input
            type="text"
            {...register('location')}
            placeholder="Ex: Auditório Principal"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
              errors.location
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 bg-white'
            }`}
          />
          {errors.location && (
            <p className="mt-1 text-sm text-red-600">
              {errors.location.message}
            </p>
          )}
        </div>
      </div>

      {/* Data e Hora do Evento */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Data e Hora do Evento *
        </label>
        <input
          type="datetime-local"
          {...register('event_date')}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
            errors.event_date
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 bg-white'
          }`}
        />
        {errors.event_date && (
          <p className="mt-1 text-sm text-red-600">
            {errors.event_date.message}
          </p>
        )}
      </div>

      {/* Duração (minutos) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Duração (minutos)
        </label>
        <input
          type="number"
          {...register('duration_minutes', { valueAsNumber: true })}
          placeholder="Ex: 90"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
            errors.duration_minutes
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 bg-white'
          }`}
        />
        {errors.duration_minutes && (
          <p className="mt-1 text-sm text-red-600">
            {errors.duration_minutes.message}
          </p>
        )}
      </div>

      {/* Required Sections */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seções Obrigatórias
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {sections?.map((section) => (
            <div key={section.id} className="flex items-center">
              <input
                type="checkbox"
                id={`section-${section.id}`}
                value={section.id}
                {...register('required_sections', { valueAsNumber: true })}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor={`section-${section.id}`}
                className="ml-2 text-sm text-gray-900"
              >
                {section.display_name}
              </label>
            </div>
          ))}
        </div>
        {errors.required_sections && (
          <p className="mt-1 text-sm text-red-600">
            {errors.required_sections.message}
          </p>
        )}
      </div>

      {/* Expected Quorum */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quórum Esperado
        </label>
        <input
          type="number"
          {...register('expected_quorum', { valueAsNumber: true })}
          placeholder="Ex: 10"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
            errors.expected_quorum
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 bg-white'
          }`}
        />
        {errors.expected_quorum && (
          <p className="mt-1 text-sm text-red-600">
            {errors.expected_quorum.message}
          </p>
        )}
      </div>

      {/* Botões */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          {isLoading
            ? 'Guardando...'
            : initialData
            ? 'Atualizar Evento'
            : 'Criar Evento'}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancelar
          </button>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
        <p>
          <strong>Nota:</strong> Campos com * são obrigatórios.
        </p>
      </div>
    </form>
  );
}
