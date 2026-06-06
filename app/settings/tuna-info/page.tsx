'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { tunaService } from '@/lib/services';
import { TunaFormData } from '@/lib/schemas'; // Will define this schema
import TunaForm from '@/components/TunaForm'; // Will create this component
import AuthenticatedLayout from '@/app/authenticated-layout';
import { Tuna } from '@/types/database';
import { toast } from 'sonner';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function TunaInfoPage() {
  const router = useRouter();
  const [tuna, setTuna] = useState<Tuna | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Assuming a single tuna for now, with ID 1
  const tunaId = 1;

  // Carregar dados da tuna
  useEffect(() => {
    const fetchTuna = async () => {
      try {
        const { data, error } = await tunaService.getTuna(tunaId);
        if (error) throw error;
        setTuna(data);
      } catch (error) {
        console.error('Erro ao carregar informações da tuna:', error);
        toast.error('Erro ao carregar informações da tuna');
        // Optionally redirect or show an error state
      } finally {
        setIsFetching(false);
      }
    };

    fetchTuna();
  }, [tunaId]);

  const handleSubmit = async (data: TunaFormData) => {
    setIsLoading(true);
    try {
      await tunaService.updateTuna(tunaId, {
        name: data.name,
        slug: data.slug,
        description: data.description || undefined,
        logo_url: data.logo_url || undefined,
        website_url: data.website_url || undefined,
        location: data.location || undefined,
        founded_year: data.founded_year || undefined,
      });

      toast.success(`${data.name} foi atualizada com sucesso!`);
      // No redirect, stay on the page to see updates
    } catch (error) {
      console.error('Erro ao atualizar tuna:', error);
      toast.error('Erro ao atualizar tuna');
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
            <p className="text-gray-600">Carregando informações da tuna...</p>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (!tuna) {
    return (
      <AuthenticatedLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Tuna não encontrada ou não configurada.</p>
          <Link href="/settings" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
            Voltar para Configurações
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
          href="/settings"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para Configurações
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            ℹ️ Informações da Tuna
          </h1>
          <p className="text-gray-600 mt-2">
            Atualize os detalhes gerais da sua tuna.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow p-8">
          <TunaForm
            initialData={tuna}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            onCancel={() => router.push('/settings')}
          />
        </div>

        {/* Última atualização */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
          <p>
            <strong>Criado:</strong>{' '}
            {new Date(tuna.created_at).toLocaleDateString('pt-PT')}
          </p>
          <p>
            <strong>Última atualização:</strong>{' '}
            {new Date(tuna.updated_at).toLocaleDateString('pt-PT')}
          </p>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
