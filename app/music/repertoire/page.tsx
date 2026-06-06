'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFetch } from '@/hooks';
import { musicService } from '@/lib/services';
import { SheetMusic, MusicPractice } from '@/types/database';
import AuthenticatedLayout from '@/app/authenticated-layout';
import Link from 'next/link';
import { ChevronLeft, Music, BookOpen, Check, Move } from 'lucide-react';
import { toast } from 'sonner';

type SheetMusicWithLatestPractice = SheetMusic & {
  latest_status?: 'learning' | 'rehearsing' | 'performed' | 'mastered';
  practices?: MusicPractice[]; // <-- ESTA É A LINHA QUE RESOLVE O ERRO
};

export default function RepertoirePage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { data: sheetMusic, loading: musicLoading, refetch: refetchMusic } = useFetch<SheetMusicWithLatestPractice>(
    'sheet_music?select=*,practices:music_practices(status,practiced_at)'
  );

  const [repertoire, setRepertoire] = useState<{
    learning: SheetMusicWithLatestPractice[];
    rehearsing: SheetMusicWithLatestPractice[];
    performed: SheetMusicWithLatestPractice[];
    mastered: SheetMusicWithLatestPractice[];
  }>({ learning: [], rehearsing: [], performed: [], mastered: [] });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (sheetMusic) {
      const categorizedRepertoire = {
        learning: [] as SheetMusicWithLatestPractice[],
        rehearsing: [] as SheetMusicWithLatestPractice[],
        performed: [] as SheetMusicWithLatestPractice[],
        mastered: [] as SheetMusicWithLatestPractice[],
      };

      sheetMusic.forEach(music => {
        if (music.practices && music.practices.length > 0) {
          // Ordenação segura contra valores null ou undefined no practiced_at
          const latestPractice = music.practices.sort((a, b) => {
            const timeA = a.practiced_at ? new Date(a.practiced_at).getTime() : 0;
            const timeB = b.practiced_at ? new Date(b.practiced_at).getTime() : 0;
            return timeB - timeA;
          })[0];
          music.latest_status = latestPractice.status;
        } else {
          music.latest_status = 'learning'; // Default status
        }

        if (categorizedRepertoire[music.latest_status]) {
          categorizedRepertoire[music.latest_status].push(music);
        } else {
          categorizedRepertoire.learning.push(music); // Fallback
        }
      });

      setRepertoire(categorizedRepertoire);
    }
  }, [sheetMusic]);

  const handleMoveStatus = async (musicId: number, newStatus: 'learning' | 'rehearsing' | 'performed' | 'mastered') => {
    try {
      await musicService.recordPractice(musicId, null, newStatus, 'Status alterado no quadro de repertório.');
      toast.success('Status da partitura atualizado!');
      refetchMusic();
    } catch (error) {
      console.error('Erro ao mover partitura:', error);
      toast.error('Erro ao atualizar status da partitura.');
    }
  };

  if (authLoading || musicLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando repertório...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const renderColumn = (title: string, status: 'learning' | 'rehearsing' | 'performed' | 'mastered', items: SheetMusicWithLatestPractice[]) => (
    <div className="bg-gray-100 rounded-lg p-4 flex-1">
      <h2 className="font-bold text-lg mb-4 text-gray-800">{title} ({items.length})</h2>
      <div className="space-y-3">
        {items.map(item => (
          <div key={item.id} className="bg-white p-3 rounded-md shadow">
            <Link href={`/music/${item.id}`} className="font-semibold text-blue-600 hover:underline">
              {item.title}
            </Link>
            <p className="text-sm text-gray-500">{item.artist || 'Artista Desconhecido'}</p>
            <div className="mt-2">
              <select
                value={item.latest_status}
                onChange={(e) => handleMoveStatus(item.id, e.target.value as any)}
                className="w-full text-xs p-1 border border-gray-300 rounded"
              >
                <option value="learning">Aprender</option>
                <option value="rehearsing">A Ensaiar</option>
                <option value="performed">Tocada</option>
                <option value="mastered">Dominada</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <AuthenticatedLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <Link
          href="/music"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para Biblioteca
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🎼 Repertório Ativo</h1>
          <p className="text-gray-600 mt-1">
            Visualize e gerencie o status das partituras em prática
          </p>
        </div>

        {/* Kanban Board */}
        <div className="flex flex-col md:flex-row gap-4">
          {renderColumn('A Aprender', 'learning', repertoire.learning)}
          {renderColumn('A Ensaiar', 'rehearsing', repertoire.rehearsing)}
          {renderColumn('Tocadas', 'performed', repertoire.performed)}
          {renderColumn('Dominadas', 'mastered', repertoire.mastered)}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
