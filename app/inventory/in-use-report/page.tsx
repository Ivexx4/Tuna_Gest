'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFetch } from '@/hooks';
import { inventoryService } from '@/lib/services';
import { CurrentInventoryLoan } from '@/types/database';
import AuthenticatedLayout from '@/app/authenticated-layout';
import Link from 'next/link';
import { ChevronLeft, Package, User, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function InUseReportPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { data: currentLoans, loading: loansLoading, error: loansError } = useFetch<CurrentInventoryLoan>(
    'current_inventory_loans'
  );

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const formatDaysWithMember = (days: number) => {
    const totalSeconds = days; // days_with_member is an interval, often represented in seconds in JS from Supabase
    const totalMinutes = totalSeconds / 60;
    const totalHours = totalMinutes / 60;
    const totalDays = totalHours / 24;

    if (totalDays >= 1) {
      return `${Math.floor(totalDays)} dias`;
    } else if (totalHours >= 1) {
      return `${Math.floor(totalHours)} horas`;
    } else if (totalMinutes >= 1) {
      return `${Math.floor(totalMinutes)} minutos`;
    } else {
      return `${Math.floor(totalSeconds)} segundos`;
    }
  };

  if (authLoading || loansLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando relatório...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (loansError) {
    toast.error('Erro ao carregar dados para o relatório de itens em uso');
    return (
      <AuthenticatedLayout>
        <div className="text-center py-12 text-red-600">
          <p>Erro ao carregar relatório: {loansError.message}</p>
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
            📊 Relatório de Itens em Uso
          </h1>
          <p className="text-gray-600 mt-2">
            Visão geral dos itens atualmente emprestados e a quem
          </p>
        </div>

        {/* Report Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {currentLoans && currentLoans.length > 0 ? (
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
                    Condição
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Tempo com Membro
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentLoans.map((loan) => (
                  <tr key={loan.loan_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <Link href={`/inventory/${loan.item_id}`} className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                        <Package className="w-4 h-4" /> {loan.item_name} ({loan.code})
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Link href={`/members/${loan.member_id}`} className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                        <User className="w-4 h-4" /> {loan.member_name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(loan.loan_date).toLocaleDateString('pt-PT')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {loan.condition_on_loan || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      {formatDaysWithMember(loan.days_with_member)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg">Nenhum item em uso atualmente.</p>
              <p className="text-sm mt-2">
                Empreste um item a um membro para que apareça neste relatório.
              </p>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
