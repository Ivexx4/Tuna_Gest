'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { inventoryService } from '@/lib/services';
import { InventoryFormData } from '@/lib/schemas';
import InventoryForm from '@/components/InventoryForm';
import AuthenticatedLayout from '@/app/authenticated-layout';
import { InventoryItem } from '@/types/database';
import { toast } from 'sonner';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function EditInventoryItemPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = parseInt(params.id as string);

  const [item, setItem] = useState<InventoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Carregar dados do item
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const { data, error } = await inventoryService.getItem(itemId);
        if (error) throw error;
        setItem(data);
      } catch (error) {
        console.error('Erro ao carregar item:', error);
        toast.error('Erro ao carregar item');
        router.push('/inventory');
      } finally {
        setIsFetching(false);
      }
    };

    fetchItem();
  }, [itemId, router]);

  const handleSubmit = async (data: InventoryFormData, imageFile?: File) => {
    setIsLoading(true);
    let imageUrl: string | undefined = data.image_url; // Default to existing URL if any

    try {
      if (imageFile) {
        // Assuming tuna_id is 1 for now
        const { data: uploadData, error: uploadError } = await inventoryService.uploadImage(imageFile, itemId, 1);
        if (uploadError) {
          throw new Error(uploadError.message || 'Erro ao fazer upload da imagem.');
        }
        imageUrl = uploadData?.publicUrl;
      } else if (data.image_url === '') {
        // If image was cleared in the form
        imageUrl = undefined;
      } else {
        // No new file, keep existing image_url from initialData
        imageUrl = item?.image_url;
      }

      await inventoryService.updateItem(itemId, {
        name: data.name,
        description: data.description || undefined,
        item_type: data.item_type,
        code: data.code,
        purchase_date: data.purchase_date || undefined,
        purchase_price: data.purchase_price || undefined,
        status: data.status,
        section_id: data.section_id || undefined,
        image_url: imageUrl, // Use the uploaded image URL or existing one
      });

      toast.success(`${data.name} foi atualizado com sucesso!`);
      router.push(`/inventory/${itemId}`);
    } catch (error: any) {
      console.error('Erro ao atualizar item:', error);
      toast.error(error.message || 'Erro ao atualizar item');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando dados do item...</p>
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

  return (
    <AuthenticatedLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <Link
          href={`/inventory/${itemId}`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para Detalhes do Item
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            ✏️ Editar Item
          </h1>
          <p className="text-gray-600 mt-2">
            Atualize as informações de {item.name}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow p-8">
          <InventoryForm
            initialData={item}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            onCancel={() => router.push(`/inventory/${itemId}`)}
          />
        </div>

        {/* Última atualização */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
          <p>
            <strong>Última atualização:</strong>{' '}
            {new Date(item.updated_at).toLocaleDateString('pt-PT')}
          </p>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
