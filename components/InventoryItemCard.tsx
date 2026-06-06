import Link from 'next/link';
import { InventoryItem } from '@/types/database';
import { Package, Tag, Box, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface InventoryItemCardProps {
  item: InventoryItem;
  showLink?: boolean;
}

export default function InventoryItemCard({ item, showLink = true }: InventoryItemCardProps) {
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

  const content = (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Package className="w-5 h-5" /> {item.name}
        </h3>
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getItemStatusColor(
            item.status
          )}`}
        >
          {getItemStatusLabel(item.status)}
        </span>
      </div>

      {item.image_url && (
        <div className="flex-shrink-0">
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-32 object-cover rounded-md"
          />
        </div>
      )}

      <p className="text-gray-700 flex items-center gap-2">
        <Tag className="w-4 h-4 text-gray-500" /> Código: {item.code}
      </p>
      <p className="text-gray-700 flex items-center gap-2">
        <Box className="w-4 h-4 text-gray-500" /> Tipo: {item.item_type}
      </p>
      {item.description && (
        <p className="text-gray-600 text-sm mt-2 line-clamp-3 flex-grow">{item.description}</p>
      )}
    </div>
  );

  return showLink ? (
    <Link href={`/inventory/${item.id}`} className="block hover:shadow-lg transition-shadow">
      {content}
    </Link>
  ) : (
    content
  );
}
