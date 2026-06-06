'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { hierarchyRoleSchema, HierarchyRoleFormData } from '@/lib/schemas';
import { HierarchyRole } from '@/types/database';

interface HierarchyRoleFormProps {
  initialData?: HierarchyRole;
  onSubmit: (data: HierarchyRoleFormData) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
}

export default function HierarchyRoleForm({
  initialData,
  onSubmit,
  isLoading,
  onCancel,
}: HierarchyRoleFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<HierarchyRoleFormData>({
    resolver: zodResolver(hierarchyRoleSchema),
    defaultValues: {
      name: initialData?.name || '',
      display_name: initialData?.display_name || '',
      level: initialData?.level || 0,
      description: initialData?.description || '',
    },
  });

  const handleFormSubmit = async (data: HierarchyRoleFormData) => {
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
          placeholder="Ex: presidente"
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
          Nome único para identificação interna (ex: presidente, tesoureiro).
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
          placeholder="Ex: Presidente da Tuna"
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
          Nome amigável para exibição na interface (ex: Presidente da Tuna, Tesoureiro).
        </p>
      </div>

      {/* Nível Hierárquico */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nível Hierárquico *
        </label>
        <input
          type="number"
          {...register('level', { valueAsNumber: true })}
          placeholder="Ex: 1"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
            errors.level
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 bg-white'
          }`}
        />
        {errors.level && (
          <p className="mt-1 text-sm text-red-600">{errors.level.message}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Um número que define a importância do cargo (menor número = maior hierarquia).
        </p>
      </div>

      {/* Descrição */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descrição
        </label>
        <textarea
          {...register('description')}
          placeholder="Funções e responsabilidades do cargo..."
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
            ? 'Atualizar Cargo'
            : 'Criar Cargo'}
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
