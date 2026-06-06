'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFetch, useDelete } from '@/hooks';
import { instrumentSectionService } from '@/lib/services';
import { InstrumentSection } from '@/types/database';
import AuthenticatedLayout from '@/app/authenticated-layout';
import SectionsTable from '@/components/SectionsTable'; // Will create this component
import { Plus, Search, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function SectionsPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  // Assuming tuna_id = 1 for now
  const { data: sections, loading, error, refetch } = useFetch<InstrumentSection>(
    'instrument_sections',
    () => instrumentSectionService.getSections(1)
  );
  const { execute: deleteSection, loading: deleteLoading } = useDelete('instrument_sections');

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSections, setFilteredSections] = useState<InstrumentSection[]>([]);

  // Redireciona se não autenticado
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Filtrar seções
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSections(sections);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredSections(
        sections.filter(
          (section) =>
            section.name.toLowerCase().includes(term) ||
            section.display_name.toLowerCase().includes(term) ||
            section.description?.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, sections]);

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que quer deletar esta seção? Esta ação é permanente.')) {
      return;
    }
    try {
      await instrumentSectionService.deleteSection(id);
      toast.success('Seção deletada com sucesso!');
      refetch();
    } catch (err) {
      toast.error('Erro ao deletar seção');
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
            <h1 className="text-3xl font-bold text-gray-900">🎸 Gestão de Naipes</h1>
            <p className="text-gray-600 mt-1">
              Gerencie os naipes e seções instrumentais da sua tuna
            </p>
          </div>
          <Link
            href="/settings/sections/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            <Plus className="w-5 h-5" />
            Novo Naipe
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
            Erro ao carregar naipes: {error.message}
          </div>
        )}

        {/* Tabela */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
              <p>Carregando naipes...</p>
            </div>
          ) : (
            <SectionsTable
              sections={filteredSections}
              onDelete={handleDelete}
              isLoading={deleteLoading}
              emptyMessage={
                searchTerm
                  ? 'Nenhum naipe encontrado com esse termo'
                  : 'Nenhum naipe registado ainda. Comece por criar um!'
              }
            />
          )}
        </div>

        {/* Info Box */}
        {sections.length === 0 && !loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <h3 className="font-semibold text-blue-900 mb-2">
              Comece a definir os naipes da sua tuna
            </h3>
            <p className="text-blue-700 mb-4">
              Clica no botão acima para criar o primeiro naipe
            </p>
            <Link
              href="/settings/sections/new"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              Criar Primeiro Naipe
            </Link>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
