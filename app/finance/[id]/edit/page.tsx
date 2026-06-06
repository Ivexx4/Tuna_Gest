'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { financialService } from '@/lib/services';
import { FinancialFormData } from '@/lib/schemas';
import FinanceForm from '@/components/FinanceForm';
import AuthenticatedLayout from '@/app/authenticated-layout';
import { FinancialTransaction } from '@/types/database';
import { toast } from 'sonner';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function EditFinancialTransactionPage() {
  const router = useRouter();
  const params = useParams();
  const transactionId = parseInt(params.id as string);

  const [transaction, setTransaction] = useState<FinancialTransaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Carregar dados da transação
  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const { data, error } = await financialService.getTransaction(transactionId);
        if (error) throw error;
        setTransaction(data);
      } catch (error) {
        console.error('Erro ao carregar transação:', error);
        toast.error('Erro ao carregar transação');
        router.push('/finance');
      } finally {
        setIsFetching(false);
      }
    };

    fetchTransaction();
  }, [transactionId, router]);

  const handleSubmit = async (data: FinancialFormData, attachmentFile?: File) => {
    setIsLoading(true);
    let attachmentUrls: string[] | undefined = data.attachments; // Default to existing URLs if any

    try {
      if (attachmentFile) {
        // Assuming tuna_id is 1 for now
        const { data: uploadData, error: uploadError } = await financialService.uploadAttachment(attachmentFile, 1, 'transactions');
        if (uploadError) {
          throw new Error(uploadError.message || 'Erro ao fazer upload do comprovante.');
        }
        attachmentUrls = uploadData?.publicUrl ? [uploadData.publicUrl] : undefined;
      } else if (data.attachments && data.attachments.length === 0 && transaction?.attachments && transaction.attachments.length > 0) {
        // If attachments were cleared in the form but existed before
        attachmentUrls = undefined;
      } else {
        // No new file, keep existing attachments from initialData
        attachmentUrls = transaction?.attachments;
      }

      await financialService.updateTransaction(transactionId, {
        category_id: data.category_id || undefined,
        amount: data.amount,
        type: data.type,
        description: data.description || undefined,
        transaction_date: data.transaction_date,
        created_by: data.created_by || undefined,
        attachments: attachmentUrls, // Use the uploaded attachment URL(s) or existing ones
      });

      toast.success(`Transação de ${data.amount.toFixed(2)}€ foi atualizada com sucesso!`);
      router.push(`/finance/${transactionId}`);
    } catch (error: any) {
      console.error('Erro ao atualizar transação:', error);
      toast.error(error.message || 'Erro ao atualizar transação');
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
            <p className="text-gray-600">Carregando dados da transação...</p>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (!transaction) {
    return (
      <AuthenticatedLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Transação não encontrada</p>
          <Link href="/finance" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
            Voltar para Financeiro
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
          href={`/finance/${transactionId}`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para Detalhes da Transação
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            ✏️ Editar Transação
          </h1>
          <p className="text-gray-600 mt-2">
            Atualize as informações da transação de {transaction.description || 'Sem Descrição'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow p-8">
          <FinanceForm
            initialData={transaction}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            onCancel={() => router.push(`/finance/${transactionId}`)}
          />
        </div>

        {/* Última atualização */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
          <p>
            <strong>Última atualização:</strong>{' '}
            {new Date(transaction.updated_at).toLocaleDateString('pt-PT')}
          </p>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
