'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { userService } from '@/lib/services';
import { UserFormData } from '@/lib/schemas'; // Will define this schema
import UserForm from '@/components/UserForm'; // Will create this component
import AuthenticatedLayout from '@/app/authenticated-layout';
import { toast } from 'sonner';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function NewUserPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: UserFormData) => {
    setIsLoading(true);
    try {
      // For now, this will be a placeholder as direct user creation in Supabase auth
      // is usually done via admin SDK or specific invite flows.
      // This might create an entry in a public 'users' table.
      await userService.createUser({
        email: data.email,
        name: data.name || undefined,
        role: data.role || 'viewer', // Default role
        status: data.status || 'pending', // Default status
      });

      toast.success(`Utilizador ${data.email} foi criado com sucesso!`);
      router.push('/users');
    } catch (error) {
      console.error('Erro ao criar utilizador:', error);
      toast.error('Erro ao criar utilizador');
    } finally {
      setIsLoading(false);
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

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            ➕ Adicionar Novo Utilizador
          </h1>
          <p className="text-gray-600 mt-2">
            Adicione um novo utilizador e defina as suas permissões
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow p-8">
          <UserForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            onCancel={() => router.push('/users')}
          />
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">💡 Dicas</h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li>✓ Email é obrigatório</li>
            <li>✓ Role e Status podem ser definidos</li>
            <li>✓ Um email de convite pode ser enviado automaticamente (se configurado)</li>
          </ul>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
