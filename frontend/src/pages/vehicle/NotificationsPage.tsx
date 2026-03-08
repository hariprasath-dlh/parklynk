import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Notification, NotificationCategory } from '@/types';
import { notificationsAPI } from '@/services/api';

const categories: { value: NotificationCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'booking', label: 'Bookings' },
  { value: 'payment', label: 'Payments' },
  { value: 'overstay', label: 'Overstay' },
  { value: 'system', label: 'System' },
];

const NotificationsPage = () => {
  const [filter, setFilter] = useState<NotificationCategory | 'all'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const loadNotifications = async () => {
    const response = await notificationsAPI.getAll();
    if (response.success) {
      const items = response.notifications;
      setNotifications(items.map((item) => ({ ...item, isRead: true })));
      if (items.some((item) => !item.isRead)) {
        await notificationsAPI.markAllRead();
      }
    }
  };

  useEffect(() => {
    loadNotifications().catch(() => undefined);
  }, []);

  const filtered = useMemo(
    () => (filter === 'all' ? notifications : notifications.filter((notification) => notification.category === filter)),
    [filter, notifications]
  );

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  const markRead = async (id: string) => {
    setNotifications((current) => current.map((notification) => (notification.id === id ? { ...notification, isRead: true } : notification)));
    await notificationsAPI.markRead(id);
  };

  const deleteNotification = async (id: string) => {
    setNotifications((current) => current.filter((notification) => notification.id !== id));
    await notificationsAPI.delete(id);
  };

  const markAllRead = async () => {
    setNotifications((current) => current.map((notification) => ({ ...notification, isRead: true })));
    await notificationsAPI.markAllRead();
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="font-heading text-xl font-bold">Notifications</h1>
          {unreadCount > 0 ? (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
              {unreadCount}
            </span>
          ) : null}
        </div>
        <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs">
          <Check className="mr-1 h-3 w-3" /> Mark all read
        </Button>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => setFilter(category.value)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs transition-colors ${
              filter === category.value ? 'bg-accent text-accent-foreground' : 'bg-surface text-muted-foreground hover:text-foreground'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className={`flex items-start gap-3 rounded-lg border bg-card p-3 ${notification.isRead ? 'border-border' : 'border-accent/30 bg-accent/5'}`}
          >
            <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notification.isRead ? 'bg-muted' : 'bg-accent animate-pulse'}`} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{notification.title}</p>
              <p className="text-xs text-muted-foreground">{notification.message}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">{new Date(notification.createdAt).toLocaleString()}</p>
            </div>
            <div className="flex shrink-0 gap-1">
              {!notification.isRead ? (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => markRead(notification.id)}>
                  <Check className="h-3 w-3" />
                </Button>
              ) : null}
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => deleteNotification(notification.id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Bell className="mx-auto mb-2 h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No notifications</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default NotificationsPage;
