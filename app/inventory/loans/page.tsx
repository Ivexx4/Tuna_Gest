'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFetch } from '@/hooks';
import { inventoryService } from '@/lib/services';
import { InventoryLoan, InventoryItem, Member } from '@/types/database';
import AuthenticatedLayout from '@/app/authenticated-layout';
import Link from 'next/link';
import { ChevronLeft, Package, User, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

// Extend InventoryLoan to include item and member details
type InventoryLoanWithDetails = InventoryLoan & {
  item: InventoryItem;
  member: Member;
};

export default function InventoryLoansPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { data: loans, loading: loansLoading, refetch: refetchLoans } = useFetch<InventoryLoanWithDetails>(
    'inventory_loans?select=*,item:inventory_items(*),member:members(*)'
  );

  const [isReturning, setIsReturning] = useState<number | null>(null); // loanId being returned

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleReturnItem = async (loanId: number, currentStatus: string) => {
    if (currentStatus !== 'in_use') {
      toast.info('Este item não está atualmente emprestado.');
      return;
    }

    const condition = prompt('Qual a condição do item na devolução? (excelente, good, fair, poor)');
    if (condition === null) return; // User cancelled

    setIsReturning(loanId);
    try {
      // Assuming a user ID can be passed for 'returnedBy'
      await inventoryService.returnLoan(loanId, condition || undefined, 'current_user_id'); // Replace 'current_user_id' with actual user ID
      toast.success('Item devolvido com sucesso!');
      refetchLoans();
    } catch (error) {
      console.error('Erro ao devolver item:', error);
      toast.error('Erro ao devolver item.');
    } finally {
      setIsReturning(null);
    }
  };

  if (authLoading || loansLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando histórico de empréstimos...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
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
            📚 Histórico de Empréstimos
          </h1>
          <p className="text-gray-600 mt-2">
            Gerencie e visualize todos os empréstimos de itens do inventário
          </p>
        </div>

        {/* Loans Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loans && loans.length > 0 ? (
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
                    Data Devolução
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Condição
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loans.map((loan) => (
                  <tr key={loan.id}>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {loan.return_date ? new Date(loan.return_date).toLocaleDateString('pt-PT') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {loan.condition_on_loan} {loan.return_date && ` / ${loan.condition_on_return}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {!loan.return_date && (
                        <button
                          onClick={() => handleReturnItem(loan.id, loan.item.status)}
                          disabled={isReturning === loan.id}
                          className="inline-flex items-center gap-1 bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-lg text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isReturning === loan.id ? 'Devolvendo...' : <><CheckCircle className="w-4 h-4" /> Devolver</>}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg">Nenhum empréstimo registado ainda.</p>
              <p className="text-sm mt-2">
                Empreste um item a um membro para começar a ver o histórico aqui.
              </p>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
