'use client';

import Link from 'next/link';
import { Edit, Trash2, Eye } from 'lucide-react';
import { FinancialTransaction } from '@/types/database';

interface FinanceTableProps {
  transactions: FinancialTransaction[];
  onDelete: (id: number) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export default function FinanceTable({
  transactions,
  onDelete,
  isLoading,
  emptyMessage = 'Nenhuma transação encontrada',
}: FinanceTableProps) {
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

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto shadow-md rounded-lg">
      <table className="w-full bg-white">
        <thead className="bg-gray-100 border-b-2 border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Data
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Descrição
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Tipo
            </th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
              Valor
            </th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <tr
              key={transaction.id}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-6 py-4 font-medium text-gray-900">
                {new Date(transaction.transaction_date).toLocaleDateString('pt-PT')}
              </td>
              <td className="px-6 py-4 text-gray-600">
                {transaction.description || '-'}
              </td>
              <td className="px-6 py-4 text-gray-600">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {getTransactionTypeLabel(transaction.type)}
                </span>
              </td>
              <td className={`px-6 py-4 text-right font-bold ${getTransactionTypeColor(transaction.type)}`}>
                {transaction.type === 'income' ? '+' : '-'} {transaction.amount.toFixed(2)} €
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2 justify-end">
                  {/* Ver Detalhes */}
                  <Link
                    href={`/finance/${transaction.id}`}
                    className="inline-flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg text-sm transition"
                    title="Ver detalhes"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  {/* Editar */}
                  <Link
                    href={`/finance/${transaction.id}/edit`}
                    className="inline-flex items-center gap-2 bg-amber-100 hover:bg-amber-200 text-amber-700 px-3 py-1 rounded-lg text-sm transition"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>

                  {/* Deletar */}
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          `Tem certeza que quer deletar a transação de "${transaction.description}"?`
                        )
                      ) {
                        onDelete(transaction.id);
                      }
                    }}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 bg-red-100 hover:bg-red-200 disabled:bg-gray-200 text-red-700 disabled:text-gray-500 px-3 py-1 rounded-lg text-sm transition"
                    title="Deletar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
