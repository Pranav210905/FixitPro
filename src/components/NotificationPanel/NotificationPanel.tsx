import { format } from 'date-fns';
import { Bell, X, Check } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel = ({ isOpen, onClose }: NotificationPanelProps) => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
        <div className="flex items-center">
          <Bell size={16} className="text-primary-600 dark:text-primary-400 mr-2" />
          <h3 className="font-medium text-neutral-900 dark:text-white">Notifications</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={markAllAsRead}
            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          >
            Mark all as read
          </button>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-neutral-600 dark:text-neutral-400">
            No notifications
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors ${
                !notification.read ? 'bg-primary-50 dark:bg-primary-900/20' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-neutral-900 dark:text-white">
                    {notification.title}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {notification.message}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                    {format(notification.timestamp.toDate(), 'MMM d, h:mm a')}
                  </p>
                </div>
                {!notification.read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                  >
                    <Check size={16} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;