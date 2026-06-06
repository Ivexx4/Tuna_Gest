'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userSchema, UserFormData } from '@/lib/schemas';
import { User } from '@/types/database';

interface UserFormProps {
  initialData?: User;
  onSubmit: (data: UserFormData) => void;
  isLoading?: boolean;
  onCancel?: () => void; // <--- ADICIONA ESTA LINHA
}

export default function UserForm({ initialData, onSubmit, isLoading, onCancel }: UserFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: initialData?.email || '',
      name: initialData?.name || '',
      role: (initialData?.role === 'admin' || initialData?.role === 'editor' || initialData?.role === 'viewer') 
        ? initialData.role 
        : 'viewer',
      status: (initialData?.status === 'active' || initialData?.status === 'inactive' || initialData?.status === 'pending') 
        ? initialData.status 
        : 'pending',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          {...register('email')}
          className="w-full mt-1 p-2 border rounded"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Nome</label>
        <input
          {...register('name')}
          className="w-full mt-1 p-2 border rounded"
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Cargo</label>
        <select {...register('role')} className="w-full mt-1 p-2 border rounded">
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
          <option value="viewer">Viewer</option>
        </select>
        {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <select {...register('status')} className="w-full mt-1 p-2 border rounded">
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
          <option value="pending">Pendente</option>
        </select>
        {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isLoading ? 'Salvando...' : 'Salvar Utilizador'}
        </button>
        
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded font-semibold hover:bg-gray-50"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
