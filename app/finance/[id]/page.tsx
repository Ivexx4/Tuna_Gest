'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { financialService } from '@/lib/services';
import AuthenticatedLayout from '@/app/authenticated-layout';
import { FinancialTransaction } from '@/types/database';
import { toast } from 'sonner';
import Link from 'next/link';
import { ChevronLeft, Edit, Trash2 } from 'lucide-react';

export default function FinancialTransactionDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const transactionId = parseInt(params.id as string);

  const [transaction, setTransaction] = useState<FinancialTransaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTransaction = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await financialService.getTransaction(transactionId);
      if (error) throw error;
      setTransaction(data);
    } catch (error) {
      console.error('Erro ao carregar transação:', error);
      toast.error('Erro ao carregar transação');
      router.push('/finance');
    } finally {
      setIsLoading(false);
    }
  }, [transactionId, router]);

  useEffect(() => {
    fetchTransaction();
  }, [fetchTransaction]);

  const handleDelete = async () => {
    if (
      !confirm(
        `Tem certeza que quer deletar a transação de "${transaction?.description}"? Essa ação é permanente.`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await financialService.deleteTransaction(transactionId);
      toast.success('Transação deletada com sucesso');
      router.push('/finance');
    } catch (error) {
      console.error('Erro ao deletar:', error);
      toast.error('Erro ao deletar transação');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando detalhes da transação...</p>
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

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'text-green-600';
      case 'expense':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'income':
        return 'Receita';
      case 'expense':
        return 'Despesa';
      default:
        return type;
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

        {/* Header com Ações */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Transação: {transaction.description || 'Sem Descrição'}
            </h1>
            <span
              className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${
                transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {getTransactionTypeLabel(transaction.type)}
            </span>
          </div>

          <div className="flex gap-2">
            <Link
              href={`/finance/${transactionId}/edit`}
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

        {/* Informações Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card - Valor */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">
              Valor
            </h3>
            <p className={`text-lg font-semibold ${getTransactionTypeColor(transaction.type)}`}>
              {transaction.type === 'income' ? '+' : '-'} {transaction.amount.toFixed(2)} €
            </p>
          </div>

          {/* Card - Data */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">
              Data
            </h3>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(transaction.transaction_date).toLocaleDateString('pt-PT')}
            </p>
          </div>

          {/* Card - Categoria */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">
              Categoria
            </h3>
            <p className="text-lg font-semibold text-gray-900">
              {transaction.category_id || <span className="text-gray-400">Não Atribuída</span>}
            </p>
          </div>

          {/* Card - Criado Por */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">
              Criado Por
            </h3>
            <p className="text-lg font-semibold text-gray-900">
              {transaction.created_by || <span className="text-gray-400">N/A</span>}
            </p>
          </div>
        </div>

        {/* Descrição Detalhada */}
        {transaction.description && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">
              Descrição Detalhada
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap">{transaction.description}</p>
          </div>
        )}

        {/* Datas */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600 space-y-1">
          <p>
            <strong>Criado:</strong>{' '}
            {new Date(transaction.created_at).toLocaleDateString('pt-PT')}
          </p>
          <p>
            <strong>Última atualização:</strong>{' '}
            {new Date(transaction.updated_at).toLocaleDateString('pt-PT')}
          </p>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
