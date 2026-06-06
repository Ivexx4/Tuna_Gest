'use client';

import { useAuth } from '@/hooks';
import AuthenticatedLayout from '@/app/authenticated-layout';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Info, Users, GitFork, Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  // Redireciona para login se não está autenticado
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
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
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">⚙️ Configurações da Tuna</h1>
          <p className="text-gray-600 mt-2">Gerencie as informações e configurações da sua tuna.</p>
        </div>

        {/* Opções de Configuração */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <Link
            href="/settings/tuna-info"
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <div className="flex items-center space-x-3">
              <Info className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Informações da Tuna</h2>
                <p className="text-sm text-gray-600">Edite o nome, descrição e outros detalhes da tuna.</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>

          <Link
            href="/settings/roles"
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-green-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Cargos (Roles)</h2>
                <p className="text-sm text-gray-600">Gerencie os cargos e hierarquias da tuna.</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>

          <Link
            href="/settings/sections"
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <div className="flex items-center space-x-3">
              <GitFork className="w-6 h-6 text-purple-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Naipes (Seções)</h2>
                <p className="text-sm text-gray-600">Gerencie os naipes e seções instrumentais.</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>

          <Link
            href="/settings/integrations"
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <div className="flex items-center space-x-3">
              <SettingsIcon className="w-6 h-6 text-orange-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Integrações</h2>
                <p className="text-sm text-gray-600">Conecte-se a outros serviços (em breve).</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
          <p>
            <strong>Nota:</strong> Esta seção permite a configuração global da sua tuna.
          </p>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
