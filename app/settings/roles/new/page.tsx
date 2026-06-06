'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { hierarchyRoleService } from '@/lib/services';
import { HierarchyRoleFormData } from '@/lib/schemas'; // Will define this schema
import HierarchyRoleForm from '@/components/HierarchyRoleForm'; // Will create this component
import AuthenticatedLayout from '@/app/authenticated-layout';
import { toast } from 'sonner';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function NewHierarchyRolePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: HierarchyRoleFormData) => {
    setIsLoading(true);
    try {
      // Assuming tuna_id = 1 for now
      await hierarchyRoleService.createRole({
        tuna_id: 1,
        name: data.name,
        display_name: data.display_name,
        level: data.level,
        description: data.description || undefined,
        // permissions: data.permissions || undefined, // Add this when implementing permissions
      });

      toast.success(`${data.display_name} foi criado com sucesso!`);
      router.push('/settings/roles');
    } catch (error) {
      console.error('Erro ao criar cargo:', error);
      toast.error('Erro ao criar cargo');
    } finally {
      setIsLoading(false);
    }
  };

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

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            ➕ Criar Novo Cargo
          </h1>
          <p className="text-gray-600 mt-2">
            Defina um novo cargo e seu nível hierárquico.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow p-8">
          <HierarchyRoleForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            onCancel={() => router.push('/settings/roles')}
          />
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">💡 Dicas</h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li>✓ Nome e Nível são obrigatórios</li>
            <li>✓ O Nível define a ordem hierárquica (menor número = maior nível)</li>
          </ul>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
