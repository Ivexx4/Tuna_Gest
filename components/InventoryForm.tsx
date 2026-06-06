'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, UploadCloud } from 'lucide-react';
import { inventorySchema, InventoryFormData } from '@/lib/schemas';
import { InventoryItem } from '@/types/database';

interface InventoryFormProps {
  initialData?: InventoryItem;
  onSubmit: (data: InventoryFormData, imageFile?: File) => Promise<void>; // Modified to accept imageFile
  isLoading?: boolean;
  onCancel?: () => void;
}

export default function InventoryForm({
  initialData,
  onSubmit,
  isLoading,
  onCancel,
}: InventoryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue, // Added setValue to manually set form values
  } = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      item_type: initialData?.item_type || 'instrument',
      code: initialData?.code || '',
      purchase_date: initialData?.purchase_date || '',
      purchase_price: initialData?.purchase_price || undefined,
      status: initialData?.status || 'available',
      section_id: initialData?.section_id || undefined,
      image_url: initialData?.image_url || '',
    },
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(
    initialData?.image_url || null
  );

  useEffect(() => {
    if (initialData?.image_url) {
      setImagePreviewUrl(initialData.image_url);
    }
  }, [initialData?.image_url]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
      // Clear image_url from form data if a new file is selected
      setValue('image_url', '');
    } else {
      setSelectedFile(null);
      setImagePreviewUrl(initialData?.image_url || null);
    }
  };

  const handleFormSubmit = async (data: InventoryFormData) => {
    try {
      await onSubmit(data, selectedFile || undefined); // Pass selectedFile
      reset();
      setSelectedFile(null);
      setImagePreviewUrl(null);
    } catch (error) {
      console.error('Erro ao submeter:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Nome */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nome *
        </label>
        <input
          type="text"
          {...register('name')}
          placeholder="Ex: Guitarra Clássica"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
            errors.name
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 bg-white'
          }`}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Descrição */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descrição
        </label>
        <textarea
          {...register('description')}
          placeholder="Detalhes sobre o item..."
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

      {/* Dois por linha */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tipo de Item */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Item *
          </label>
          <select
            {...register('item_type')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
              errors.item_type
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 bg-white'
            }`}
          >
            <option value="instrument">Instrumento</option>
            <option value="costume">Traje</option>
            <option value="equipment">Equipamento</option>
            <option value="other">Outro</option>
          </select>
          {errors.item_type && (
            <p className="mt-1 text-sm text-red-600">
              {errors.item_type.message}
            </p>
          )}
        </div>

        {/* Código */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Código *
          </label>
          <input
            type="text"
            {...register('code')}
            placeholder="Ex: INST-001"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
              errors.code
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 bg-white'
            }`}
          />
          {errors.code && (
            <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
          )}
        </div>
      </div>

      {/* Três por linha */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Data de Compra */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data de Compra
          </label>
          <input
            type="date"
            {...register('purchase_date')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
              errors.purchase_date
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 bg-white'
            }`}
          />
          {errors.purchase_date && (
            <p className="mt-1 text-sm text-red-600">
              {errors.purchase_date.message}
            </p>
          )}
        </div>

        {/* Preço de Compra */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preço de Compra
          </label>
          <input
            type="number"
            step="0.01"
            {...register('purchase_price', { valueAsNumber: true })}
            placeholder="Ex: 150.00"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
              errors.purchase_price
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 bg-white'
            }`}
          />
          {errors.purchase_price && (
            <p className="mt-1 text-sm text-red-600">
              {errors.purchase_price.message}
            </p>
          )}
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status *
          </label>
          <select
            {...register('status')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
              errors.status
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 bg-white'
            }`}
          >
            <option value="available">Disponível</option>
            <option value="in_use">Em Uso</option>
            <option value="damaged">Danificado</option>
            <option value="lost">Perdido</option>
            <option value="decommissioned">Desativado</option>
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>
      </div>

      {/* Seção ID */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seção (ID)
        </label>
        <input
          type="number"
          {...register('section_id', { valueAsNumber: true })}
          placeholder="Ex: 1"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
            errors.section_id
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 bg-white'
          }`}
        />
        {errors.section_id && (
          <p className="mt-1 text-sm text-red-600">
            {errors.section_id.message}
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          ID da seção à qual o item pertence (opcional)
        </p>
      </div>

      {/* Upload de Imagem */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload de Imagem
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            {imagePreviewUrl ? (
              <img
                src={imagePreviewUrl}
                alt="Pré-visualização da imagem"
                className="mx-auto h-24 w-24 object-cover rounded-md"
              />
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
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
              <p className="pl-1">ou arrastar e soltar</p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF até 10MB</p>
          </div>
        </div>
        {errors.image_url && (
          <p className="mt-1 text-sm text-red-600">
            {errors.image_url.message}
          </p>
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
            ? 'Atualizar Item'
            : 'Criar Item'}
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
