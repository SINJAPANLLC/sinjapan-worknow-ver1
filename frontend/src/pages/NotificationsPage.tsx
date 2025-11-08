import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BellIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { notificationsAPI, type Notification } from '../lib/api';
import { slideUp } from '../utils/animations';

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const result = await notificationsAPI.list(1, 50);
      setNotifications(result.items);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const updated = await notificationsAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? updated : n))
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const getNotificationIcon = () => {
    return <BellIcon className="w-6 h-6" />;
  };

  const getNotificationVariant = (type: string) => {
    switch (type) {
      case 'application':
        return 'primary';
      case 'assignment':
        return 'success';
      case 'payment':
        return 'warning';
      case 'system':
        return 'neutral';
      default:
        return 'neutral';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'application':
        return '応募';
      case 'assignment':
        return '業務';
      case 'payment':
        return '決済';
      case 'system':
        return 'システム';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#00CED1] via-[#00A5A8] to-[#009999] flex items-center justify-center">
        <p className="text-white text-lg">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00CED1] via-[#00A5A8] to-[#009999] p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <motion.div
          variants={slideUp}
          initial="initial"
          animate="animate"
        >
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-white">通知</h1>
            <Badge variant="neutral">
              {notifications.filter((n) => !n.read_at).length} 件未読
            </Badge>
          </div>
        </motion.div>

        {notifications.length === 0 ? (
          <motion.div
            variants={slideUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.1 }}
          >
            <Card className="p-12 text-center">
              <BellIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">通知はありません</p>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                variants={slideUp}
                initial="initial"
                animate="animate"
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={`p-4 cursor-pointer transition-all ${
                    !notification.read_at
                      ? 'bg-blue-50 border-l-4 border-[#00CED1]'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => !notification.read_at && handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className={`p-2 rounded-full ${
                        !notification.read_at ? 'bg-[#00CED1] text-white' : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {getNotificationIcon()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={getNotificationVariant(notification.type)}>
                          {getTypeLabel(notification.type)}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(notification.created_at).toLocaleString('ja-JP')}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-600">{notification.body}</p>
                    </div>
                    {notification.read_at && (
                      <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
