'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { hierarchyRoleService } from '@/lib/services';
import AuthenticatedLayout from '@/app/authenticated-layout';
import { HierarchyRole } from '@/types/database';
import { toast } from 'sonner';
import Link from 'next/link';
import { ChevronLeft, Edit, Trash2 } from 'lucide-react';

export default function HierarchyRoleDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const roleId = parseInt(params.id as string);

  const [role, setRole] = useState<HierarchyRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchRole = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await hierarchyRoleService.getRole(roleId);
      if (error) throw error;
      setRole(data);
    } catch (error) {
      console.error('Erro ao carregar cargo:', error);
      toast.error('Erro ao carregar cargo');
      router.push('/settings/roles');
    } finally {
      setIsLoading(false);
    }
  }, [roleId, router]);

  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

  const handleDelete = async () => {
    if (
      !confirm(
        `Tem certeza que quer deletar o cargo "${role?.display_name}"? Essa ação é permanente.`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await hierarchyRoleService.deleteRole(roleId);
      toast.success('Cargo deletado com sucesso');
      router.push('/settings/roles');
    } catch (error) {
      console.error('Erro ao deletar:', error);
      toast.error('Erro ao deletar cargo');
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
            <p className="text-gray-600">Carregando detalhes do cargo...</p>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (!role) {
    return (
      <AuthenticatedLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Cargo não encontrado</p>
          <Link href="/settings/roles" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
            Voltar para Gestão de Cargos
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
          href="/settings/roles"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para Gestão de Cargos
        </Link>

        {/* Header com Ações */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{role.display_name}</h1>
            <p className="text-gray-600 mt-1">Nome Interno: {role.name}</p>
          </div>

          <div className="flex gap-2">
            <Link
              href={`/settings/roles/${roleId}/edit`}
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
          {/* Card - Nível */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">
              Nível Hierárquico
            </h3>
            <p className="text-lg font-semibold text-gray-900">
              {role.level}
            </p>
          </div>

          {/* Card - Tuna ID */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">
              ID da Tuna
            </h3>
            <p className="text-lg font-semibold text-gray-900">
              {role.tuna_id}
            </p>
          </div>
        </div>

        {/* Descrição */}
        {role.description && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">
              Descrição
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap">{role.description}</p>
          </div>
        )}

        {/* Datas */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600 space-y-1">
          <p>
            <strong>Criado:</strong>{' '}
            {new Date(role.created_at).toLocaleDateString('pt-PT')}
          </p>
          <p>
            <strong>Última atualização:</strong>{' '}
            {new Date(role.updated_at).toLocaleDateString('pt-PT')}
          </p>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
