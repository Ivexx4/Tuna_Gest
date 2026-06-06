'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { memberSchema, MemberFormData } from '@/lib/schemas';
import { Member } from '@/types/database';

interface MemberFormProps {
  initialData?: Member;
  onSubmit: (data: MemberFormData) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
}

export default function MemberForm({
  initialData,
  onSubmit,
  isLoading,
  onCancel,
}: MemberFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      role_id: initialData?.role_id || undefined,
      section_id: initialData?.section_id || undefined,
      joining_date: initialData?.joining_date || '',
      status: initialData?.status || 'active',
      bio: initialData?.bio || '',
    },
  });

  const handleFormSubmit = async (data: MemberFormData) => {
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      console.error('Erro ao submeter:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Nome */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nome *
        </label>
        <input
          type="text"
          {...register('name')}
          placeholder="Ex: João Silva"
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

      {/* Dois por linha */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            {...register('email')}
            placeholder="joao@example.com"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
              errors.email
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 bg-white'
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Telefone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telefone
          </label>
          <input
            type="tel"
            {...register('phone')}
            placeholder="+351 910 000 000"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
              errors.phone
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 bg-white'
            }`}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>
      </div>

      {/* Três por linha */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Role ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role
          </label>
          <input
            type="number"
            {...register('role_id', { valueAsNumber: true })}
            placeholder="Ex: 1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
          <p className="text-xs text-gray-500 mt-1">ID do role</p>
        </div>

        {/* Section ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seção
          </label>
          <input
            type="number"
            {...register('section_id', { valueAsNumber: true })}
            placeholder="Ex: 1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
          <p className="text-xs text-gray-500 mt-1">ID da seção</p>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status *
          </label>
          <select
            {...register('status')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          >
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
            <option value="alumni">Alumni</option>
          </select>
        </div>
      </div>

      {/* Data de Entrada */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Data de Entrada
        </label>
        <input
          type="date"
          {...register('joining_date')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
        />
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bio
        </label>
        <textarea
          {...register('bio')}
          placeholder="Descreve um pouco sobre ti..."
          rows={3}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none ${
            errors.bio
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 bg-white'
          }`}
        />
        {errors.bio && (
          <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
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
            ? 'Atualizar'
            : 'Criar Membro'}
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
          <strong>Nota:</strong> Role e Seção são opcionais. Se não especificares, o membro não será associado a nenhum.
        </p>
      </div>
    </form>
  );
}

