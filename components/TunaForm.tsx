'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { tunaSchema, TunaFormData } from '@/lib/schemas';
import { Tuna } from '@/types/database';

interface TunaFormProps {
  initialData?: Tuna;
  onSubmit: (data: TunaFormData) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
}

export default function TunaForm({
  initialData,
  onSubmit,
  isLoading,
  onCancel,
}: TunaFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TunaFormData>({
    resolver: zodResolver(tunaSchema),
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      logo_url: initialData?.logo_url || '',
      website_url: initialData?.website_url || '',
      location: initialData?.location || '',
      founded_year: initialData?.founded_year || undefined,
    },
  });

  const handleFormSubmit = async (data: TunaFormData) => {
    try {
      await onSubmit(data);
      // No reset here to keep the form data after successful submission for settings page
    } catch (error) {
      console.error('Erro ao submeter:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Nome */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nome da Tuna *
        </label>
        <input
          type="text"
          {...register('name')}
          placeholder="Ex: Tuna Académica de Coimbra"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
            errors.name
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 bg-white'
          }`}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Slug (URL amigável) *
        </label>
        <input
          type="text"
          {...register('slug')}
          placeholder="Ex: tac"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
            errors.slug
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 bg-white'
          }`}
        />
        {errors.slug && (
          <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Usado na URL (ex: tunamanager.com/tunas/tac)
        </p>
      </div>

      {/* Descrição */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descrição
        </label>
        <textarea
          {...register('description')}
          placeholder="Uma breve descrição da sua tuna..."
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

      {/* Logo URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL do Logotipo
        </label>
        <input
          type="text"
          {...register('logo_url')}
          placeholder="https://example.com/logo.png"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
            errors.logo_url
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 bg-white'
          }`}
        />
        {errors.logo_url && (
          <p className="mt-1 text-sm text-red-600">
            {errors.logo_url.message}
          </p>
        )}
      </div>

      {/* Website URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL do Website
        </label>
        <input
          type="text"
          {...register('website_url')}
          placeholder="https://www.tunaacademica.pt"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
            errors.website_url
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 bg-white'
          }`}
        />
        {errors.website_url && (
          <p className="mt-1 text-sm text-red-600">
            {errors.website_url.message}
          </p>
        )}
      </div>

      {/* Localização e Ano de Fundação */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Localização
          </label>
          <input
            type="text"
            {...register('location')}
            placeholder="Ex: Coimbra, Portugal"
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ano de Fundação
          </label>
          <input
            type="number"
            {...register('founded_year', { valueAsNumber: true })}
            placeholder="Ex: 1887"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
              errors.founded_year
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 bg-white'
            }`}
          />
          {errors.founded_year && (
            <p className="mt-1 text-sm text-red-600">
              {errors.founded_year.message}
            </p>
          )}
        </div>
      </div>

      {/* Botões */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          {isLoading ? 'Guardando...' : 'Atualizar Informações'}
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
