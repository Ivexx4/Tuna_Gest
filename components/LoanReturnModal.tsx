'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, UserPlus, CheckCircle } from 'lucide-react';
import { inventoryService, memberService } from '@/lib/services';
import { InventoryItem, Member } from '@/types/database';
import { toast } from 'sonner';
import { useAuth, useFetch } from '@/hooks';
import { loanFormSchema, returnFormSchema, LoanFormDataType, ReturnFormDataType } from '@/lib/schemas'; // Import schemas

interface LoanReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem;
  currentLoan?: {
    id: number;
    member_id: number;
    member_name: string;
    condition_on_loan?: string;
    due_date?: string; // Added due_date to currentLoan details
  } | null;
  onLoanUpdate: () => void; // Callback to refresh item details after loan/return
}

export default function LoanReturnModal({
  isOpen,
  onClose,
  item,
  currentLoan,
  onLoanUpdate,
}: LoanReturnModalProps) {
  const { user } = useAuth(); // Get current user for 'returnedBy'
  const { data: members } = useFetch<Member>('members'); // Fetch all members

  const {
    register: registerLoan,
    handleSubmit: handleLoanSubmit,
    formState: { errors: loanErrors },
    reset: resetLoan,
  } = useForm<LoanFormDataType>({
    resolver: zodResolver(loanFormSchema),
  });

  const {
    register: registerReturn,
    handleSubmit: handleReturnSubmit,
    formState: { errors: returnErrors },
    reset: resetReturn,
  } = useForm<ReturnFormDataType>({
    resolver: zodResolver(returnFormSchema),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      resetLoan();
      resetReturn();
    }
  }, [isOpen, resetLoan, resetReturn]);

  const handleLoanItem = async (data: LoanFormDataType) => {
    setIsSubmitting(true);
    try {
      await inventoryService.createLoan(item.id, data.member_id, data.condition_on_loan, data.due_date || undefined);
      await inventoryService.updateItem(item.id, { status: 'in_use' }); // Update item status
      toast.success('Item emprestado com sucesso!');
      onLoanUpdate();
      onClose();
    } catch (error) {
      console.error('Erro ao emprestar item:', error);
      toast.error('Erro ao emprestar item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturnItem = async (data: ReturnFormDataType) => {
    if (!currentLoan) return;
    setIsSubmitting(true);
    try {
      await inventoryService.returnLoan(
        currentLoan.id,
        data.condition_on_return,
        user?.id // Pass current user ID as 'returnedBy'
      );
      await inventoryService.updateItem(item.id, { status: 'available' }); // Update item status
      toast.success('Item devolvido com sucesso!');
      onLoanUpdate();
      onClose();
    } catch (error) {
      console.error('Erro ao devolver item:', error);
      toast.error('Erro ao devolver item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          {currentLoan ? 'Devolver Item' : 'Emprestar Item'}
        </h2>

        {currentLoan ? (
          // Return Form
          <form onSubmit={handleReturnSubmit(handleReturnItem)} className="space-y-4">
            <p className="text-gray-700">
              O item <span className="font-semibold">{item.name} ({item.code})</span> está atualmente emprestado a{' '}
              <span className="font-semibold">{currentLoan.member_name}</span>.
            </p>
            <p className="text-sm text-gray-500">
              Condição no empréstimo: {currentLoan.condition_on_loan || 'Não registado'}
            </p>
            {currentLoan.due_date && (
              <p className="text-sm text-gray-500">
                Data de Devolução Esperada: {new Date(currentLoan.due_date).toLocaleDateString('pt-PT')}
              </p>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condição na Devolução
              </label>
              <select
                {...registerReturn('condition_on_return')}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                  returnErrors.condition_on_return
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 bg-white'
                }`}
              >
                <option value="">Selecione a condição</option>
                <option value="excellent">Excelente</option>
                <option value="good">Bom</option>
                <option value="fair">Razoável</option>
                <option value="poor">Mau</option>
              </select>
              {returnErrors.condition_on_return && (
                <p className="mt-1 text-sm text-red-600">
                  {returnErrors.condition_on_return.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              <CheckCircle className="w-5 h-5" />
              {isSubmitting ? 'Devolvendo...' : 'Confirmar Devolução'}
            </button>
          </form>
        ) : (
          // Loan Form
          <form onSubmit={handleLoanSubmit(handleLoanItem)} className="space-y-4">
            <p className="text-gray-700">
              Emprestar <span className="font-semibold">{item.name} ({item.code})</span> a:
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Membro *
              </label>
              <select
                {...registerLoan('member_id', { valueAsNumber: true })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                  loanErrors.member_id
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 bg-white'
                }`}
              >
                <option value="">Selecione um membro</option>
                {members?.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
              {loanErrors.member_id && (
                <p className="mt-1 text-sm text-red-600">{loanErrors.member_id.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condição no Empréstimo
              </label>
              <select
                {...registerLoan('condition_on_loan')}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                  loanErrors.condition_on_loan
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 bg-white'
                }`}
              >
                <option value="">Selecione a condição</option>
                <option value="excellent">Excelente</option>
                <option value="good">Bom</option>
                <option value="fair">Razoável</option>
                <option value="poor">Mau</option>
              </select>
              {loanErrors.condition_on_loan && (
                <p className="mt-1 text-sm text-red-600">
                  {loanErrors.condition_on_loan.message}
                </p>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Devolução Esperada
              </label>
              <input
                type="date"
                {...registerLoan('due_date')}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                  loanErrors.due_date
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 bg-white'
                }`}
              />
              {loanErrors.due_date && (
                <p className="mt-1 text-sm text-red-600">{loanErrors.due_date.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              <UserPlus className="w-5 h-5" />
              {isSubmitting ? 'Emprestando...' : 'Emprestar Item'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
