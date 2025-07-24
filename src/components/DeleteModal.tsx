import { Icon } from "@iconify/react";

interface DeleteModalProps {
  show: boolean;
  title: string;
  message: React.ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteModal({ show, title, message, onCancel, onConfirm }: DeleteModalProps) {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4 transform transition-all">
        <div className="text-center mb-4">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <Icon icon="mdi:alert-circle" className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
          <div className="text-sm text-gray-500">
            {message}
          </div>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}