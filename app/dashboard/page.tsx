'use client';

import { useAuth, useFetch } from '@/hooks';
import AuthenticatedLayout from '@/app/authenticated-layout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  memberService,
  eventService,
  inventoryService,
  financialService,
  musicService,
  userService,
} from '@/lib/services';
import {
  Member,
  Event,
  InventoryItem,
  FinancialTransaction,
  SheetMusic,
  User,
} from '@/types/database';
import {
  Users,
  Calendar,
  Package,
  Landmark,
  Music,
  UserCog,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // Fetch data for various modules
  const { data: members, loading: membersLoading } = useFetch<Member>(
    'members',
    () => memberService.getMembers(1) // Assuming tuna_id = 1 for now
  );
  const { data: events, loading: eventsLoading } = useFetch<Event>(
    'events',
    () => eventService.getEvents(1) // Assuming tuna_id = 1 for now
  );
  const { data: inventoryItems, loading: inventoryLoading } = useFetch<InventoryItem>(
    'inventory_items',
    () => inventoryService.getItems(1) // Assuming tuna_id = 1 for now
  );
  const { data: financialTransactions, loading: financeLoading } = useFetch<FinancialTransaction>(
    'financial_transactions',
    () => financialService.getTransactions(1) // Assuming tuna_id = 1 for now
  );
  const { data: sheetMusic, loading: musicLoading } = useFetch<SheetMusic>(
    'sheet_music',
    () => musicService.getSheetMusic(1) // Assuming tuna_id = 1 for now
  );
  const { data: users, loading: usersLoading } = useFetch<User>(
    'users',
    () => userService.getUsers()
  );

  // Redireciona para login se não está autenticado
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

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
    return null; // Volta o hook de redirect
  }

  const allLoading =
    membersLoading ||
    eventsLoading ||
    inventoryLoading ||
    financeLoading ||
    musicLoading ||
    usersLoading;

  // Calculate stats
  const totalMembers = members?.length || 0;
  const activeMembers = members?.filter((m) => m.status === 'active').length || 0;

  const totalEvents = events?.length || 0;
  const upcomingEvents =
    events?.filter((e) => new Date(e.event_date) >= new Date()).length || 0;

  const totalInventoryItems = inventoryItems?.length || 0;
  const availableItems =
    inventoryItems?.filter((item) => item.status === 'available').length || 0;

  const totalIncome =
    financialTransactions
      ?.filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0) || 0;
  const totalExpenses =
    financialTransactions
      ?.filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0) || 0;
  const balance = totalIncome - totalExpenses;

  const totalSheetMusic = sheetMusic?.length || 0;

  const totalUsers = users?.length || 0;
  const activeUsers = users?.filter((u) => u.status === 'active').length || 0;

  return (
    <AuthenticatedLayout>
      <div className="space-y-8">
        {/* Boas-vindas */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
          <h1 className="text-4xl font-bold mb-2">Bem-vindo! 🎵</h1>
          <p className="text-blue-100">
            Olá {user?.email?.split('@')[0]}! Aqui está um resumo da sua Tuna.
          </p>
        </div>

        {/* Visão Geral */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Visão Geral da Tuna</h2>
          {allLoading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
              <p>Carregando dados...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Membros */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-blue-800">Membros</h3>
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-blue-900">
                  {totalMembers}
                </p>
                <p className="text-sm text-blue-700">
                  {activeMembers} ativos
                </p>
              </div>

              {/* Eventos */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-green-800">Eventos</h3>
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-900">
                  {totalEvents}
                </p>
                <p className="text-sm text-green-700">
                  {upcomingEvents} próximos
                </p>
              </div>

              {/* Inventário */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-purple-800">Inventário</h3>
                  <Package className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-purple-900">
                  {totalInventoryItems}
                </p>
                <p className="text-sm text-purple-700">
                  {availableItems} disponíveis
                </p>
              </div>

              {/* Financeiro */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-amber-800">Financeiro</h3>
                  <Landmark className="w-5 h-5 text-amber-600" />
                </div>
                <p className={`text-3xl font-bold ${balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {balance.toFixed(2)} €
                </p>
                <p className="text-sm text-amber-700">
                  Receitas: {totalIncome.toFixed(2)}€ | Despesas: {totalExpenses.toFixed(2)}€
                </p>
              </div>

              {/* Reportório Musical */}
              <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-pink-800">Reportório</h3>
                  <Music className="w-5 h-5 text-pink-600" />
                </div>
                <p className="text-3xl font-bold text-pink-900">
                  {totalSheetMusic}
                </p>
                <p className="text-sm text-pink-700">
                  Partituras registadas
                </p>
              </div>

              {/* Utilizadores */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-indigo-800">Utilizadores</h3>
                  <UserCog className="w-5 h-5 text-indigo-600" />
                </div>
                <p className="text-3xl font-bold text-indigo-900">
                  {totalUsers}
                </p>
                <p className="text-sm text-indigo-700">
                  {activeUsers} ativos
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Rápido</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/members"
              className="p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition group flex items-center space-x-3"
            >
              <Users className="w-6 h-6 text-blue-600" />
              <span className="font-semibold text-gray-900">Membros</span>
            </Link>
            <Link
              href="/events"
              className="p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition group flex items-center space-x-3"
            >
              <Calendar className="w-6 h-6 text-green-600" />
              <span className="font-semibold text-gray-900">Eventos</span>
            </Link>
            <Link
              href="/inventory"
              className="p-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition group flex items-center space-x-3"
            >
              <Package className="w-6 h-6 text-purple-600" />
              <span className="font-semibold text-gray-900">Inventário</span>
            </Link>
            <Link
              href="/finance"
              className="p-4 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition group flex items-center space-x-3"
            >
              <Landmark className="w-6 h-6 text-amber-600" />
              <span className="font-semibold text-gray-900">Financeiro</span>
            </Link>
            <Link
              href="/music"
              className="p-4 bg-pink-50 hover:bg-pink-100 border border-pink-200 rounded-lg transition group flex items-center space-x-3"
            >
              <Music className="w-6 h-6 text-pink-600" />
              <span className="font-semibold text-gray-900">Reportório Musical</span>
            </Link>
            <Link
              href="/users"
              className="p-4 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition group flex items-center space-x-3"
            >
              <UserCog className="w-6 h-6 text-indigo-600" />
              <span className="font-semibold text-gray-900">Utilizadores</span>
            </Link>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Estado Atual</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✅ Autenticação: Funcional</li>
            <li>✅ Módulos Principais: Implementados (Membros, Eventos, Inventário, Financeiro, Reportório, Utilizadores)</li>
            <li>⏳ Tunas: A implementar (multi-tenancy)</li>
            <li>📚 Documentação: Lê IMPLEMENTATION_CHECKLIST.md</li>
          </ul>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
