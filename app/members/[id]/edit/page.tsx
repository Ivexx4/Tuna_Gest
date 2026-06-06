'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { memberService } from '@/lib/services';
import { MemberFormData } from '@/lib/schemas';
import MemberForm from '@/components/MemberForm';
import AuthenticatedLayout from '@/app/authenticated-layout';
import { Member } from '@/types/database';
import { toast } from 'sonner';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function EditMemberPage() {
  const router = useRouter();
  const params = useParams();
  const memberId = parseInt(params.id as string);

  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Carregar dados do membro
  useEffect(() => {
    const fetchMember = async () => {
      try {
        const { data, error } = await memberService.getMember(memberId);
        if (error) throw error;
        setMember(data);
      } catch (error) {
        console.error('Erro ao carregar membro:', error);
        toast.error('Erro ao carregar membro');
        router.push('/members');
      } finally {
        setIsFetching(false);
      }
    };

    fetchMember();
  }, [memberId, router]);

  const handleSubmit = async (data: MemberFormData) => {
    setIsLoading(true);
    try {
      await memberService.updateMember(memberId, {
        name: data.name,
        email: data.email || undefined,
        phone: data.phone || undefined,
        role_id: data.role_id,
        section_id: data.section_id,
        joining_date: data.joining_date || undefined,
        status: data.status,
        bio: data.bio || undefined,
      });

      toast.success(`${data.name} foi atualizado com sucesso!`);
      router.push(`/members/${memberId}`);
    } catch (error) {
      console.error('Erro ao atualizar membro:', error);
      toast.error('Erro ao atualizar membro');
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
            <p className="text-gray-600">Carregando dados do membro...</p>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (!member) {
    return (
      <AuthenticatedLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Membro não encontrado</p>
          <Link href="/members" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
            Voltar para Membros
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
          href={`/members/${memberId}`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para Perfil
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            ✏️ Editar Membro
          </h1>
          <p className="text-gray-600 mt-2">
            Atualize as informações de {member.name}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow p-8">
          <MemberForm
            initialData={member}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            onCancel={() => router.push(`/members/${memberId}`)}
          />
        </div>

        {/* Última atualização */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
          <p>
            <strong>Última atualização:</strong>{' '}
            {new Date(member.updated_at).toLocaleDateString('pt-PT')}
          </p>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

