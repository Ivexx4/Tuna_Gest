'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { userService } from '@/lib/services';
import { UserFormData } from '@/lib/schemas';
import UserForm from '@/components/UserForm';
import AuthenticatedLayout from '@/app/authenticated-layout';
import { User } from '@/types/database';
import { toast } from 'sonner';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Carregar dados do utilizador
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await userService.getUserById(userId);
        if (error) throw error;
        setUser(data);
      } catch (error) {
        console.error('Erro ao carregar utilizador:', error);
        toast.error('Erro ao carregar utilizador');
        router.push('/users');
      } finally {
        setIsFetching(false);
      }
    };

    fetchUser();
  }, [userId, router]);

  const handleSubmit = async (data: UserFormData) => {
    setIsLoading(true);
    try {
      await userService.updateUser(userId, {
        email: data.email,
        name: data.name || undefined,
        role: data.role,
        status: data.status,
      });

      toast.success(`Utilizador ${data.name || data.email} foi atualizado com sucesso!`);
      router.push(`/users/${userId}`);
    } catch (error) {
      console.error('Erro ao atualizar utilizador:', error);
      toast.error('Erro ao atualizar utilizador');
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
            <p className="text-gray-600">Carregando dados do utilizador...</p>
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

  return (
    <AuthenticatedLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <Link
          href={`/users/${userId}`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para Detalhes do Utilizador
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            ✏️ Editar Utilizador
          </h1>
          <p className="text-gray-600 mt-2">
            Atualize as informações de {user.name || user.email}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow p-8">
          <UserForm
            initialData={user}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            onCancel={() => router.push(`/users/${userId}`)}
          />
        </div>

        {/* Última atualização */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
          <p>
            <strong>Criado:</strong>{' '}
            {new Date(user.created_at).toLocaleDateString('pt-PT')}
          </p>
          {user.last_sign_in_at && (
            <p>
              <strong>Último Login:</strong>{' '}
              {new Date(user.last_sign_in_at).toLocaleDateString('pt-PT')}
            </p>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
