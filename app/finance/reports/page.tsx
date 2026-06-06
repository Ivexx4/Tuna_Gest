'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFetch } from '@/hooks';
import { financialService } from '@/lib/services';
import { FinancialSummary, FinancialTransaction, FinancialCategory } from '@/types/database';
import AuthenticatedLayout from '@/app/authenticated-layout';
import Link from 'next/link';
import { ChevronLeft, DollarSign, TrendingUp, TrendingDown, PieChart } from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

export default function FinancialReportsPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  // Assuming tuna_id is 1 for now
  const { data: summaryData, loading: summaryLoading, error: summaryError } = useFetch<FinancialSummary>(
    'financial_summary'
  );
  const { data: transactions, loading: transactionsLoading, error: transactionsError } = useFetch<FinancialTransaction>(
    'financial_transactions'
  );
  const { data: categories, loading: categoriesLoading, error: categoriesError } = useFetch<FinancialCategory>(
    'financial_categories'
  );

  const [monthlySummary, setMonthlySummary] = useState<any[]>([]);
  const [categorySummary, setCategorySummary] = useState<any[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (transactions && categories) {
      // Calculate total balance, income, expenses
      const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      setTotalIncome(income);
      setTotalExpenses(expense);
      setTotalBalance(income - expense);

      // Monthly Summary
      const monthlyDataMap = new Map<string, { monthYear: string; income: number; expense: number }>();
      transactions.forEach(t => {
        const date = new Date(t.transaction_date);
        const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        if (!monthlyDataMap.has(monthYear)) {
          monthlyDataMap.set(monthYear, { monthYear, income: 0, expense: 0 });
        }
        const current = monthlyDataMap.get(monthYear)!;
        if (t.type === 'income') {
          current.income += t.amount;
        } else {
          current.expense += t.amount;
        }
      });
      const sortedMonthlyData = Array.from(monthlyDataMap.values()).sort((a, b) => a.monthYear.localeCompare(b.monthYear));
      setMonthlySummary(sortedMonthlyData);

      // Category Summary
      const categoryDataMap = new Map<number, { name: string; value: number; type: 'income' | 'expense' }>();
      transactions.forEach(t => {
        const category = categories.find(c => c.id === t.category_id);
        if (category) {
          if (!categoryDataMap.has(category.id)) {
            categoryDataMap.set(category.id, { name: category.name, value: 0, type: category.type });
          }
          const current = categoryDataMap.get(category.id)!;
          current.value += t.amount;
        }
      });
      setCategorySummary(Array.from(categoryDataMap.values()));
    }
  }, [transactions, categories]);

  if (authLoading || summaryLoading || transactionsLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando relatórios financeiros...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (summaryError || transactionsError || categoriesError) {
    toast.error('Erro ao carregar dados para os relatórios financeiros');
    return (
      <AuthenticatedLayout>
        <div className="text-center py-12 text-red-600">
          <p>Erro ao carregar relatórios: {summaryError?.message || transactionsError?.message || categoriesError?.message}</p>
        </div>
      </AuthenticatedLayout>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919'];

  return (
    <AuthenticatedLayout>
      <div className="max-w-6xl mx-auto space-y-8">
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
          <h1 className="text-3xl font-bold text-gray-900">📈 Relatórios Financeiros</h1>
          <p className="text-gray-600 mt-2">
            Análise detalhada das finanças da tuna
          </p>
        </div>

        {/* Global Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Balanço Total</p>
              <p className={`text-3xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'} mt-2`}>
                {totalBalance.toFixed(2)} €
              </p>
            </div>
            <DollarSign className="w-10 h-10 text-gray-400" />
          </div>

          <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Receitas Totais</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {totalIncome.toFixed(2)} €
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-400" />
          </div>

          <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Despesas Totais</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {totalExpenses.toFixed(2)} €
              </p>
            </div>
            <TrendingDown className="w-10 h-10 text-red-400" />
          </div>
        </div>

        {/* Monthly Income vs Expense Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Receitas vs Despesas Mensais</h2>
          {monthlySummary.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlySummary}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="monthYear" />
                <YAxis />
                <Tooltip formatter={(value: number) => `${value.toFixed(2)} €`} />
                <Legend />
                <Bar dataKey="income" fill="#82ca9d" name="Receitas" />
                <Bar dataKey="expense" fill="#fa8072" name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhum dado de transação para exibir o gráfico mensal.</p>
            </div>
          )}
        </div>

        {/* Category Distribution Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Distribuição por Categoria</h2>
          {categorySummary.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={categorySummary}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categorySummary.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value.toFixed(2)} €`} />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhum dado de categoria para exibir o gráfico de distribuição.</p>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
