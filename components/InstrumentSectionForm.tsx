'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { instrumentSectionSchema, InstrumentSectionFormData } from '@/lib/schemas';
import { InstrumentSection } from '@/types/database';

interface InstrumentSectionFormProps {
  initialData?: InstrumentSection;
  onSubmit: (data: InstrumentSectionFormData) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
}

export default function InstrumentSectionForm({
  initialData,
  onSubmit,
  isLoading,
  onCancel,
}: InstrumentSectionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InstrumentSectionFormData>({
    resolver: zodResolver(instrumentSectionSchema),
    defaultValues: {
      name: initialData?.name || '',
      display_name: initialData?.display_name || '',
      description: initialData?.description || '',
      color: initialData?.color || '#000000', // Default color
    },
  });

  const handleFormSubmit = async (data: InstrumentSectionFormData) => {
    try {
      await onSubmit(data);
      reset(); // Reset form after successful submission
    } catch (error) {
      console.error('Erro ao submeter:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Nome Interno */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nome Interno (único) *
        </label>
        <input
          type="text"
          {...register('name')}
          placeholder="Ex: cordas"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
            errors.name
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 bg-white'
          }`}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Nome único para identificação interna (ex: cordas, sopros, percussão).
        </p>
      </div>

      {/* Nome de Exibição */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nome de Exibição *
        </label>
        <input
          type="text"
          {...register('display_name')}
          placeholder="Ex: Naipe de Cordas"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
            errors.display_name
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 bg-white'
          }`}
        />
        {errors.display_name && (
          <p className="mt-1 text-sm text-red-600">
            {errors.display_name.message}
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Nome amigável para exibição na interface (ex: Naipe de Cordas, Naipe de Sopros).
        </p>
      </div>

      {/* Descrição */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descrição
        </label>
        <textarea
          {...register('description')}
          placeholder="Instrumentos que compõem este naipe, etc."
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

      {/* Cor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cor (Hexadecimal)
        </label>
        <input
          type="color"
          {...register('color')}
          className={`w-full h-10 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
            errors.color
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 bg-white'
          }`}
        />
        {errors.color && (
          <p className="mt-1 text-sm text-red-600">{errors.color.message}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Cor para identificar visualmente o naipe (ex: #FF0000 para vermelho).
        </p>
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
            ? 'Atualizar Naipe'
            : 'Criar Naipe'}
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
