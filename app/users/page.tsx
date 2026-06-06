'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFetch, useDelete } from '@/hooks';
import { userService } from '@/lib/services'; // Will create this service
import { User } from '@/types/database';
import AuthenticatedLayout from '@/app/authenticated-layout';
import UsersTable from '@/components/UsersTable'; // Will create this component
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function UsersPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  // Assuming 'users' is the table name for fetching users
  const { data: users, loading, error, refetch } = useFetch<User>(
    'users'
  );
  // Assuming deleteUser will be implemented in userService
  const { execute: deleteUser, loading: deleteLoading } = useDelete('users');

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  // Redireciona se não autenticado
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Filtrar utilizadores
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredUsers(
        users.filter(
          (user) =>
            user.name?.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term) ||
            user.role?.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, users]);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que quer deletar este utilizador? Esta ação é permanente.')) {
      return;
    }
    try {
      await userService.deleteUser(id);
      toast.success('Utilizador deletado com sucesso!');
      refetch();
    } catch (err) {
      toast.error('Erro ao deletar utilizador');
      console.error(err);
    }
  };

  if (authLoading) {
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

  const activeUsers = users.filter(user => user.status === 'active');
  const pendingUsers = users.filter(user => user.status === 'pending');

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">👥 Gestão de Utilizadores</h1>
            <p className="text-gray-600 mt-1">
              Gerencie os utilizadores e suas permissões
            </p>
          </div>
          {/* Link para criar novo utilizador - pode ser um convite ou registo manual */}
          <Link
            href="/users/new" // This page will be for inviting new users or manual creation
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            <Plus className="w-5 h-5" />
            Novo Utilizador
          </Link>
        </div>

        {/* Barra de Pesquisa */}
        <div className="bg-white rounded-lg shadow p-4 flex gap-4">
          <div className="flex-1 flex items-center gap-3 bg-gray-100 rounded-lg px-4">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Pesquisa por nome, email ou role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent py-2 outline-none"
            />
          </div>
        </div>

        {/* Info Card */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            Erro ao carregar utilizadores: {error.message}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Total de Utilizadores</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {users.length}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Ativos</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {activeUsers.length}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Pendentes</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {pendingUsers.length}
            </p>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
              <p>Carregando utilizadores...</p>
            </div>
          ) : (
            <UsersTable
              users={filteredUsers}
              onDelete={handleDelete}
              isLoading={deleteLoading}
              emptyMessage={
                searchTerm
                  ? 'Nenhum utilizador encontrado com esse termo'
                  : 'Nenhum utilizador registado ainda.'
              }
            />
          )}
        </div>

        {/* Info Box */}
        {users.length === 0 && !loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <h3 className="font-semibold text-blue-900 mb-2">
              Começa a gerir os teus utilizadores
            </h3>
            <p className="text-blue-700 mb-4">
              Clica no botão acima para adicionar o primeiro utilizador
            </p>
            <Link
              href="/users/new"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              Adicionar Primeiro Utilizador
            </Link>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
