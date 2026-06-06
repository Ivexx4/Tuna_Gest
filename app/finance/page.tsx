'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFetch, useDelete } from '@/hooks';
import { financialService } from '@/lib/services';
import { FinancialTransaction, FinancialCategory } from '@/types/database';
import AuthenticatedLayout from '@/app/authenticated-layout';
import FinanceTable from '@/components/FinanceTable';
import { Plus, Search, Download } from 'lucide-react'; // Import Download icon
import Link from 'next/link';
import { toast } from 'sonner';

export default function FinancePage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { data: transactions, loading, error, refetch } = useFetch<FinancialTransaction>(
    'financial_transactions'
  );
  const { data: categories } = useFetch<FinancialCategory>('financial_categories'); // Fetch categories
  const { execute: deleteTransaction, loading: deleteLoading } = useDelete('financial_transactions');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(''); // State for category filter
  const [startDate, setStartDate] = useState<string>(''); // State for start date filter
  const [endDate, setEndDate] = useState<string>(''); // State for end date filter
  const [filteredTransactions, setFilteredTransactions] = useState<FinancialTransaction[]>([]);

  // Redireciona se não autenticado
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Filtrar transações
  useEffect(() => {
    if (!transactions) return;

    let currentFilteredTransactions = transactions;

    // Filter by search term
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      currentFilteredTransactions = currentFilteredTransactions.filter(
        (transaction) =>
          transaction.description?.toLowerCase().includes(term) ||
          transaction.type.toLowerCase().includes(term)
      );
    }

    // Filter by category
    if (selectedCategory !== '') {
      currentFilteredTransactions = currentFilteredTransactions.filter(
        (transaction) => transaction.category_id === parseInt(selectedCategory)
      );
    }

    // Filter by date range
    if (startDate) {
      currentFilteredTransactions = currentFilteredTransactions.filter(
        (transaction) => new Date(transaction.transaction_date) >= new Date(startDate)
      );
    }
    if (endDate) {
      currentFilteredTransactions = currentFilteredTransactions.filter(
        (transaction) => new Date(transaction.transaction_date) <= new Date(endDate)
      );
    }

    setFilteredTransactions(currentFilteredTransactions);
  }, [searchTerm, transactions, selectedCategory, startDate, endDate]);

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que quer deletar esta transação?')) {
      return;
    }
    try {
      await deleteTransaction(id);
      toast.success('Transação deletada com sucesso!');
      refetch();
    } catch (err) {
      toast.error('Erro ao deletar transação');
      console.error(err);
    }
  };

  const exportToCsv = () => {
    if (!filteredTransactions || filteredTransactions.length === 0) {
      toast.info('Nenhuma transação para exportar.');
      return;
    }

    const headers = [
      'ID',
      'Data',
      'Tipo',
      'Categoria',
      'Descrição',
      'Valor',
      'Criado Por',
      'URL Comprovante',
    ];

    const csvContent =
      headers.join(',') +
      '\n' +
      filteredTransactions
        .map((transaction) => {
          const categoryName =
            categories?.find((cat) => cat.id === transaction.category_id)?.name ||
            'N/A';
          const attachmentUrl =
            transaction.attachments && transaction.attachments.length > 0
              ? transaction.attachments[0]
              : '';

          return [
            transaction.id,
            new Date(transaction.transaction_date).toLocaleDateString('pt-PT'),
            transaction.type === 'income' ? 'Receita' : 'Despesa',
            categoryName,
            `"${transaction.description?.replace(/"/g, '""') || ''}"`, // Handle commas and quotes in description
            transaction.amount.toFixed(2),
            transaction.created_by || '',
            attachmentUrl,
          ].join(',');
        })
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'transacoes_financeiras.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Transações exportadas para CSV!');
    } else {
      toast.error('O seu navegador não suporta a exportação de CSV.');
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const totalIncome = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) || 0;
  const totalExpense = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) || 0;
  const balance = totalIncome - totalExpense;

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">💰 Financeiro</h1>
            <p className="text-gray-600 mt-1">
              Gerencie as finanças da tuna
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportToCsv}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              <Download className="w-5 h-5" />
              Exportar CSV
            </button>
            <Link
              href="/finance/new"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
              Nova Transação
            </Link>
          </div>
        </div>

        {/* Barra de Pesquisa e Filtros */}
        <div className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex items-center gap-3 bg-gray-100 rounded-lg px-4">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Pesquisa por descrição ou tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent py-2 outline-none"
            />
          </div>

          {/* Filter by Category */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          >
            <option value="">Todas as Categorias</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name} ({category.type === 'income' ? 'Receita' : 'Despesa'})
              </option>
            ))}
          </select>

          {/* Date Range Filter */}
          <div className="flex gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              title="Data de Início"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              title="Data de Fim"
            />
          </div>
        </div>

        {/* Info Card */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            Erro ao carregar transações: {error.message}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Receitas Totais</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {totalIncome.toFixed(2)} €
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Despesas Totais</p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {totalExpense.toFixed(2)} €
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Balanço</p>
            <p className={`text-3xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'} mt-2`}>
              {balance.toFixed(2)} €
            </p>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p>Carregando transações...</p>
            </div>
          ) : (
            <FinanceTable
              transactions={filteredTransactions}
              onDelete={handleDelete}
              isLoading={deleteLoading}
              emptyMessage={
                searchTerm || selectedCategory || startDate || endDate
                  ? 'Nenhuma transação encontrada com os filtros aplicados'
                  : 'Nenhuma transação registada ainda. Começa por criar uma!'
              }
            />
          )}
        </div>

        {/* Info Box */}
        {transactions?.length === 0 && !loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <h3 className="font-semibold text-blue-900 mb-2">
              Começa a registar as tuas transações financeiras
            </h3>
            <p className="text-blue-700 mb-4">
              Clica no botão acima para criar a primeira transação
            </p>
            <Link
              href="/finance/new"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              Criar Primeira Transação
            </Link>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
