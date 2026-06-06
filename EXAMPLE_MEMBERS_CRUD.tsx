// ============================================================================
// EXEMPLO COMPLETO: Como Criar uma Página CRUD para Membros
// ============================================================================

// app/members/page.tsx

'use client';

import { useState } from 'react';
import { useAuth, useFetch } from '@/hooks';
import { memberService } from '@/lib/services';
import { Member } from '@/types/database';

// Componente principal da página
export default function MembersPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { data: members, loading, error, refetch } = useFetch<Member>(
    'members'
  );

  // State local para o formulário
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Member>>({
    status: 'active',
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  // Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        // Atualizar membro existente
        await memberService.updateMember(editingId, formData);
      } else {
        // Criar novo membro
        // Nota: Substitui 1 com a tuna_id atual do utilizador
        await memberService.createMember({
          tuna_id: 1,
          name: formData.name || '',
          email: formData.email,
          phone: formData.phone,
          role_id: formData.role_id,
          section_id: formData.section_id,
          status: 'active',
        });
      }

      // Limpar formulário e recarregar
      setFormData({ status: 'active' });
      setEditingId(null);
      setShowForm(false);
      await refetch();
    } catch (err) {
      console.error('Erro ao salvar:', err);
      alert('Erro ao salvar membro');
    }
  };

  const handleEdit = (member: Member) => {
    setFormData(member);
    setEditingId(member.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que quer deletar este membro?')) return;

    try {
      await memberService.deleteMember(id);
      await refetch();
    } catch (err) {
      console.error('Erro ao deletar:', err);
      alert('Erro ao deletar membro');
    }
  };

  // Estados de loading
  if (authLoading) {
    return <div className="p-4">Carregando autenticação...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
        Você precisa estar autenticado para acessar esta página.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestão de Membros</h1>
        <button
          onClick={() => {
            setFormData({ status: 'active' });
            setEditingId(null);
            setShowForm(!showForm);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancelar' : 'Novo Membro'}
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <MemberForm
          data={formData}
          onChange={setFormData}
          onSubmit={handleSubmit}
          isEditing={editingId !== null}
        />
      )}

      {/* Lista de Membros */}
      {loading ? (
        <div>Carregando membros...</div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Erro ao carregar: {error.message}
        </div>
      ) : (
        <MembersTable
          members={members}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

// ============================================================================
// COMPONENTE: Formulário de Membro
// ============================================================================

interface MemberFormProps {
  data: Partial<Member>;
  onChange: (data: Partial<Member>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isEditing: boolean;
}

function MemberForm({ data, onChange, onSubmit, isEditing }: MemberFormProps) {
  return (
    <form onSubmit={onSubmit} className="bg-gray-50 p-6 rounded mb-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Nome *
        </label>
        <input
          type="text"
          required
          value={data.name || ''}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            value={data.email || ''}
            onChange={(e) => onChange({ ...data, email: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Telefone
          </label>
          <input
            type="tel"
            value={data.phone || ''}
            onChange={(e) => onChange({ ...data, phone: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Role ID
          </label>
          <input
            type="number"
            value={data.role_id || ''}
            onChange={(e) => onChange({ ...data, role_id: parseInt(e.target.value) })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Section ID
          </label>
          <input
            type="number"
            value={data.section_id || ''}
            onChange={(e) => onChange({ ...data, section_id: parseInt(e.target.value) })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          value={data.status || 'active'}
          onChange={(e) =>
            onChange({
              ...data,
              status: e.target.value as 'active' | 'inactive' | 'alumni',
            })
          }
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
        >
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
          <option value="alumni">Alumni</option>
        </select>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {isEditing ? 'Atualizar' : 'Criar'}
        </button>
      </div>
    </form>
  );
}

// ============================================================================
// COMPONENTE: Tabela de Membros
// ============================================================================

interface MembersTableProps {
  members: Member[];
  onEdit: (member: Member) => void;
  onDelete: (id: number) => void;
}

function MembersTable({ members, onEdit, onDelete }: MembersTableProps) {
  if (members.length === 0) {
    return <div className="text-center text-gray-500">Nenhum membro.</div>;
  }

  return (
    <div className="overflow-x-auto shadow-md rounded-lg">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-medium">Nome</th>
            <th className="px-6 py-3 text-left text-sm font-medium">Email</th>
            <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
            <th className="px-6 py-3 text-left text-sm font-medium">Ações</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id} className="border-b hover:bg-gray-50">
              <td className="px-6 py-4">{member.name}</td>
              <td className="px-6 py-4">{member.email || '-'}</td>
              <td className="px-6 py-4">
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    member.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : member.status === 'inactive'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {member.status}
                </span>
              </td>
              <td className="px-6 py-4 space-x-2">
                <button
                  onClick={() => onEdit(member)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(member.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Deletar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// OUTRO EXEMPLO: Página de Eventos Simples
// ============================================================================

/*
'use client';

import { useFetch } from '@/hooks';
import { eventService } from '@/lib/services';
import { Event } from '@/types/database';

export default function EventsPage() {
  const { data: events, loading, refetch } = useFetch<Event>('events');

  const handleAddEvent = async () => {
    const { data } = await eventService.createEvent({
      tuna_id: 1,
      title: 'Novo Evento',
      event_type: 'rehearsal',
      event_date: new Date(),
    });
    refetch();
  };

  return (
    <div>
      <h1>Eventos</h1>
      <button onClick={handleAddEvent}>Novo Evento</button>
      {events.map((event) => (
        <div key={event.id}>
          <h3>{event.title}</h3>
          <p>{event.event_date}</p>
        </div>
      ))}
    </div>
  );
}
*/

// ============================================================================
// PADRÃO GERAL
// ============================================================================

/*
1. Importar hooks e serviços
2. Usar useAuth() para verificar autenticação
3. Usar useFetch() para carregar dados
4. Usar services para criar/atualizar/deletar
5. Atualizar com refetch() após mudanças
6. Tratar loading e error states
7. Componentizar UI em sub-componentes
8. Adicionar validação e confirmações

Exemplo de fluxo:
  1. User clica "Novo"
  2. Mostra formulário
  3. User preenche e submete
  4. Chamamos service.create()
  5. Refetch dos dados
  6. Atualizamos lista na tela
  7. Escondemos formulário
*/

