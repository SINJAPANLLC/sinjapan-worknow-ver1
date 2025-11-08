import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  ClockIcon, 
  UserIcon, 
  BriefcaseIcon, 
  CreditCardIcon,
  BellIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { activitiesAPI } from '../lib/api';
import type { ActivityLog } from '../types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { formatDateTime } from '../utils/format';
import { Sparkles, Zap, Flame, MessageCircle, UserCircle } from 'lucide-react';
import { BottomNav } from '../components/layout/BottomNav';
import { useAuthStore } from '../stores/authStore';

export default function ActivityPage() {
  const { user } = useAuthStore();
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: () => activitiesAPI.list({ limit: 50 }),
  });

  if (!user) return null;

  const getActionIcon = (actionType: string) => {
    if (actionType.includes('login') || actionType.includes('register')) {
      return <UserIcon className="w-5 h-5 text-blue-500" />;
    }
    if (actionType.includes('job') || actionType.includes('application')) {
      return <BriefcaseIcon className="w-5 h-5 text-green-500" />;
    }
    if (actionType.includes('payment') || actionType.includes('withdrawal')) {
      return <CreditCardIcon className="w-5 h-5 text-purple-500" />;
    }
    if (actionType.includes('notification')) {
      return <BellIcon className="w-5 h-5 text-yellow-500" />;
    }
    if (actionType.includes('profile') || actionType.includes('update')) {
      return <ShieldCheckIcon className="w-5 h-5 text-cyan-500" />;
    }
    return <ClockIcon className="w-5 h-5 text-gray-400" />;
  };

  const getActionBadgeVariant = (actionType: string): 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'info' => {
    if (actionType.includes('create')) return 'success';
    if (actionType.includes('delete')) return 'danger';
    if (actionType.includes('update')) return 'info';
    if (actionType.includes('login')) return 'primary';
    return 'neutral';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-cyan-50 to-teal-50 p-4 pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
              アクティビティ履歴
            </h1>
            <p className="text-gray-600 mt-1">
              あなたのアクションとアクティビティを確認できます
            </p>
          </div>
        </motion.div>

        <Card className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
              <p className="text-gray-500 mt-4">読み込み中...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12">
              <ClockIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">アクティビティ履歴がありません</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </Card>
      </div>

      <BottomNav
        items={[
          { label: 'さがす', path: user.role === 'worker' ? '/jobs' : user.role === 'company' ? '/jobs/manage' : '/admin/users', icon: Sparkles },
          { label: 'はたらく', path: user.role === 'worker' ? '/applications' : user.role === 'company' ? '/jobs/new' : '/admin/jobs', icon: Zap },
          { label: 'Now', path: '/dashboard', icon: Flame },
          { label: 'メッセージ', path: '/messages', icon: MessageCircle },
          { label: 'マイページ', path: user.role === 'admin' ? '/admin/stats' : '/profile', icon: UserCircle },
        ]}
      />
    </div>
  );

  function ActivityItem({ activity }: { activity: ActivityLog }) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div className="flex-shrink-0 mt-1">
          {getActionIcon(activity.action_type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={getActionBadgeVariant(activity.action_type)} size="sm">
                {activity.action_type}
              </Badge>
              {activity.entity_type && (
                <span className="text-xs text-gray-500">
                  {activity.entity_type}
                </span>
              )}
            </div>
            <time className="text-xs text-gray-500 flex-shrink-0">
              {formatDateTime(activity.created_at)}
            </time>
          </div>
          <p className="text-sm text-gray-900">{activity.description}</p>
          {activity.metadata && Object.keys(activity.metadata).length > 0 && (
            <details className="mt-2">
              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                詳細を表示
              </summary>
              <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                {JSON.stringify(activity.metadata, null, 2)}
              </pre>
            </details>
          )}
          {activity.ip_address && (
            <p className="text-xs text-gray-400 mt-1">
              IP: {activity.ip_address}
            </p>
          )}
        </div>
      </motion.div>
    );
  }
}
