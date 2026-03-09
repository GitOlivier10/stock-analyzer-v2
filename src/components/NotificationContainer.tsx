import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { Notification } from '../hooks/useNotification';

interface NotificationToastProps {
  notification: Notification;
  isDark: boolean;
  onRemove: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ 
  notification, 
  isDark, 
  onRemove 
}) => {
  const icons = {
    success: <CheckCircle size={20} />,
    error: <AlertCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    info: <Info size={20} />,
  };

  const colors = {
    success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    error: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  return (
    <div 
      className={cn(
        'border rounded-lg p-4 flex items-center gap-3 mb-2',
        colors[notification.type],
        isDark ? 'bg-opacity-90' : ''
      )}
    >
      <div className="flex-shrink-0">
        {icons[notification.type]}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{notification.message}</p>
      </div>
      <button
        onClick={() => onRemove(notification.id)}
        className="flex-shrink-0 hover:opacity-75 transition-opacity"
      >
        <X size={18} />
      </button>
    </div>
  );
};

interface NotificationContainerProps {
  notifications: Notification[];
  isDark: boolean;
  onRemove: (id: string) => void;
}

export const NotificationContainer: React.FC<NotificationContainerProps> = ({
  notifications,
  isDark,
  onRemove,
}) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      {notifications.map(notification => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          isDark={isDark}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};
