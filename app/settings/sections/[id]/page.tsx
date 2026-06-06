'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { instrumentSectionService } from '@/lib/services';
import AuthenticatedLayout from '@/app/authenticated-layout';
import { InstrumentSection } from '@/types/database';
import { toast } from 'sonner';
import Link from 'next/link';
import { ChevronLeft, Edit, Trash2 } from 'lucide-react';

export default function InstrumentSectionDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const sectionId = parseInt(params.id as string);

  const [section, setSection] = useState<InstrumentSection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSection = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await instrumentSectionService.getSection(sectionId);
      if (error) throw error;
      setSection(data);
    } catch (error) {
      console.error('Erro ao carregar seção:', error);
      toast.error('Erro ao carregar seção');
      router.push('/settings/sections');
    } finally {
      setIsLoading(false);
    }
  }, [sectionId, router]);

  useEffect(() => {
    fetchSection();
  }, [fetchSection]);

  const handleDelete = async () => {
    if (
      !confirm(
        `Tem certeza que quer deletar a seção "${section?.display_name}"? Essa ação é permanente.`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await instrumentSectionService.deleteSection(sectionId);
      toast.success('Seção deletada com sucesso');
      router.push('/settings/sections');
    } catch (error) {
      console.error('Erro ao deletar:', error);
      toast.error('Erro ao deletar seção');
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
            <p className="text-gray-600">Carregando detalhes da seção...</p>
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
          href="/settings/sections"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para Gestão de Naipes
        </Link>

        {/* Header com Ações */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{section.display_name}</h1>
            <p className="text-gray-600 mt-1">Nome Interno: {section.name}</p>
          </div>

          <div className="flex gap-2">
            <Link
              href={`/settings/sections/${sectionId}/edit`}
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
          {/* Card - Cor */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">
              Cor
            </h3>
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-8 h-8 rounded-full border border-gray-300"
                style={{ backgroundColor: section.color || '#FFFFFF' }}
              ></span>
              <p className="text-lg font-semibold text-gray-900">
                {section.color || <span className="text-gray-400">-</span>}
              </p>
            </div>
          </div>

          {/* Card - Tuna ID */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">
              ID da Tuna
            </h3>
            <p className="text-lg font-semibold text-gray-900">
              {section.tuna_id}
            </p>
          </div>
        </div>

        {/* Descrição */}
        {section.description && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">
              Descrição
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap">{section.description}</p>
          </div>
        )}

        {/* Datas */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600 space-y-1">
          <p>
            <strong>Criado:</strong>{' '}
            {new Date(section.created_at).toLocaleDateString('pt-PT')}
          </p>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
