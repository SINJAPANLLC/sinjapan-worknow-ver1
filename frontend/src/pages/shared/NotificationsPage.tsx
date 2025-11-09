import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { notificationsAPI } from '../../lib/api';
import { slideUp, fadeIn } from '../../utils/animations';
import { MessageCircle, Check, Trash2, CheckCheck, AlertCircle, Info, Briefcase, DollarSign, Bell } from 'lucide-react';
import { RoleBottomNav } from '../../components/layout/RoleBottomNav';
import { useAuthStore } from '../../stores/authStore';

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsAPI.list,
  });

  if (!user) return null;

  const markAsReadMutation = useMutation({
    mutationFn: notificationsAPI.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: notificationsAPI.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: notificationsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'job':
        return <Briefcase className="w-5 h-5 text-blue-500" />;
      case 'payment':
        return <DollarSign className="w-5 h-5 text-green-500" />;
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const unreadCount = notifications?.filter((n) => !n.is_read).length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-gray-900 pb-20">
      <div className="container mx-auto px-4 py-8">
        <motion.div {...fadeIn} className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className="w-8 h-8 text-white" />
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">通知</h1>
              <p className="text-white/80">
                {unreadCount > 0 ? `${unreadCount}件の未読通知があります` : 'すべて既読です'}
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              <CheckCheck className="w-5 h-5 mr-2" />
              すべて既読
            </Button>
          )}
        </motion.div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        ) : notifications && notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                {...slideUp}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <Card className={`transition-all ${!notification.is_read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}>
                  <div className="flex items-start gap-4">
                    <div className="mt-1">{getNotificationIcon(notification.type)}</div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-gray-900">{notification.title}</h3>
                        {!notification.is_read && (
                          <Badge variant="primary" size="sm">
                            新着
                          </Badge>
                        )}
                      </div>

                      <p className="text-gray-600 text-sm mb-3">{notification.message}</p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {new Date(notification.created_at).toLocaleString('ja-JP')}
                        </span>

                        <div className="flex gap-2">
                          {!notification.is_read && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => markAsReadMutation.mutate(notification.id)}
                              disabled={markAsReadMutation.isPending}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              既読
                            </Button>
                          )}
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => deleteMutation.mutate(notification.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div {...fadeIn} className="text-center py-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto">
              <Bell className="w-16 h-16 text-white/60 mx-auto mb-4" />
              <p className="text-white text-lg mb-2">通知はありません</p>
              <p className="text-white/70 text-sm">新しい通知が届くとここに表示されます</p>
            </div>
          </motion.div>
        )}
      </div>

      <RoleBottomNav />
    </div>
  );
}
