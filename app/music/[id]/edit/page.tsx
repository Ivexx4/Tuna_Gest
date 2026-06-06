'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { musicService } from '@/lib/services';
import { SheetMusicFormData } from '@/lib/schemas';
import MusicForm from '@/components/MusicForm';
import AuthenticatedLayout from '@/app/authenticated-layout';
import { SheetMusic } from '@/types/database';
import { toast } from 'sonner';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function EditSheetMusicPage() {
  const router = useRouter();
  const params = useParams();
  const musicId = parseInt(params.id as string);

  const [sheetMusic, setSheetMusic] = useState<SheetMusic | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Carregar dados da partitura
  useEffect(() => {
    const fetchSheetMusic = async () => {
      try {
        const { data, error } = await musicService.getSheetMusicById(musicId);
        if (error) throw error;
        setSheetMusic(data);
      } catch (error) {
        console.error('Erro ao carregar partitura:', error);
        toast.error('Erro ao carregar partitura');
        router.push('/music');
      } finally {
        setIsFetching(false);
      }
    };

    fetchSheetMusic();
  }, [musicId, router]);

  const handleSubmit = async (data: SheetMusicFormData, pdfFile?: File) => {
    setIsLoading(true);
    let fileUrl: string | undefined = data.file_url; // Default to existing URL if any

    try {
      if (pdfFile) {
        // Assuming tuna_id is 1 for now
        const { data: uploadData, error: uploadError } = await musicService.uploadPdf(pdfFile, 1, 'sheet_music');
        if (uploadError) {
          throw new Error(uploadError.message || 'Erro ao fazer upload do PDF.');
        }
        fileUrl = uploadData?.publicUrl;
      } else if (data.file_url === '') {
        // If file_url was cleared in the form
        fileUrl = undefined;
      } else {
        // No new file, keep existing file_url from initialData
        fileUrl = sheetMusic?.file_url;
      }

      await musicService.updateSheetMusic(musicId, {
        title: data.title,
        artist: data.artist || undefined,
        composer: data.composer || undefined,
        arranger: data.arranger || undefined,
        description: data.description || undefined,
        genre: data.genre || undefined,
        difficulty_level: data.difficulty_level || undefined,
        file_url: fileUrl, // Use the uploaded PDF URL or existing one
        file_size: data.file_size || undefined,
        pages: data.pages || undefined,
        tags: data.tags || undefined, // Use tags
        required_sections: data.required_sections || undefined, // Use required_sections
        added_by: data.added_by || undefined,
      });

      toast.success(`${data.title} foi atualizada com sucesso!`);
      router.push(`/music/${musicId}`);
    } catch (error: any) {
      console.error('Erro ao atualizar partitura:', error);
      toast.error(error.message || 'Erro ao atualizar partitura');
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
            <p className="text-gray-600">Carregando dados da partitura...</p>
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

  return (
    <AuthenticatedLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <Link
          href={`/music/${musicId}`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para Detalhes da Partitura
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            ✏️ Editar Partitura
          </h1>
          <p className="text-gray-600 mt-2">
            Atualize as informações de {sheetMusic.title}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow p-8">
          <MusicForm
            initialData={sheetMusic}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            onCancel={() => router.push(`/music/${musicId}`)}
          />
        </div>

        {/* Última atualização */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
          <p>
            <strong>Última atualização:</strong>{' '}
            {new Date(sheetMusic.updated_at).toLocaleDateString('pt-PT')}
          </p>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
