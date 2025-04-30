import { useNotifications } from '../../contexts/NotificationContext';
import { format } from 'date-fns';
import { Bell, Check } from 'lucide-react';

const Notifications = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Notifications</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Stay updated with your service requests and activities
          </p>
        </div>
        {notifications.length > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full">
              <Bell size={24} className="text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-1">
            No notifications
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            You're all caught up! Check back later for new notifications.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white dark:bg-neutral-800 rounded-lg shadow-sm border ${
                !notification.read
                  ? 'border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-neutral-200 dark:border-neutral-700'
              }`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="font-medium text-neutral-900 dark:text-white">
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
                          New
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-neutral-600 dark:text-neutral-400">
                      {notification.message}
                    </p>
                    <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-500">
                      {format(notification.timestamp.toDate(), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="ml-4 p-1 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 rounded-full hover:bg-primary-50 dark:hover:bg-primary-900/30"
                    >
                      <Check size={20} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;