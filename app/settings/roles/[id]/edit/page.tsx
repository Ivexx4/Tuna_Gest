'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { hierarchyRoleService } from '@/lib/services';
import { HierarchyRoleFormData } from '@/lib/schemas';
import HierarchyRoleForm from '@/components/HierarchyRoleForm';
import AuthenticatedLayout from '@/app/authenticated-layout';
import { HierarchyRole } from '@/types/database';
import { toast } from 'sonner';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function EditHierarchyRolePage() {
  const router = useRouter();
  const params = useParams();
  const roleId = parseInt(params.id as string);

  const [role, setRole] = useState<HierarchyRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Carregar dados do cargo
  useEffect(() => {
    const fetchRole = async () => {
      try {
        const { data, error } = await hierarchyRoleService.getRole(roleId);
        if (error) throw error;
        setRole(data);
      } catch (error) {
        console.error('Erro ao carregar cargo:', error);
        toast.error('Erro ao carregar cargo');
        router.push('/settings/roles');
      } finally {
        setIsFetching(false);
      }
    };

    fetchRole();
  }, [roleId, router]);

  const handleSubmit = async (data: HierarchyRoleFormData) => {
    setIsLoading(true);
    try {
      await hierarchyRoleService.updateRole(roleId, {
        name: data.name,
        display_name: data.display_name,
        level: data.level,
        description: data.description || undefined,
      });

      toast.success(`${data.display_name} foi atualizado com sucesso!`);
      router.push(`/settings/roles/${roleId}`);
    } catch (error) {
      console.error('Erro ao atualizar cargo:', error);
      toast.error('Erro ao atualizar cargo');
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
            <p className="text-gray-600">Carregando dados do cargo...</p>
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
          href={`/settings/roles/${roleId}`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para Detalhes do Cargo
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            ✏️ Editar Cargo
          </h1>
          <p className="text-gray-600 mt-2">
            Atualize as informações de {role.display_name}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow p-8">
          <HierarchyRoleForm
            initialData={role}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            onCancel={() => router.push(`/settings/roles/${roleId}`)}
          />
        </div>

        {/* Última atualização */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
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
