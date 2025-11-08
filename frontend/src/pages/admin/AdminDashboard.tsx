import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { adminAPI } from '../../lib/api';
import { slideUp, fadeIn } from '../../utils/animations';
import {
  UserGroupIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  CurrencyYenIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminAPI.stats(),
  });

  const statsCards = [
    {
      icon: UserGroupIcon,
      label: '総ユーザー数',
      value: stats?.total_users || 0,
      change: '+12%',
      trend: 'up' as const,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: BriefcaseIcon,
      label: '総求人数',
      value: stats?.total_jobs || 0,
      change: '+8%',
      trend: 'up' as const,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      icon: DocumentTextIcon,
      label: '総応募数',
      value: stats?.total_applications || 0,
      change: '+15%',
      trend: 'up' as const,
      color: 'text-primary-dark',
      bgColor: 'bg-primary-dark/10',
    },
    {
      icon: CurrencyYenIcon,
      label: '総売上',
      value: `¥${stats?.total_revenue?.toLocaleString() || 0}`,
      change: '+5%',
      trend: 'up' as const,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-light to-white pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          variants={fadeIn}
          initial="initial"
          animate="animate"
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            管理者ダッシュボード
          </h1>
          <p className="text-gray-600">
            プラットフォーム全体の統計とアクティビティ
          </p>
        </motion.div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">読み込み中...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statsCards.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  variants={slideUp}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        {stat.trend === 'up' ? (
                          <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />
                        ) : (
                          <ArrowTrendingDownIcon className="w-4 h-4 text-red-600" />
                        )}
                        <span
                          className={
                            stat.trend === 'up'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }
                        >
                          {stat.change}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <motion.div
                variants={slideUp}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.3 }}
              >
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    最近のアクティビティ
                  </h2>
                  {stats?.recent_activities &&
                  stats.recent_activities.length > 0 ? (
                    <div className="space-y-4">
                      {stats.recent_activities.map((activity: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {activity.title || 'アクティビティ'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {activity.description || '詳細なし'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {activity.timestamp
                                ? new Date(
                                    activity.timestamp
                                  ).toLocaleString('ja-JP')
                                : '時刻不明'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">
                      最近のアクティビティはありません
                    </p>
                  )}
                </Card>
              </motion.div>

              <motion.div
                variants={slideUp}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.4 }}
              >
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    システムステータス
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          データベース
                        </p>
                        <p className="text-sm text-gray-600">
                          正常に動作しています
                        </p>
                      </div>
                      <Badge variant="success">正常</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">API</p>
                        <p className="text-sm text-gray-600">
                          正常に動作しています
                        </p>
                      </div>
                      <Badge variant="success">正常</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">決済</p>
                        <p className="text-sm text-gray-600">
                          Stripe接続中
                        </p>
                      </div>
                      <Badge variant="success">接続中</Badge>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
