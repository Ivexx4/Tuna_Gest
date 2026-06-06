'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { memberService } from '@/lib/services';
import AuthenticatedLayout from '@/app/authenticated-layout';
import { Member, Event, InventoryLoan, HierarchyRole, InstrumentSection, MemberRoleHistory } from '@/types/database';
import { toast } from 'sonner';
import Link from 'next/link';
import { ChevronLeft, Edit, Trash2, Calendar, Package, Users, History } from 'lucide-react';
import { useFetch } from '@/hooks'; // Import useFetch

export default function MemberProfilePage() {
  const router = useRouter();
  const params = useParams();
  const memberId = parseInt(params.id as string);

  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch related data
  const { data: allEvents } = useFetch<Event>('events');
  const { data: allInventoryLoans } = useFetch<InventoryLoan>('inventory_loans');
  const { data: allRoles } = useFetch<HierarchyRole>('roles'); // Changed to HierarchyRole
  const { data: allSections } = useFetch<InstrumentSection>('sections'); // Changed to InstrumentSection
  const { data: memberRoleHistory } = useFetch<MemberRoleHistory>(`member_role_history?member_id=eq.${memberId}`);


  // Carregar dados do membro
  useEffect(() => {
    const fetchMember = async () => {
      try {
        const { data, error } = await memberService.getMember(memberId);
        if (error) throw error;
        setMember(data);
      } catch (error) {
        console.error('Erro ao carregar membro:', error);
        toast.error('Erro ao carregar membro');
        router.push('/members');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMember();
  }, [memberId, router]);

  const handleDelete = async () => {
    if (
      !confirm(
        `Tem certeza que quer deletar ${member?.name}? Essa ação é permanente.`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await memberService.deleteMember(memberId);
      toast.success('Membro deletado com sucesso');
      router.push('/members');
    } catch (error) {
      console.error('Erro ao deletar:', error);
      toast.error('Erro ao deletar membro');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando perfil...</p>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (!member) {
    return (
      <AuthenticatedLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Membro não encontrado</p>
          <Link href="/members" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
            Voltar para Membros
          </Link>
        </div>
      </AuthenticatedLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'alumni':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'inactive':
        return 'Inativo';
      case 'alumni':
        return 'Alumni';
      default:
        return status;
    }
  };

  // Filter events and inventory loans for this member
  const memberEvents = allEvents?.filter(event => event.member_id === memberId) || [];
  const memberInventoryLoans = allInventoryLoans?.filter(loan => loan.member_id === memberId) || [];

  // Get current role and section names
  const currentRole = allRoles?.find(role => role.id === member.role_id);
  const currentSection = allSections?.find(section => section.id === member.section_id);

  return (
    <AuthenticatedLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <Link
          href="/members"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para Membros
        </Link>

        {/* Header com Ações */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{member.name}</h1>
            <span
              className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                member.status
              )}`}
            >
              {getStatusLabel(member.status)}
            </span>
          </div>

          <div className="flex gap-2">
            <Link
              href={`/members/${memberId}/edit`}
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
          {/* Card - Email */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">
              Email
            </h3>
            <p className="text-lg font-semibold text-gray-900">
              {member.email || <span className="text-gray-400">-</span>}
            </p>
          </div>

          {/* Card - Telefone */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">
              Telefone
            </h3>
            <p className="text-lg font-semibold text-gray-900">
              {member.phone || <span className="text-gray-400">-</span>}
            </p>
          </div>

          {/* Card - Data de Entrada */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">
              Data de Entrada
            </h3>
            <p className="text-lg font-semibold text-gray-900">
              {member.joining_date ? (
                new Date(member.joining_date).toLocaleDateString('pt-PT')
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </p>
          </div>

          {/* Card - Role e Seção Atuais */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">
              Role e Seção Atuais
            </h3>
            <p className="text-lg font-semibold text-gray-900">
              {currentRole?.name || <span className="text-gray-400">N/A</span>}
              {' / '}
              {currentSection?.name || <span className="text-gray-400">N/A</span>}
            </p>
          </div>
        </div>

        {/* Bio */}
        {member.bio && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">
              Bio
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap">{member.bio}</p>
          </div>
        )}

        {/* Histórico de Eventos */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" /> Histórico de Eventos
          </h3>
          {memberEvents.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {memberEvents.map((event) => (
                <li key={event.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{event.title}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(event.event_date).toLocaleDateString('pt-PT')} - {event.location}
                    </p>
                  </div>
                  <Link href={`/events/${event.id}`} className="text-blue-600 hover:text-blue-700 text-sm">
                    Ver Evento
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Nenhum evento registado para este membro.</p>
          )}
        </div>

        {/* Itens Emprestados */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-6 h-6 text-green-600" /> Itens Emprestados
          </h3>
          {memberInventoryLoans.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {memberInventoryLoans.map((loan) => (
                <li key={loan.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">Item ID: {loan.item_id}</p>
                    <p className="text-sm text-gray-500">
                      Empréstimo: {new Date(loan.loan_date).toLocaleDateString('pt-PT')}
                      {loan.return_date && ` - Devolução: ${new Date(loan.return_date).toLocaleDateString('pt-PT')}`}
                    </p>
                  </div>
                  {/* Assuming there's an inventory item detail page */}
                  <Link href={`/inventory/${loan.item_id}`} className="text-blue-600 hover:text-blue-700 text-sm">
                    Ver Item
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Nenhum item emprestado a este membro.</p>
          )}
        </div>

        {/* Histórico de Roles */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <History className="w-6 h-6 text-purple-600" /> Histórico de Roles
          </h3>
          {memberRoleHistory && memberRoleHistory.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {memberRoleHistory.map((historyEntry) => {
                const oldRoleName = allRoles?.find(r => r.id === historyEntry.old_role_id)?.name || 'N/A';
                const newRoleName = allRoles?.find(r => r.id === historyEntry.new_role_id)?.name || 'N/A';
                return (
                  <li key={historyEntry.id} className="py-3">
                    <p className="font-medium text-gray-900">
                      De: <span className="text-red-600">{oldRoleName}</span> Para:{' '}
                      <span className="text-green-600">{newRoleName}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Em: {new Date(historyEntry.changed_at).toLocaleDateString('pt-PT')}
                      {historyEntry.changed_by && ` por ${historyEntry.changed_by}`}
                    </p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-gray-500">Nenhum histórico de roles para este membro.</p>
          )}
        </div>

        {/* Datas */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600 space-y-1">
          <p>
            <strong>Criado:</strong>{' '}
            {new Date(member.created_at).toLocaleDateString('pt-PT')}
          </p>
          <p>
            <strong>Última atualização:</strong>{' '}
            {new Date(member.updated_at).toLocaleDateString('pt-PT')}
          </p>
        </div>

        {/* Info Box */}
        {member.status !== 'active' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
            <strong>⚠️ Nota:</strong> Este membro não está ativo. Edita o status se necessário.
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
