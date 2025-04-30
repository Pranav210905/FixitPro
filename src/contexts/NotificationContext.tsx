import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { firestore } from '../firebase/config';
import { useAuth } from './AuthContext';

interface Notification {
  id: string;
  type: 'new_request' | 'accepted' | 'completed';
  title: string;
  message: string;
  timestamp: Timestamp;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!currentUser) return;

    // Listen for new bookings
    const bookingsQuery = query(
      collection(firestore, 'bookings'),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(bookingsQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          const newNotification: Notification = {
            id: change.doc.id,
            type: 'new_request',
            title: 'New Service Request',
            message: `New ${data.serviceType} service request received`,
            timestamp: data.createdAt,
            read: false
          };
          
          setNotifications(prev => [newNotification, ...prev]);
        }
      });
    });

    return () => unsubscribe();
  }, [currentUser]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};