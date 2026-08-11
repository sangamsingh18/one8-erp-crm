import React, { createContext, useContext, useState, useEffect } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationItem {
  id: string;
  message: string;
  type: NotificationType;
  timestamp: Date;
  read: boolean;
}

interface NotificationContextProps {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (message: string, type: NotificationType) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem('one8_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
      }
    } catch (e) {
      console.error('Failed to load notifications', e);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('one8_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (message: string, type: NotificationType) => {
    // Avoid duplicate notifications in a short window
    const now = new Date();
    const isDuplicate = notifications.slice(0, 3).some(n => 
      n.message === message && 
      n.type === type && 
      (now.getTime() - n.timestamp.getTime()) < 1000
    );

    if (isDuplicate) return;

    const newItem: NotificationItem = {
      id: Math.random().toString(36).substring(2, 9),
      message,
      type,
      timestamp: now,
      read: false
    };
    setNotifications(prev => [newItem, ...prev].slice(0, 50)); // Keep last 50
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAllAsRead, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
