'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { instrumentSectionService } from '@/lib/services';
import { InstrumentSectionFormData } from '@/lib/schemas';
import InstrumentSectionForm from '@/components/InstrumentSectionForm';
import AuthenticatedLayout from '@/app/authenticated-layout';
import { InstrumentSection } from '@/types/database';
import { toast } from 'sonner';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function EditInstrumentSectionPage() {
  const router = useRouter();
  const params = useParams();
  const sectionId = parseInt(params.id as string);

  const [section, setSection] = useState<InstrumentSection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Carregar dados da seção
  useEffect(() => {
    const fetchSection = async () => {
      try {
        const { data, error } = await instrumentSectionService.getSection(sectionId);
        if (error) throw error;
        setSection(data);
      } catch (error) {
        console.error('Erro ao carregar seção:', error);
        toast.error('Erro ao carregar seção');
        router.push('/settings/sections');
      } finally {
        setIsFetching(false);
      }
    };

    fetchSection();
  }, [sectionId, router]);

  const handleSubmit = async (data: InstrumentSectionFormData) => {
    setIsLoading(true);
    try {
      await instrumentSectionService.updateSection(sectionId, {
        name: data.name,
        display_name: data.display_name,
        description: data.description || undefined,
        color: data.color || undefined,
      });

      toast.success(`${data.display_name} foi atualizada com sucesso!`);
      router.push(`/settings/sections/${sectionId}`);
    } catch (error) {
      console.error('Erro ao atualizar seção:', error);
      toast.error('Erro ao atualizar seção');
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
            <p className="text-gray-600">Carregando dados da seção...</p>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (!section) {
    return (
      <AuthenticatedLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Seção não encontrada</p>
          <Link href="/settings/sections" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
            Voltar para Gestão de Naipes
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
          href={`/settings/sections/${sectionId}`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para Detalhes da Seção
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            ✏️ Editar Naipe
          </h1>
          <p className="text-gray-600 mt-2">
            Atualize as informações de {section.display_name}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow p-8">
          <InstrumentSectionForm
            initialData={section}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            onCancel={() => router.push(`/settings/sections/${sectionId}`)}
          />
        </div>

        {/* Última atualização */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
          <p>
            <strong>Criado:</strong>{' '}
            {new Date(section.created_at).toLocaleDateString('pt-PT')}
          </p>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
