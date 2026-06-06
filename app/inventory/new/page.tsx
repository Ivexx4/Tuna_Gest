'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { inventoryService } from '@/lib/services';
import { InventoryFormData } from '@/lib/schemas';
import InventoryForm from '@/components/InventoryForm';
import AuthenticatedLayout from '@/app/authenticated-layout';
import { toast } from 'sonner';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function NewInventoryItemPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: InventoryFormData, imageFile?: File) => {
    setIsLoading(true);
    let imageUrl: string | undefined = data.image_url; // Default to existing URL if any

    try {
      if (imageFile) {
        // Assuming tuna_id is 1 for now
        const { data: uploadData, error: uploadError } = await inventoryService.uploadImage(imageFile, 1, 1); // itemId is not known yet, use a placeholder or generate a temp ID
        if (uploadError) {
          throw new Error(uploadError.message || 'Erro ao fazer upload da imagem.');
        }
        imageUrl = uploadData?.publicUrl;
      }

      // Por enquanto, usa tuna_id = 1 (pode ser feito dinâmico depois)
      await inventoryService.createItem({
        tuna_id: 1,
        name: data.name,
        description: data.description || undefined,
        item_type: data.item_type,
        code: data.code,
        purchase_date: data.purchase_date || undefined,
        purchase_price: data.purchase_price || undefined,
        status: data.status,
        section_id: data.section_id || undefined,
        image_url: imageUrl, // Use the uploaded image URL
      });

      toast.success(`${data.name} foi criado com sucesso!`);
      router.push('/inventory');
    } catch (error: any) {
      console.error('Erro ao criar item:', error);
      toast.error(error.message || 'Erro ao criar item');
    } finally {
      setIsLoading(false);
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

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            ➕ Adicionar Novo Item
          </h1>
          <p className="text-gray-600 mt-2">
            Adicione um novo item ao inventário da sua tuna preenchendo o formulário abaixo
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow p-8">
          <InventoryForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            onCancel={() => router.push('/inventory')}
          />
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">💡 Dicas</h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li>✓ Nome, Código e Tipo são obrigatórios</li>
            <li>✓ Status por padrão é "Disponível"</li>
            <li>✓ Outros campos são opcionais</li>
            <li>✓ Pode fazer upload de uma imagem para o item</li>
          </ul>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
