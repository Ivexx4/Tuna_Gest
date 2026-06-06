'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { inventoryService } from '@/lib/services';
import AuthenticatedLayout from '@/app/authenticated-layout';
import { InventoryItem } from '@/types/database';
import { toast } from 'sonner';
import Link from 'next/link';
import { ChevronLeft, Edit, Trash2, Handshake } from 'lucide-react'; // Added Handshake icon
import InventoryLoanManager from '@/components/InventoryLoanManager';
import LoanReturnModal from '@/components/LoanReturnModal'; // Import the new modal

export default function InventoryItemDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = parseInt(params.id as string);

  const [item, setItem] = useState<InventoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const [currentLoanDetails, setCurrentLoanDetails] = useState<{
    id: number;
    member_id: number;
    member_name: string;
    condition_on_loan?: string;
  } | null>(null); // To pass current loan info to modal

  const fetchItem = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await inventoryService.getItem(itemId);
      if (error) throw error;
      setItem(data);

      // Fetch current loan details if item is in use
      if (data?.status === 'in_use') {
        const { data: loansData, error: loansError } = await inventoryService.getCurrentLoans(undefined); // Fetch all current loans
        if (loansError) throw loansError;
        const loan = loansData?.find(loan => loan.item_id === itemId);
        if (loan) {
          setCurrentLoanDetails({
            id: loan.loan_id,
            member_id: loan.member_id,
            member_name: loan.member_name,
            condition_on_loan: loan.condition_on_loan,
          });
        } else {
          setCurrentLoanDetails(null);
        }
      } else {
        setCurrentLoanDetails(null);
      }
    } catch (error) {
      console.error('Erro ao carregar item:', error);
      toast.error('Erro ao carregar item');
      router.push('/inventory');
    } finally {
      setIsLoading(false);
    }
  }, [itemId, router]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  const handleDelete = async () => {
    if (
      !confirm(
        `Tem certeza que quer deletar o item "${item?.name}"? Essa ação é permanente.`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await inventoryService.deleteItem(itemId);
      toast.success('Item deletado com sucesso');
      router.push('/inventory');
    } catch (error) {
      console.error('Erro ao deletar:', error);
      toast.error('Erro ao deletar item');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando detalhes do item...</p>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (!item) {
    return (
      <AuthenticatedLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Item não encontrado</p>
          <Link href="/inventory" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
            Voltar para Inventário
          </Link>
        </div>
      </AuthenticatedLayout>
    );
  }

  const getItemStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'in_use':
        return 'bg-blue-100 text-blue-800';
      case 'damaged':
        return 'bg-red-100 text-red-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      case 'decommissioned':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getItemStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Disponível';
      case 'in_use':
        return 'Em Uso';
      case 'damaged':
        return 'Danificado';
      case 'lost':
        return 'Perdido';
      case 'decommissioned':
        return 'Desativado';
      default:
        return status;
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <Link
          href="/inventory"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para Inventário
        </Link>

        {/* Header com Ações */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{item.name}</h1>
            <span
              className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${getItemStatusColor(
                item.status
              )}`}
            >
              {getItemStatusLabel(item.status)}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleOpenModal}
              className="inline-flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg font-medium transition"
            >
              <Handshake className="w-4 h-4" />
              {item.status === 'in_use' ? 'Devolver Item' : 'Emprestar Item'}
            </button>

            <Link
              href={`/inventory/${itemId}/edit`}
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
          {/* Card - Código */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">
              Código
            </h3>
            <p className="text-lg font-semibold text-gray-900">
              {item.code || <span className="text-gray-400">-</span>}
            </p>
          </div>

          {/* Card - Tipo */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">
              Tipo
            </h3>
            <p className="text-lg font-semibold text-gray-900">
              {item.item_type || <span className="text-gray-400">-</span>}
            </p>
          </div>

          {/* Card - Data de Compra */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">
              Data de Compra
            </h3>
            <p className="text-lg font-semibold text-gray-900">
              {item.purchase_date ? (
                new Date(item.purchase_date).toLocaleDateString('pt-PT')
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </p>
          </div>

          {/* Card - Preço de Compra */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">
              Preço de Compra
            </h3>
            <p className="text-lg font-semibold text-gray-900">
              {item.purchase_price ? `${item.purchase_price} €` : <span className="text-gray-400">-</span>}
            </p>
          </div>
        </div>

        {/* Descrição */}
        {item.description && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">
              Descrição
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap">{item.description}</p>
          </div>
        )}

        {/* Imagem */}
        {item.image_url && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">
              Imagem
            </h3>
            <img src={item.image_url} alt={item.name} className="max-w-full h-auto rounded-lg" />
          </div>
        )}

        {/* Loan Manager */}
        {item && <InventoryLoanManager itemId={item.id} onLoanUpdate={fetchItem} />}

        {/* Datas */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600 space-y-1">
          <p>
            <strong>Criado:</strong>{' '}
            {new Date(item.created_at).toLocaleDateString('pt-PT')}
          </p>
          <p>
            <strong>Última atualização:</strong>{' '}
            {new Date(item.updated_at).toLocaleDateString('pt-PT')}
          </p>
        </div>
      </div>

      {item && (
        <LoanReturnModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          item={item}
          currentLoan={currentLoanDetails}
          onLoanUpdate={fetchItem}
        />
      )}
    </AuthenticatedLayout>
  );
}
