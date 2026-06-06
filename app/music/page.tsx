'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFetch, useDelete } from '@/hooks';
import { musicService } from '@/lib/services';
import { SheetMusic } from '@/types/database';
import AuthenticatedLayout from '@/app/authenticated-layout';
import MusicTable from '@/components/MusicTable';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function MusicPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { data: sheetMusic, loading, error, refetch } = useFetch<SheetMusic>(
    'sheet_music'
  );
  const { execute: deleteSheetMusic, loading: deleteLoading } = useDelete('sheet_music');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>(''); // State for tag filter
  const [filteredSheetMusic, setFilteredSheetMusic] = useState<SheetMusic[]>([]);

  // Redireciona se não autenticado
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Extract unique tags safely
  const allTags = Array.from(
    new Set((sheetMusic || []).flatMap((music) => music.tags || []))
  ).sort();

  // Filtrar partituras
  useEffect(() => {
    if (!sheetMusic) return;

    let currentFiltered = sheetMusic;

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      currentFiltered = currentFiltered.filter(
        (music) =>
          music.title.toLowerCase().includes(term) ||
          music.artist?.toLowerCase().includes(term) ||
          music.composer?.toLowerCase().includes(term)
      );
    }

    if (selectedDifficulty !== '') {
      currentFiltered = currentFiltered.filter(
        (music) => music.difficulty_level === selectedDifficulty
      );
    }

    if (selectedTag !== '') {
      currentFiltered = currentFiltered.filter(
        (music) => music.tags && music.tags.includes(selectedTag)
      );
    }

    setFilteredSheetMusic(currentFiltered);
  }, [searchTerm, sheetMusic, selectedDifficulty, selectedTag]);

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que quer deletar esta partitura?')) {
      return;
    }
    try {
      await deleteSheetMusic(id);
      toast.success('Partitura deletada com sucesso!');
      refetch();
    } catch (err) {
      toast.error('Erro ao deletar partitura');
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🎶 Reportório Musical</h1>
            <p className="text-gray-600 mt-1">
              Gerencie as partituras da tuna
            </p>
          </div>
          <Link
            href="/music/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            <Plus className="w-5 h-5" />
            Nova Partitura
          </Link>
        </div>

        {/* Barra de Pesquisa e Filtros */}
        <div className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex items-center gap-3 bg-gray-100 rounded-lg px-4">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Pesquisa por título, artista ou compositor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent py-2 outline-none"
            />
          </div>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          >
            <option value="">Todas as Dificuldades</option>
            <option value="beginner">Iniciante</option>
            <option value="intermediate">Intermédio</option>
            <option value="advanced">Avançado</option>
          </select>

          {/* Filter by Tag */}
          {allTags.length > 0 && (
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            >
              <option value="">Todas as Tags</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Info Card */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            Erro ao carregar partituras: {error.message}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Total de Partituras</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {sheetMusic?.length || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Composições</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {sheetMusic?.filter(s => s.composer).length || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Arranjos</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {sheetMusic?.filter(s => s.arranger).length || 0}
            </p>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
              <p>Carregando partituras...</p>
            </div>
          ) : (
            <MusicTable
              sheetMusic={filteredSheetMusic}
              onDelete={handleDelete}
              isLoading={deleteLoading}
              emptyMessage={
                searchTerm || selectedDifficulty || selectedTag
                  ? 'Nenhuma partitura encontrada com os filtros aplicados'
                  : 'Nenhuma partitura registada ainda. Começa por adicionar uma!'
              }
            />
          )}
        </div>

        {/* Info Box */}
        {sheetMusic?.length === 0 && !loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <h3 className="font-semibold text-blue-900 mb-2">
              Começa a adicionar partituras ao teu reportório
            </h3>
            <p className="text-blue-700 mb-4">
              Clica no botão acima para adicionar a primeira partitura
            </p>
            <Link
              href="/music/new"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              Adicionar Primeira Partitura
            </Link>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
