import { Icon } from "@iconify/react";
import { useEffect } from "react";

type NotificationType = "success" | "error";

interface NotificationProps {
  show: boolean;
  message: string;
  type: NotificationType;
  onClose: () => void;
  autoHideDuration?: number;
}

export default function Notification({ 
  show, 
  message, 
  type, 
  onClose, 
  autoHideDuration = 3000 
}: NotificationProps) {
  useEffect(() => {
    if (show && autoHideDuration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoHideDuration);
      
      return () => clearTimeout(timer);
    }
  }, [show, autoHideDuration, onClose]);
  
  if (!show) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div 
        className={`rounded-lg shadow-lg p-4 flex items-center space-x-3 transform transition-all duration-300 ${
          type === 'success' ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'
        }`}
        style={{ minWidth: '300px' }}
      >
        <div className={`flex-shrink-0 ${type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
          <Icon 
            icon={type === 'success' ? 'mdi:check-circle' : 'mdi:alert-circle'} 
            className="h-5 w-5" 
          />
        </div>
        <div className="flex-1">
          <p className={`text-sm font-medium ${type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
            {message}
          </p>
        </div>
        <button 
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-500 focus:outline-none"
        >
          <Icon icon="mdi:close" className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}