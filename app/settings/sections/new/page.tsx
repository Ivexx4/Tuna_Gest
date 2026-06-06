'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { instrumentSectionService } from '@/lib/services';
import { InstrumentSectionFormData } from '@/lib/schemas'; // Will define this schema
import InstrumentSectionForm from '@/components/InstrumentSectionForm'; // Will create this component
import AuthenticatedLayout from '@/app/authenticated-layout';
import { toast } from 'sonner';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function NewInstrumentSectionPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: InstrumentSectionFormData) => {
    setIsLoading(true);
    try {
      // Assuming tuna_id = 1 for now
      await instrumentSectionService.createSection({
        tuna_id: 1,
        name: data.name,
        display_name: data.display_name,
        description: data.description || undefined,
        color: data.color || undefined,
      });

      toast.success(`${data.display_name} foi criada com sucesso!`);
      router.push('/settings/sections');
    } catch (error) {
      console.error('Erro ao criar seção:', error);
      toast.error('Erro ao criar seção');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <Link
          href="/settings/sections"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para Gestão de Naipes
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            ➕ Criar Novo Naipe
          </h1>
          <p className="text-gray-600 mt-2">
            Defina um novo naipe instrumental para a sua tuna.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow p-8">
          <InstrumentSectionForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            onCancel={() => router.push('/settings/sections')}
          />
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">💡 Dicas</h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li>✓ Nome e Nome de Exibição são obrigatórios</li>
            <li>✓ A cor pode ajudar a identificar o naipe visualmente</li>
          </ul>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
