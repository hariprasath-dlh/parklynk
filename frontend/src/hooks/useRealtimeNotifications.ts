import { useEffect, useState } from 'react';
import { notificationsAPI } from '@/services/api';
import { getSocket } from '@/lib/socket';
import { useToast } from '@/hooks/use-toast';
import { Notification } from '@/types';

export const useRealtimeNotifications = (enabled: boolean) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (!enabled) return;

    const token = localStorage.getItem('parklynk-token');
    if (!token) return;

    const loadUnreadCount = async () => {
      try {
        const response = await notificationsAPI.getUnreadCount();
        if (response.success) {
          setUnreadCount(response.count);
        }
      } catch {
        // Keep the layout functional even if notifications fail.
      }
    };

    loadUnreadCount();
    const interval = window.setInterval(loadUnreadCount, 15000);

    const socket = getSocket(token);
    const handleNotification = (notification: Notification) => {
      setUnreadCount((current) => current + (notification.isRead ? 0 : 1));
      toast({
        title: notification.title,
        description: notification.message,
      });
    };

    socket?.on('new-notification', handleNotification);

    return () => {
      window.clearInterval(interval);
      socket?.off('new-notification', handleNotification);
    };
  }, [enabled, toast]);

  return {
    unreadCount,
    setUnreadCount,
  };
};
