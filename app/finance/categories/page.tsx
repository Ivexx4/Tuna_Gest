'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFetch, useDelete } from '@/hooks';
import { financialService } from '@/lib/services';
import { FinancialCategory } from '@/types/database';
import AuthenticatedLayout from '@/app/authenticated-layout';
import Link from 'next/link';
import { ChevronLeft, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import CategoryForm from '@/components/CategoryForm'; // Import the CategoryForm component

export default function FinancialCategoriesPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  // Assuming tuna_id is 1 for now
  const { data: categories, loading, error, refetch } = useFetch<FinancialCategory>(
    'financial_categories'
  );
  const { execute: deleteCategory, loading: deleteLoading } = useDelete('financial_categories');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FinancialCategory | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleCreateOrUpdateCategory = async (categoryData: Omit<FinancialCategory, 'id' | 'created_at'>) => {
    try {
      if (editingCategory) {
        await financialService.updateCategory(editingCategory.id, categoryData);
        toast.success('Categoria atualizada com sucesso!');
      } else {
        await financialService.createCategory(categoryData);
        toast.success('Categoria criada com sucesso!');
      }
      refetch();
      setIsModalOpen(false);
      setEditingCategory(null);
    } catch (err) {
      toast.error('Erro ao salvar categoria');
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Tem certeza que quer deletar esta categoria?')) {
      return;
    }
    try {
      await deleteCategory(id);
      toast.success('Categoria deletada com sucesso!');
      refetch();
    } catch (err) {
      toast.error('Erro ao deletar categoria');
      console.error(err);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando categorias...</p>
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
          href="/finance"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para Financeiro
        </Link>

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🗂️ Categorias Financeiras</h1>
            <p className="text-gray-600 mt-1">
              Gerencie as categorias de receitas e despesas
            </p>
          </div>
          <button
            onClick={() => { setEditingCategory(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            <Plus className="w-5 h-5" />
            Nova Categoria
          </button>
        </div>

        {/* Info Card */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            Erro ao carregar categorias: {error.message}
          </div>
        )}

        {/* Categories List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {categories && categories.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Nome
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Tipo
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Descrição
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
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {category.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                        category.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {category.type === 'income' ? 'Receita' : 'Despesa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => { setEditingCategory(category); setIsModalOpen(true); }}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <Edit className="w-5 h-5 inline-block" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-5 h-5 inline-block" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <Plus className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg">Nenhuma categoria financeira registada.</p>
              <p className="text-sm mt-2">
                Crie categorias para organizar as suas transações.
              </p>
            </div>
          )}
        </div>

        {/* Category Form Modal */}
        {isModalOpen && (
          <CategoryForm
            isOpen={isModalOpen}
            onClose={() => { setIsModalOpen(false); setEditingCategory(null); }}
            onSubmit={handleCreateOrUpdateCategory}
            initialData={editingCategory || undefined}
          />
        )}
      </div>
    </AuthenticatedLayout>
  );
}
