'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFetch, useDelete } from '@/hooks';
import { inventoryService } from '@/lib/services';
import { InventoryItem, InstrumentSection } from '@/types/database';
import AuthenticatedLayout from '@/app/authenticated-layout';
import InventoryTable from '@/components/InventoryTable';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function InventoryPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { data: inventoryItems, loading, error, refetch } = useFetch<InventoryItem>(
    'inventory_items'
  );
  const { data: sections } = useFetch<InstrumentSection>('instrument_sections');
  const { execute: deleteItem, loading: deleteLoading } = useDelete('inventory_items');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (!inventoryItems) return;

    let currentFilteredItems = inventoryItems;

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      currentFilteredItems = currentFilteredItems.filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          item.code.toLowerCase().includes(term) ||
          item.description?.toLowerCase().includes(term)
      );
    }

    if (selectedType !== '') {
      currentFilteredItems = currentFilteredItems.filter(
        (item) => item.item_type === selectedType
      );
    }

    if (selectedStatus !== '') {
      currentFilteredItems = currentFilteredItems.filter(
        (item) => item.status === selectedStatus
      );
    }

    if (selectedSection !== '') {
      currentFilteredItems = currentFilteredItems.filter(
        (item) => item.section_id === parseInt(selectedSection)
      );
    }

    setFilteredItems(currentFilteredItems);
  }, [searchTerm, inventoryItems, selectedType, selectedStatus, selectedSection]);

  const handleDelete = async (id: number) => {
    try {
      await deleteItem(id);
      toast.success('Item deletado com sucesso!');
      refetch();
    } catch (err) {
      toast.error('Erro ao deletar item');
      console.error(err);
    }
  };

  if (authLoading || loading) {
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

  const itemTypes = [
    { value: 'instrument', label: 'Instrumento' },
    { value: 'costume', label: 'Traje' },
    { value: 'equipment', label: 'Equipamento' },
    { value: 'other', label: 'Outro' },
  ];

  const itemStatuses = [
    { value: 'available', label: 'Disponível' },
    { value: 'in_use', label: 'Em Uso' },
    { value: 'damaged', label: 'Danificado' },
    { value: 'lost', label: 'Perdido' },
    { value: 'decommissioned', label: 'Desativado' },
  ];

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📦 Inventário</h1>
            <p className="text-gray-600 mt-1">
              Gerencie todos os itens do inventário da tuna
            </p>
          </div>
          <Link
            href="/inventory/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            <Plus className="w-5 h-5" />
            Novo Item
          </Link>
        </div>

        {/* Barra de Pesquisa e Filtros */}
        <div className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex items-center gap-3 bg-gray-100 rounded-lg px-4">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Pesquisa por nome, código ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent py-2 outline-none"
            />
          </div>

          {/* Filter by Type */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          >
            <option value="">Todos os Tipos</option>
            {itemTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          {/* Filter by Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          >
            <option value="">Todos os Status</option>
            {itemStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

          {/* Filter by Section */}
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          >
            <option value="">Todas as Seções</option>
            {sections?.map((section) => (
              <option key={section.id} value={section.id}>
                {section.display_name}
              </option>
            ))}
          </select>
        </div>

        {/* Info Card */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            Erro ao carregar itens: {error.message}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Total de Itens</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {inventoryItems?.length || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Disponíveis</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {inventoryItems?.filter((item) => item.status === 'available').length || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Em Uso</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {inventoryItems?.filter((item) => item.status === 'in_use').length || 0}
            </p>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
              <p>Carregando itens...</p>
            </div>
          ) : (
            <InventoryTable
              items={filteredItems}
              onDelete={handleDelete}
              isLoading={deleteLoading}
              emptyMessage={
                searchTerm || selectedType || selectedStatus || selectedSection
                  ? 'Nenhum item encontrado com os filtros aplicados'
                  : 'Nenhum item registado ainda. Começa por criar um!'
              }
            />
          )}
        </div>

        {/* Info Box */}
        {inventoryItems?.length === 0 && !loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <h3 className="font-semibold text-blue-900 mb-2">
              Começa a adicionar itens ao inventário
            </h3>
            <p className="text-blue-700 mb-4">
              Clica no botão acima para criar o primeiro item do teu inventário
            </p>
            <Link
              href="/inventory/new"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              Criar Primeiro Item
            </Link>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
