'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFetch, useDelete } from '@/hooks';
import { hierarchyRoleService } from '@/lib/services';
import { HierarchyRole } from '@/types/database';
import AuthenticatedLayout from '@/app/authenticated-layout';
import RolesTable from '@/components/RolesTable'; // Will create this component
import { Plus, Search, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function RolesPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  // Assuming tuna_id = 1 for now
  const { data: roles, loading, error, refetch } = useFetch<HierarchyRole>(
    'hierarchy_roles',
    () => hierarchyRoleService.getRoles(1)
  );
  const { execute: deleteRole, loading: deleteLoading } = useDelete('hierarchy_roles');

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRoles, setFilteredRoles] = useState<HierarchyRole[]>([]);

  // Redireciona se não autenticado
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Filtrar roles
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredRoles(roles);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredRoles(
        roles.filter(
          (role) =>
            role.name.toLowerCase().includes(term) ||
            role.display_name.toLowerCase().includes(term) ||
            role.description?.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, roles]);

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que quer deletar este cargo? Esta ação é permanente.')) {
      return;
    }
    try {
      await hierarchyRoleService.deleteRole(id);
      toast.success('Cargo deletado com sucesso!');
      refetch();
    } catch (err) {
      toast.error('Erro ao deletar cargo');
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

  return (
    <AuthenticatedLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para Configurações
        </Link>

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">👑 Gestão de Cargos</h1>
            <p className="text-gray-600 mt-1">
              Gerencie os cargos e a hierarquia da sua tuna
            </p>
          </div>
          <Link
            href="/settings/roles/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            <Plus className="w-5 h-5" />
            Novo Cargo
          </Link>
        </div>

        {/* Barra de Pesquisa */}
        <div className="bg-white rounded-lg shadow p-4 flex gap-4">
          <div className="flex-1 flex items-center gap-3 bg-gray-100 rounded-lg px-4">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Pesquisa por nome, display name ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent py-2 outline-none"
            />
          </div>
        </div>

        {/* Info Card */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            Erro ao carregar cargos: {error.message}
          </div>
        )}

        {/* Tabela */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
              <p>Carregando cargos...</p>
            </div>
          ) : (
            <RolesTable
              roles={filteredRoles}
              onDelete={handleDelete}
              isLoading={deleteLoading}
              emptyMessage={
                searchTerm
                  ? 'Nenhum cargo encontrado com esse termo'
                  : 'Nenhum cargo registado ainda. Comece por criar um!'
              }
            />
          )}
        </div>

        {/* Info Box */}
        {roles.length === 0 && !loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <h3 className="font-semibold text-blue-900 mb-2">
              Comece a definir os cargos da sua tuna
            </h3>
            <p className="text-blue-700 mb-4">
              Clica no botão acima para criar o primeiro cargo
            </p>
            <Link
              href="/settings/roles/new"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              Criar Primeiro Cargo
            </Link>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
