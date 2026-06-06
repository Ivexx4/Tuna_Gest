'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, UploadCloud } from 'lucide-react';
import { financialTransactionSchema, FinancialFormData } from '@/lib/schemas';
import { FinancialTransaction } from '@/types/database';

interface FinanceFormProps {
  initialData?: FinancialTransaction;
  onSubmit: (data: FinancialFormData, attachmentFile?: File) => Promise<void>; // Modified to accept attachmentFile
  isLoading?: boolean;
  onCancel?: () => void;
}

export default function FinanceForm({
  initialData,
  onSubmit,
  isLoading,
  onCancel,
}: FinanceFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue, // Added setValue to manually set form values
  } = useForm<FinancialFormData>({
    resolver: zodResolver(financialTransactionSchema),
    defaultValues: {
      category_id: initialData?.category_id || undefined,
      amount: initialData?.amount || 0,
      type: initialData?.type || 'expense',
      description: initialData?.description || '',
      transaction_date: initialData?.transaction_date
        ? new Date(initialData.transaction_date).toISOString().slice(0, 10)
        : '',
      created_by: initialData?.created_by || '',
      attachments: initialData?.attachments || [], // Initialize attachments
    },
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [attachmentPreviewUrl, setAttachmentPreviewUrl] = useState<string | null>(
    initialData?.attachments && initialData.attachments.length > 0 ? initialData.attachments[0] : null
  );

  useEffect(() => {
    if (initialData?.attachments && initialData.attachments.length > 0) {
      setAttachmentPreviewUrl(initialData.attachments[0]);
    }
  }, [initialData?.attachments]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setAttachmentPreviewUrl(URL.createObjectURL(file));
      // Clear attachments from form data if a new file is selected
      setValue('attachments', []);
    } else {
      setSelectedFile(null);
      setAttachmentPreviewUrl(initialData?.attachments && initialData.attachments.length > 0 ? initialData.attachments[0] : null);
    }
  };

  const handleFormSubmit = async (data: FinancialFormData) => {
    try {
      await onSubmit(data, selectedFile || undefined); // Pass selectedFile
      reset();
      setSelectedFile(null);
      setAttachmentPreviewUrl(null);
    } catch (error) {
      console.error('Erro ao submeter:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Tipo de Transação */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Transação *
        </label>
        <select
          {...register('type')}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
            errors.type
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 bg-white'
          }`}
        >
          <option value="expense">Despesa</option>
          <option value="income">Receita</option>
        </select>
        {errors.type && (
          <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
        )}
      </div>

      {/* Valor e Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Valor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Valor *
          </label>
          <input
            type="number"
            step="0.01"
            {...register('amount', { valueAsNumber: true })}
            placeholder="Ex: 50.00"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
              errors.amount
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 bg-white'
            }`}
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
          )}
        </div>

        {/* Data da Transação */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data da Transação *
          </label>
          <input
            type="date"
            {...register('transaction_date')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
              errors.transaction_date
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 bg-white'
            }`}
          />
          {errors.transaction_date && (
            <p className="mt-1 text-sm text-red-600">
              {errors.transaction_date.message}
            </p>
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
          placeholder="Detalhes sobre a transação..."
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

      {/* Categoria ID */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Categoria (ID)
        </label>
        <input
          type="number"
          {...register('category_id', { valueAsNumber: true })}
          placeholder="Ex: 1"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
            errors.category_id
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 bg-white'
          }`}
        />
        {errors.category_id && (
          <p className="mt-1 text-sm text-red-600">
            {errors.category_id.message}
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          ID da categoria financeira (opcional)
        </p>
      </div>

      {/* Criado Por */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Criado Por
        </label>
        <input
          type="text"
          {...register('created_by')}
          placeholder="Ex: João Silva"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
            errors.created_by
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 bg-white'
          }`}
        />
        {errors.created_by && (
          <p className="mt-1 text-sm text-red-600">
            {errors.created_by.message}
          </p>
        )}
      </div>

      {/* Upload de Comprovante */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload de Comprovante (Opcional)
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            {attachmentPreviewUrl ? (
              <a href={attachmentPreviewUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center justify-center gap-2">
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                Ver Comprovante Atual
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
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                />
              </label>
              <p className="pl-1">ou arrastar e soltar</p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, PDF até 10MB</p>
          </div>
        </div>
        {errors.attachments && (
          <p className="mt-1 text-sm text-red-600">
            {errors.attachments.message}
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
            ? 'Atualizar Transação'
            : 'Criar Transação'}
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
