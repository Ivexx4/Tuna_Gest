'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, UploadCloud } from 'lucide-react';
import { sheetMusicSchema, SheetMusicFormData } from '@/lib/schemas';
import { SheetMusic, InstrumentSection } from '@/types/database';
import { useFetch } from '@/hooks'; // Import useFetch

interface MusicFormProps {
  initialData?: SheetMusic;
  onSubmit: (data: SheetMusicFormData, pdfFile?: File) => Promise<void>; // Modified to accept pdfFile
  isLoading?: boolean;
  onCancel?: () => void;
}

export default function MusicForm({
  initialData,
  onSubmit,
  isLoading,
  onCancel,
}: MusicFormProps) {
  const { data: sections } = useFetch<InstrumentSection>('sections'); // Fetch sections

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<SheetMusicFormData>({
    resolver: zodResolver(sheetMusicSchema),
    defaultValues: {
      title: initialData?.title || '',
      artist: initialData?.artist || '',
      composer: initialData?.composer || '',
      arranger: initialData?.arranger || '',
      description: initialData?.description || '',
      genre: initialData?.genre || '',
      difficulty_level: initialData?.difficulty_level || undefined,
      file_url: initialData?.file_url || '',
      file_size: initialData?.file_size || undefined,
      pages: initialData?.pages || undefined,
      added_by: initialData?.added_by || '',
      tags: initialData?.tags || [],
      required_sections: initialData?.required_sections || [], // Initialize as empty array
    },
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(
    initialData?.file_url || null
  );

  useEffect(() => {
    if (initialData?.file_url) {
      setPdfPreviewUrl(initialData.file_url);
    }
  }, [initialData?.file_url]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPdfPreviewUrl(URL.createObjectURL(file));
      setValue('file_url', '');
    } else {
      setSelectedFile(null);
      setPdfPreviewUrl(initialData?.file_url || null);
    }
  };

  const handleFormSubmit = async (data: SheetMusicFormData) => {
    try {
      // Process tags string to array
      let processedTags: string[] | undefined = undefined;
      // Note: react-hook-form handles tags as an array if properly bound, but if it's a simple text input:
      // Assuming it's a simple text input for comma-separated tags
      // If it's already an array, this might need adjustment based on how the input is bound
      if (typeof data.tags === 'string') {
          processedTags = (data.tags as string).split(',').map(tag => tag.trim()).filter(tag => tag);
      } else if (Array.isArray(data.tags)) {
          processedTags = data.tags;
      }

      const submissionData = { ...data, tags: processedTags };

      await onSubmit(submissionData, selectedFile || undefined);
      reset();
      setSelectedFile(null);
      setPdfPreviewUrl(null);
    } catch (error) {
      console.error('Erro ao submeter:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Título */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Título *
        </label>
        <input
          type="text"
          {...register('title')}
          placeholder="Ex: Gaudeamus Igitur"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
            errors.title
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 bg-white'
          }`}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* Artista e Compositor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Artista
          </label>
          <input
            type="text"
            {...register('artist')}
            placeholder="Ex: Vários"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
              errors.artist
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 bg-white'
            }`}
          />
          {errors.artist && (
            <p className="mt-1 text-sm text-red-600">{errors.artist.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Compositor
          </label>
          <input
            type="text"
            {...register('composer')}
            placeholder="Ex: Desconhecido"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
              errors.composer
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 bg-white'
            }`}
          />
          {errors.composer && (
            <p className="mt-1 text-sm text-red-600">{errors.composer.message}</p>
          )}
        </div>
      </div>

      {/* Arranjador e Género */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Arranjador
          </label>
          <input
            type="text"
            {...register('arranger')}
            placeholder="Ex: João Silva"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
              errors.arranger
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 bg-white'
            }`}
          />
          {errors.arranger && (
            <p className="mt-1 text-sm text-red-600">{errors.arranger.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Género
          </label>
          <input
            type="text"
            {...register('genre')}
            placeholder="Ex: Clássico, Popular"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
              errors.genre
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 bg-white'
            }`}
          />
          {errors.genre && (
            <p className="mt-1 text-sm text-red-600">{errors.genre.message}</p>
          )}
        </div>
      </div>

      {/* Descrição */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descrição
        </label>
        <textarea
          {...register('description')}
          placeholder="Notas sobre a partitura, instrumentação, etc."
          rows={3}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none ${
            errors.description
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 bg-white'
          }`}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Dificuldade e Páginas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nível de Dificuldade
          </label>
          <select
            {...register('difficulty_level')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
              errors.difficulty_level
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 bg-white'
            }`}
          >
            <option value="">Selecionar</option>
            <option value="beginner">Iniciante</option>
            <option value="intermediate">Intermédio</option>
            <option value="advanced">Avançado</option>
          </select>
          {errors.difficulty_level && (
            <p className="mt-1 text-sm text-red-600">
              {errors.difficulty_level.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Número de Páginas
          </label>
          <input
            type="number"
            {...register('pages', { valueAsNumber: true })}
            placeholder="Ex: 10"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
              errors.pages
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 bg-white'
            }`}
          />
          {errors.pages && (
            <p className="mt-1 text-sm text-red-600">{errors.pages.message}</p>
          )}
        </div>
      </div>

      {/* Required Sections */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seções Requeridas
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {sections?.map((section) => (
            <div key={section.id} className="flex items-center">
              <input
                type="checkbox"
                id={`section-${section.id}`}
                value={section.id}
                {...register('required_sections', { valueAsNumber: true })}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor={`section-${section.id}`}
                className="ml-2 text-sm text-gray-900"
              >
                {section.display_name}
              </label>
            </div>
          ))}
        </div>
        {errors.required_sections && (
          <p className="mt-1 text-sm text-red-600">
            {errors.required_sections.message}
          </p>
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags (separadas por vírgula)
        </label>
        <input
          type="text"
          {...register('tags')}
          placeholder="Ex: Natal, Serenata, Instrumental"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
            errors.tags
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 bg-white'
          }`}
          // If initialData.tags is an array, we need to join it for the input
          defaultValue={initialData?.tags?.join(', ') || ''}
        />
        {errors.tags && (
          <p className="mt-1 text-sm text-red-600">{errors.tags.message}</p>
        )}
      </div>

      {/* Upload de PDF */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload de PDF
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            {pdfPreviewUrl ? (
              <a href={pdfPreviewUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center justify-center gap-2">
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                Ver PDF Atual
              </a>
            ) : (
              <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
            )}
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
              >
                <span>Carregar um ficheiro</span>
                <input
                  id="file-upload"
                  type="file"
                  className="sr-only"
                  accept="application/pdf"
                  onChange={handleFileChange}
                />
              </label>
              <p className="pl-1">ou arrastar e soltar</p>
            </div>
            <p className="text-xs text-gray-500">PDF até 10MB</p>
          </div>
        </div>
        {errors.file_url && (
          <p className="mt-1 text-sm text-red-600">
            {errors.file_url.message}
          </p>
        )}
      </div>

      {/* Adicionado Por */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Adicionado Por
        </label>
        <input
          type="text"
          {...register('added_by')}
          placeholder="Ex: Administrador"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
            errors.added_by
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 bg-white'
          }`}
        />
        {errors.added_by && (
          <p className="mt-1 text-sm text-red-600">{errors.added_by.message}</p>
        )}
      </div>

      {/* Botões */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          {isLoading
            ? 'Guardando...'
            : initialData
            ? 'Atualizar Partitura'
            : 'Adicionar Partitura'}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancelar
          </button>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
        <p>
          <strong>Nota:</strong> Campos com * são obrigatórios.
        </p>
      </div>
    </form>
  );
}
