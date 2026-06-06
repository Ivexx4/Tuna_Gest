'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFetch, useDelete } from '@/hooks';
import { memberService } from '@/lib/services';
import { Member, HierarchyRole, InstrumentSection } from '@/types/database';
import AuthenticatedLayout from '@/app/authenticated-layout';
import MembersTable from '@/components/MembersTable';
import { Plus, Search, Download } from 'lucide-react'; // Import Download icon
import Link from 'next/link';
import { toast } from 'sonner';

export default function MembersPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { data: members, loading, error, refetch } = useFetch<Member>(
    'members'
  );
  const { data: roles } = useFetch<HierarchyRole>('hierarchy_roles');
  const { data: sections } = useFetch<InstrumentSection>('instrument_sections');
  const { execute: deleteMember, loading: deleteLoading } = useDelete('members');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (!members) return;

    let currentFilteredMembers = members;

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      currentFilteredMembers = currentFilteredMembers.filter(
        (member) =>
          member.name.toLowerCase().includes(term) ||
          member.email?.toLowerCase().includes(term) ||
          member.phone?.includes(term)
      );
    }

    if (selectedRole !== '') {
      currentFilteredMembers = currentFilteredMembers.filter(
        (member) => member.role_id === parseInt(selectedRole)
      );
    }

    if (selectedSection !== '') {
      currentFilteredMembers = currentFilteredMembers.filter(
        (member) => member.section_id === parseInt(selectedSection)
      );
    }

    setFilteredMembers(currentFilteredMembers);
  }, [searchTerm, members, selectedRole, selectedSection]);

  const handleDelete = async (id: number) => {
    try {
      await deleteMember(id);
      toast.success('Membro deletado com sucesso!');
      refetch();
    } catch (err) {
      toast.error('Erro ao deletar membro');
      console.error(err);
    }
  };

  // Helper function to convert array of objects to CSV
  const convertToCSV = (data: Member[], rolesData: HierarchyRole[], sectionsData: InstrumentSection[]) => {
    const roleMap = new Map(rolesData.map(r => [r.id, r.name]));
    const sectionMap = new Map(sectionsData.map(s => [s.id, s.name]));

    const headers = ['ID', 'Nome', 'Email', 'Telefone', 'Status', 'Data de Entrada', 'Cargo', 'Naipe'];
    const rows = data.map(member => [
      member.id,
      `"${member.name}"`, // Handle names with commas
      member.email || '',
      member.phone || '',
      member.status,
      member.joining_date ? new Date(member.joining_date).toLocaleDateString('pt-PT') : '',
      member.role_id ? roleMap.get(member.role_id) || '' : '',
      member.section_id ? sectionMap.get(member.section_id) || '' : ''
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
  };

  const handleExportCSV = () => {
    if (!filteredMembers || !roles || !sections) {
        toast.warning('Não há dados para exportar ou os dados de roles/secções não foram carregados.');
        return;
    }
    const csv = convertToCSV(filteredMembers, roles, sections);
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' }); // Add BOM for Excel compatibility
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'membros.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Membros exportados para CSV!');
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

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">👥 Membros</h1>
            <p className="text-gray-600 mt-1">
              Gerencie todos os membros da tuna
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              disabled={filteredMembers.length === 0}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5" />
              Exportar CSV
            </button>
            <Link
              href="/members/new"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
              Novo Membro
            </Link>
          </div>
        </div>

        {/* Barra de Pesquisa e Filtros */}
        <div className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex items-center gap-3 bg-gray-100 rounded-lg px-4">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Pesquisa por nome, email ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent py-2 outline-none"
            />
          </div>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          >
            <option value="">Todos os Cargos</option>
            {roles?.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>

          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          >
            <option value="">Todas as Naipes</option>
            {sections?.map((section) => (
              <option key={section.id} value={section.id}>
                {section.name}
              </option>
            ))}
          </select>
        </div>

        {/* Info Card */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            Erro ao carregar membros: {error.message}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Total de Membros</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {members?.length || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Ativos</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {members?.filter((m) => m.status === 'active').length || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Inativos</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {members?.filter((m) => m.status !== 'active').length || 0}
            </p>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
              <p>Carregando membros...</p>
            </div>
          ) : (
            <MembersTable
              members={filteredMembers}
              onDelete={handleDelete}
              isLoading={deleteLoading}
              emptyMessage={
                searchTerm || selectedRole || selectedSection
                  ? 'Nenhum membro encontrado com os filtros aplicados'
                  : 'Nenhum membro registado ainda. Começa por criar um!'
              }
            />
          )}
        </div>

        {/* Info Box */}
        {members?.length === 0 && !loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <h3 className="font-semibold text-blue-900 mb-2">
              Começa a adicionar membros
            </h3>
            <p className="text-blue-700 mb-4">
              Clica no botão acima para criar o primeiro membro da tua tuna
            </p>
            <Link
              href="/members/new"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              Criar Primeiro Membro
            </Link>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
