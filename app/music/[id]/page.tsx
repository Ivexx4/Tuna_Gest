'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { musicService, eventService } from '@/lib/services'; // Added eventService
import AuthenticatedLayout from '@/app/authenticated-layout';
import { SheetMusic, MusicPractice, Event } from '@/types/database';
import { toast } from 'sonner';
import Link from 'next/link';
import { ChevronLeft, Edit, Trash2, Download, History, Plus } from 'lucide-react';
import { useFetch } from '@/hooks';
import PdfViewer from '@/components/PdfViewer'; // Import the PdfViewer component

export default function SheetMusicDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const musicId = parseInt(params.id as string);

  const [sheetMusic, setSheetMusic] = useState<SheetMusic | null>(null);
  const [practices, setPractices] = useState<(MusicPractice & { event?: Event })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // For Practice Modal
  const [isPracticeModalOpen, setIsPracticeModalOpen] = useState(false);
  const [newPracticeStatus, setNewPracticeStatus] = useState('learning');
  const [newPracticeEventId, setNewPracticeEventId] = useState<number | null>(null);
  const [newPracticeFeedback, setNewPracticeFeedback] = useState('');
  const [isSubmittingPractice, setIsSubmittingPractice] = useState(false);
  
  const { data: events } = useFetch<Event>('events');

  const fetchSheetMusic = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await musicService.getSheetMusicById(musicId);
      if (error) throw error;
      setSheetMusic(data);
      
      const { data: practicesData, error: practicesError } = await musicService.getMusicPractices(musicId);
      if (practicesError) throw practicesError;
      setPractices(practicesData || []);
      
    } catch (error) {
      console.error('Erro ao carregar partitura:', error);
      toast.error('Erro ao carregar partitura');
      router.push('/music');
    } finally {
      setIsLoading(false);
    }
  }, [musicId, router]);

  useEffect(() => {
    fetchSheetMusic();
  }, [fetchSheetMusic]);

  const handleDelete = async () => {
    if (
      !confirm(
        `Tem certeza que quer deletar a partitura "${sheetMusic?.title}"? Essa ação é permanente.`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await musicService.deleteSheetMusic(musicId);
      toast.success('Partitura deletada com sucesso');
      router.push('/music');
    } catch (error) {
      console.error('Erro ao deletar:', error);
      toast.error('Erro ao deletar partitura');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRecordPractice = async () => {
    setIsSubmittingPractice(true);
    try {
        await musicService.recordPractice(
            musicId,
            newPracticeEventId,
            newPracticeStatus,
            newPracticeFeedback
        );
        toast.success('Prática registada com sucesso!');
        setIsPracticeModalOpen(false);
        setNewPracticeFeedback('');
        setNewPracticeEventId(null);
        fetchSheetMusic(); // Refresh practices
    } catch (error) {
        console.error('Erro ao registar prática:', error);
        toast.error('Erro ao registar prática');
    } finally {
        setIsSubmittingPractice(false);
    }
  };

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando detalhes da partitura...</p>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (!sheetMusic) {
    return (
      <AuthenticatedLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Partitura não encontrada</p>
          <Link href="/music" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
            Voltar para Reportório
          </Link>
        </div>
      </AuthenticatedLayout>
    );
  }

  const getDifficultyLabel = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'Iniciante';
      case 'intermediate':
        return 'Intermédio';
      case 'advanced':
        return 'Avançado';
      default:
        return '-';
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPracticeStatusLabel = (status: string) => {
      switch (status) {
          case 'learning': return 'Aprender';
          case 'rehearsing': return 'A Ensaiar';
          case 'performed': return 'Tocada';
          case 'mastered': return 'Dominada';
          default: return status;
      }
  };

  return (
    <AuthenticatedLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <Link
          href="/music"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para Reportório
        </Link>

        {/* Header com Ações */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{sheetMusic.title}</h1>
            <span
              className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(
                sheetMusic.difficulty_level
              )}`}
            >
              {getDifficultyLabel(sheetMusic.difficulty_level)}
            </span>
          </div>

          <div className="flex gap-2">
            {sheetMusic.file_url && (
              <a
                href={sheetMusic.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg font-medium transition"
                title="Download"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            )}
            <Link
              href={`/music/${musicId}/edit`}
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

        {/* PDF Viewer */}
        {sheetMusic.file_url && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Visualizador de Partitura</h3>
            <PdfViewer fileUrl={sheetMusic.file_url} />
          </div>
        )}

        {/* Informações Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card - Artista */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">
              Artista
            </h3>
            <p className="text-lg font-semibold text-gray-900">
              {sheetMusic.artist || <span className="text-gray-400">-</span>}
            </p>
          </div>

          {/* Card - Compositor */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">
              Compositor
            </h3>
            <p className="text-lg font-semibold text-gray-900">
              {sheetMusic.composer || <span className="text-gray-400">-</span>}
            </p>
          </div>

          {/* Card - Arranjador */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">
              Arranjador
            </h3>
            <p className="text-lg font-semibold text-gray-900">
              {sheetMusic.arranger || <span className="text-gray-400">-</span>}
            </p>
          </div>

          {/* Card - Género */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">
              Género
            </h3>
            <p className="text-lg font-semibold text-gray-900">
              {sheetMusic.genre || <span className="text-gray-400">-</span>}
            </p>
          </div>

          {/* Card - Páginas */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">
              Páginas
            </h3>
            <p className="text-lg font-semibold text-gray-900">
              {sheetMusic.pages || <span className="text-gray-400">-</span>}
            </p>
          </div>

          {/* Card - Tamanho do Ficheiro */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">
              Tamanho do Ficheiro (KB)
            </h3>
            <p className="text-lg font-semibold text-gray-900">
              {sheetMusic.file_size ? `${sheetMusic.file_size} KB` : <span className="text-gray-400">-</span>}
            </p>
          </div>
        </div>

        {/* Tags */}
        {sheetMusic.tags && sheetMusic.tags.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {sheetMusic.tags.map(tag => (
                <span key={tag} className="bg-gray-200 text-gray-800 px-2 py-1 rounded-md text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Descrição */}
        {sheetMusic.description && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">
              Descrição
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap">{sheetMusic.description}</p>
          </div>
        )}

        {/* Histórico de Práticas */}
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <History className="w-6 h-6 text-indigo-600" /> Histórico de Práticas
                </h3>
                <button
                    onClick={() => setIsPracticeModalOpen(true)}
                    className="inline-flex items-center gap-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-1 rounded-lg text-sm transition"
                >
                    <Plus className="w-4 h-4" /> Registar
                </button>
            </div>
            
            {practices.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                    {practices.map((practice) => (
                        <li key={practice.id} className="py-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mb-1 ${
                                        practice.status === 'mastered' ? 'bg-green-100 text-green-800' :
                                        practice.status === 'performed' ? 'bg-blue-100 text-blue-800' :
                                        practice.status === 'rehearsing' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {getPracticeStatusLabel(practice.status)}
                                    </span>
                                    {practice.event && (
                                        <p className="text-sm text-gray-600">
                                            Evento: <Link href={`/events/${practice.event_id}`} className="text-blue-600 hover:underline">{practice.event.title}</Link>
                                        </p>
                                    )}
                                    {practice.feedback && (
                                        <p className="text-sm text-gray-700 mt-1 italic">"{practice.feedback}"</p>
                                    )}
                                </div>
                                <span className="text-xs text-gray-500">
                                    {practice.practiced_at ? new Date(practice.practiced_at).toLocaleDateString('pt-PT') : '-'}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500 text-sm">Nenhum registo de prática encontrado.</p>
            )}
        </div>

        {/* Datas */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600 space-y-1">
          <p>
            <strong>Adicionado por:</strong>{' '}
            {sheetMusic.added_by || <span className="text-gray-400">N/A</span>}
          </p>
          <p>
            <strong>Criado:</strong>{' '}
            {new Date(sheetMusic.created_at).toLocaleDateString('pt-PT')}
          </p>
          <p>
            <strong>Última atualização:</strong>{' '}
            {new Date(sheetMusic.updated_at).toLocaleDateString('pt-PT')}
          </p>
        </div>
      </div>

      {/* Practice Modal */}
      {isPracticeModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
              <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full relative">
                  <button onClick={() => setIsPracticeModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                      <span className="sr-only">Fechar</span>
                      <span aria-hidden="true">&times;</span>
                  </button>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                      Registar Prática
                  </h2>

                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                          <select 
                              value={newPracticeStatus} 
                              onChange={(e) => setNewPracticeStatus(e.target.value)}
                              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                          >
                              <option value="learning">Aprender</option>
                              <option value="rehearsing">A Ensaiar</option>
                              <option value="performed">Tocada (Performance)</option>
                              <option value="mastered">Dominada</option>
                          </select>
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Evento (Opcional)</label>
                          <select 
                              value={newPracticeEventId || ''} 
                              onChange={(e) => setNewPracticeEventId(e.target.value ? Number(e.target.value) : null)}
                              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                          >
                              <option value="">Nenhum evento específico</option>
                              {events?.map(event => (
                                  <option key={event.id} value={event.id}>{event.title} ({new Date(event.event_date).toLocaleDateString()})</option>
                              ))}
                          </select>
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Feedback / Notas</label>
                          <textarea 
                              value={newPracticeFeedback} 
                              onChange={(e) => setNewPracticeFeedback(e.target.value)}
                              placeholder="O que correu bem? O que precisa de melhorar?"
                              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                              rows={3}
                          />
                      </div>

                      <button
                          onClick={handleRecordPractice}
                          disabled={isSubmittingPractice}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
                      >
                          {isSubmittingPractice ? 'Registando...' : 'Registar'}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </AuthenticatedLayout>
  );
}
