'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFetch } from '@/hooks';
import { inventoryService } from '@/lib/services';
import { InventoryLoan, InventoryItem, Member } from '@/types/database';
import AuthenticatedLayout from '@/app/authenticated-layout';
import Link from 'next/link';
import { ChevronLeft, AlertTriangle, Package, User, Clock } from 'lucide-react';
import { toast } from 'sonner';

// Extend InventoryLoan to include item and member details
type OverdueLoanWithDetails = InventoryLoan & {
  item: InventoryItem;
  member: Member;
};

export default function OverdueAlertsPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  // Assuming tunaId is 1 for now
  const { data: overdueLoans, loading: loansLoading, error: loansError } = useFetch<OverdueLoanWithDetails>(
    'inventory_loans?select=*,item:inventory_items(*),member:members(*)'
  );

  const [filteredOverdueLoans, setFilteredOverdueLoans] = useState<OverdueLoanWithDetails[]>([]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (overdueLoans && !loansLoading) {
      const now = new Date();
      const filtered = overdueLoans.filter(loan =>
        !loan.return_date && loan.due_date && new Date(loan.due_date) < now
      );
      setFilteredOverdueLoans(filtered);
    }
  }, [overdueLoans, loansLoading]);

  const calculateOverdueDays = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = Math.abs(now.getTime() - due.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (authLoading || loansLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando alertas...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (loansError) {
    toast.error('Erro ao carregar dados para o relatório de sobreprazos');
    return (
      <AuthenticatedLayout>
        <div className="text-center py-12 text-red-600">
          <p>Erro ao carregar alertas: {loansError.message}</p>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <Link
          href="/inventory"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para Inventário
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            ⚠️ Alertas de Sobreprazos
          </h1>
          <p className="text-gray-600 mt-2">
            Itens de inventário com devolução em atraso
          </p>
        </div>

        {/* Overdue Loans Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredOverdueLoans.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Item
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Emprestado a
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Data Empréstimo
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Data Limite
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Dias em Atraso
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOverdueLoans.map((loan) => (
                  <tr key={loan.id} className="bg-red-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <Link href={`/inventory/${loan.item.id}`} className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                        <Package className="w-4 h-4" /> {loan.item.name} ({loan.item.code})
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Link href={`/members/${loan.member.id}`} className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                        <User className="w-4 h-4" /> {loan.member.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(loan.loan_date).toLocaleDateString('pt-PT')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">
                      {loan.due_date ? new Date(loan.due_date).toLocaleDateString('pt-PT') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">
                      {loan.due_date ? calculateOverdueDays(loan.due_date) : '-'} dias
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-green-400" />
              <p className="text-lg">Nenhum item em atraso atualmente. Bom trabalho!</p>
              <p className="text-sm mt-2">
                Todos os itens emprestados estão dentro do prazo de devolução.
              </p>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
