'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { financialService } from '@/lib/services';
import { FinancialFormData } from '@/lib/schemas';
import FinanceForm from '@/components/FinanceForm';
import AuthenticatedLayout from '@/app/authenticated-layout';
import { toast } from 'sonner';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function NewFinanceTransactionPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: FinancialFormData, attachmentFile?: File) => {
    setIsLoading(true);
    let attachmentUrls: string[] | undefined = data.attachments;

    try {
      if (attachmentFile) {
        // Assuming tuna_id is 1 for now
        const { data: uploadData, error: uploadError } = await financialService.uploadAttachment(attachmentFile, 1, 'transactions'); // 'transactions' is the folder
        if (uploadError) {
          throw new Error(uploadError.message || 'Erro ao fazer upload do comprovante.');
        }
        attachmentUrls = uploadData?.publicUrl ? [uploadData.publicUrl] : undefined;
      }

      // Por enquanto, usa tuna_id = 1 (pode ser feito dinâmico depois)
      await financialService.createTransaction({
        tuna_id: 1,
        category_id: data.category_id || undefined,
        amount: data.amount,
        type: data.type,
        description: data.description || undefined,
        transaction_date: data.transaction_date,
        created_by: data.created_by || undefined,
        attachments: attachmentUrls, // Use the uploaded attachment URL(s)
        notes: data.notes || undefined,
      });

      toast.success(`Transação de ${data.amount.toFixed(2)}€ foi criada com sucesso!`);
      router.push('/finance');
    } catch (error: any) {
      console.error('Erro ao criar transação:', error);
      toast.error(error.message || 'Erro ao criar transação');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <Link
          href="/finance"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para Financeiro
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            ➕ Registar Nova Transação
          </h1>
          <p className="text-gray-600 mt-2">
            Adicione uma nova transação financeira (receita ou despesa)
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow p-8">
          <FinanceForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            onCancel={() => router.push('/finance')}
          />
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">💡 Dicas</h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li>✓ Valor, Tipo e Data são obrigatórios</li>
            <li>✓ Descrição e Categoria são opcionais</li>
            <li>✓ Pode fazer upload de um comprovante para a transação</li>
          </ul>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
