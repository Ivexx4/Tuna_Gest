'use client';

import { useState, useEffect } from 'react';
import { inventoryService, memberService } from '@/lib/services';
import { InventoryLoan, Member } from '@/types/database';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface InventoryLoanManagerProps {
  itemId: number;
  onLoanUpdate: () => void; // Callback to refetch item data (e.g., status)
}

const loanSchema = z.object({
  member_id: z.number().int().positive('Membro é obrigatório'),
  condition_on_loan: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
});

type LoanFormData = z.infer<typeof loanSchema>;

export default function InventoryLoanManager({
  itemId,
  onLoanUpdate,
}: InventoryLoanManagerProps) {
  const [loans, setLoans] = useState<(InventoryLoan & { member: Member })[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoadingLoans, setIsLoadingLoans] = useState(true);
  const [isCreatingLoan, setIsCreatingLoan] = useState(false);
  const [isReturningLoan, setIsReturningLoan] = useState<{ [key: number]: boolean }>({});

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoanFormData>({
    resolver: zodResolver(loanSchema),
  });

  const fetchLoans = async () => {
    setIsLoadingLoans(true);
    try {
      const { data, error } = await inventoryService.getLoansByItemId(itemId);
      if (error) throw error;
      setLoans(data || []);
    } catch (error) {
      console.error('Erro ao carregar empréstimos:', error);
      toast.error('Erro ao carregar empréstimos');
    } finally {
      setIsLoadingLoans(false);
    }
  };

  const fetchMembers = async () => {
    try {
      // Assuming tuna_id is 1 for now
      const { data, error } = await memberService.getMembers(1);
      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
      toast.error('Erro ao carregar membros para empréstimo');
    }
  };

  useEffect(() => {
    fetchLoans();
    fetchMembers();
  }, [itemId]);

  const handleCreateLoan = async (data: LoanFormData) => {
    setIsCreatingLoan(true);
    try {
      await inventoryService.createLoan(
        itemId,
        data.member_id,
        data.condition_on_loan
      );
      toast.success('Empréstimo registado com sucesso!');
      reset();
      fetchLoans();
      onLoanUpdate(); // Update parent component (item status)
    } catch (error) {
      console.error('Erro ao criar empréstimo:', error);
      toast.error('Erro ao criar empréstimo');
    } finally {
      setIsCreatingLoan(false);
    }
  };

  const handleReturnLoan = async (loanId: number, currentMemberName: string) => {
    if (!confirm(`Tem certeza que quer registar a devolução do item para ${currentMemberName}?`)) {
      return;
    }

    setIsReturningLoan((prev) => ({ ...prev, [loanId]: true }));
    try {
      // For simplicity, condition on return is 'good' by default, can be expanded
      await inventoryService.returnLoan(loanId, 'good');
      toast.success('Devolução registada com sucesso!');
      fetchLoans();
      onLoanUpdate(); // Update parent component (item status)
    } catch (error) {
      console.error('Erro ao registar devolução:', error);
      toast.error('Erro ao registar devolução');
    } finally {
      setIsReturningLoan((prev) => ({ ...prev, [loanId]: false }));
    }
  };

  const getConditionLabel = (condition?: string) => {
    switch (condition) {
      case 'excellent': return 'Excelente';
      case 'good': return 'Bom';
      case 'fair': return 'Razoável';
      case 'poor': return 'Mau';
      default: return '-';
    }
  };

  return (
    <div className="space-y-6">
      {/* Register New Loan */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Registar Novo Empréstimo</h3>
        <form onSubmit={handleSubmit(handleCreateLoan)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Membro *
            </label>
            <select
              {...register('member_id', { valueAsNumber: true })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                errors.member_id
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 bg-white'
              }`}
            >
              <option value="">Selecionar Membro</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
            {errors.member_id && (
              <p className="mt-1 text-sm text-red-600">{errors.member_id.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Condição no Empréstimo
            </label>
            <select
              {...register('condition_on_loan')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                errors.condition_on_loan
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 bg-white'
              }`}
            >
              <option value="">Selecionar Condição</option>
              <option value="excellent">Excelente</option>
              <option value="good">Bom</option>
              <option value="fair">Razoável</option>
              <option value="poor">Mau</option>
            </select>
            {errors.condition_on_loan && (
              <p className="mt-1 text-sm text-red-600">{errors.condition_on_loan.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isCreatingLoan}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            {isCreatingLoan ? 'Registando...' : 'Registar Empréstimo'}
          </button>
        </form>
      </div>

      {/* Loan History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Histórico de Empréstimos</h3>
        {isLoadingLoans ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Carregando histórico de empréstimos...</p>
          </div>
        ) : loans.length === 0 ? (
          <p className="text-gray-500">Nenhum empréstimo registado para este item.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Membro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Empréstimo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Condição (Empréstimo)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Devolução
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Condição (Devolução)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loans.map((loan) => (
                  <tr key={loan.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {loan.member.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(loan.loan_date).toLocaleDateString('pt-PT')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getConditionLabel(loan.condition_on_loan)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {loan.return_date ? new Date(loan.return_date).toLocaleDateString('pt-PT') : 'Em curso'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {loan.return_date ? getConditionLabel(loan.condition_on_return) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {!loan.return_date && (
                        <button
                          onClick={() => handleReturnLoan(loan.id, loan.member.name)}
                          disabled={isReturningLoan[loan.id]}
                          className="px-3 py-1 border border-green-300 text-green-700 rounded-md text-xs font-medium hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isReturningLoan[loan.id] ? 'Devolvendo...' : 'Registar Devolução'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
