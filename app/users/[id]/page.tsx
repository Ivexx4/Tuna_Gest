'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { userService } from '@/lib/services';
import AuthenticatedLayout from '@/app/authenticated-layout';
import { User } from '@/types/database';
import { toast } from 'sonner';
import Link from 'next/link';
import { ChevronLeft, Edit, Trash2 } from 'lucide-react';

export default function UserDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await userService.getUserById(userId);
      if (error) throw error;
      setUser(data);
    } catch (error) {
      console.error('Erro ao carregar utilizador:', error);
      toast.error('Erro ao carregar utilizador');
      router.push('/users');
    } finally {
      setIsLoading(false);
    }
  }, [userId, router]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleDelete = async () => {
    if (
      !confirm(
        `Tem certeza que quer deletar o utilizador "${user?.name || user?.email}"? Essa ação é permanente.`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await userService.deleteUser(userId);
      toast.success('Utilizador deletado com sucesso');
      router.push('/users');
    } catch (error) {
      console.error('Erro ao deletar:', error);
      toast.error('Erro ao deletar utilizador');
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
            <p className="text-gray-600">Carregando detalhes do utilizador...</p>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (!user) {
    return (
      <AuthenticatedLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Utilizador não encontrado</p>
          <Link href="/users" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
            Voltar para Utilizadores
          </Link>
        </div>
      </AuthenticatedLayout>
    );
  }

  const getUserStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'inactive':
        return 'Inativo';
      case 'pending':
        return 'Pendente';
      default:
        return status;
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <Link
          href="/users"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para Utilizadores
        </Link>

        {/* Header com Ações */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{user.name || user.email}</h1>
            <span
              className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${getUserStatusColor(
                user.status
              )}`}
            >
              {getUserStatusLabel(user.status)}
            </span>
          </div>

          <div className="flex gap-2">
            <Link
              href={`/users/${userId}/edit`}
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
          {/* Card - Email */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">
              Email
            </h3>
            <p className="text-lg font-semibold text-gray-900">
              {user.email}
            </p>
          </div>

          {/* Card - Role */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">
              Role
            </h3>
            <p className="text-lg font-semibold text-gray-900">
              {user.role || <span className="text-gray-400">-</span>}
            </p>
          </div>

          {/* Card - Último Login */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">
              Último Login
            </h3>
            <p className="text-lg font-semibold text-gray-900">
              {user.last_sign_in_at ? (
                new Date(user.last_sign_in_at).toLocaleDateString('pt-PT', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </p>
          </div>
        </div>

        {/* Datas */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600 space-y-1">
          <p>
            <strong>Criado:</strong>{' '}
            {new Date(user.created_at).toLocaleDateString('pt-PT')}
          </p>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
