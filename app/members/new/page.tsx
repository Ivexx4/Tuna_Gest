'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { memberService } from '@/lib/services';
import { MemberFormData } from '@/lib/schemas';
import MemberForm from '@/components/MemberForm';
import AuthenticatedLayout from '@/app/authenticated-layout';
import { toast } from 'sonner';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function NewMemberPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: MemberFormData) => {
    setIsLoading(true);
    try {
      // Por enquanto, usa tuna_id = 1 (pode ser feito dinâmico depois)
      await memberService.createMember({
        tuna_id: 1,
        name: data.name,
        email: data.email || undefined,
        phone: data.phone || undefined,
        role_id: data.role_id,
        section_id: data.section_id,
        joining_date: data.joining_date || undefined,
        status: data.status,
        bio: data.bio || undefined,
      });

      toast.success(`${data.name} foi criado com sucesso!`);
      router.push('/members');
    } catch (error) {
      console.error('Erro ao criar membro:', error);
      toast.error('Erro ao criar membro');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <Link
          href="/members"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para Membros
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            ➕ Criar Novo Membro
          </h1>
          <p className="text-gray-600 mt-2">
            Adicione um novo membro à sua tuna preenchendo o formulário abaixo
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow p-8">
          <MemberForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            onCancel={() => router.push('/members')}
          />
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">💡 Dicas</h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li>✓ Nome é obrigatório</li>
            <li>✓ Email deve ser válido (opcional)</li>
            <li>✓ Role e Seção podem ser deixados em branco</li>
            <li>✓ Status por padrão é "Ativo"</li>
          </ul>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

