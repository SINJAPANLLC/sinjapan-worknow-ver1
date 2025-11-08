import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card } from '../../components/ui/Card';
import { adminAPI } from '../../lib/api';
import { slideUp, fadeIn } from '../../utils/animations';
import {
  Sparkles,
  Zap,
  Flame,
  Bell,
  UserCircle,
  TrendingUp,
  DollarSign,
  FileText,
  Calendar,
} from 'lucide-react';
import { BottomNav } from '../../components/layout/BottomNav';

export default function StatsPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: adminAPI.stats,
  });

  const mockStats = {
    daily: [
      { date: '2025-11-01', users: 12, jobs: 5, applications: 8 },
      { date: '2025-11-02', users: 15, jobs: 7, applications: 12 },
      { date: '2025-11-03', users: 10, jobs: 3, applications: 6 },
      { date: '2025-11-04', users: 18, jobs: 9, applications: 15 },
      { date: '2025-11-05', users: 22, jobs: 11, applications: 20 },
      { date: '2025-11-06', users: 19, jobs: 8, applications: 17 },
      { date: '2025-11-07', users: 25, jobs: 12, applications: 23 },
    ],
    monthly: {
      revenue: 1250000,
      growth: 15.3,
      activeUsers: 487,
      completedJobs: 156,
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-gray-900 pb-20">
      <div className="container mx-auto px-4 py-8">
        <motion.div {...fadeIn}>
          <h1 className="text-3xl font-bold mb-2 text-white">統計情報</h1>
          <p className="text-white/80 mb-6">プラットフォーム全体の詳細な分析</p>
        </motion.div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div {...slideUp}>
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                  <div className="flex items-start justify-between mb-4">
                    <Users className="w-8 h-8 opacity-80" />
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{stats?.total_users || 0}</div>
                  <div className="text-sm opacity-90">総ユーザー数</div>
                  <div className="mt-2 text-xs opacity-75">+12% 先月比</div>
                </Card>
              </motion.div>

              <motion.div {...slideUp} style={{ animationDelay: '0.1s' }}>
                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
                  <div className="flex items-start justify-between mb-4">
                    <Briefcase className="w-8 h-8 opacity-80" />
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{stats?.total_jobs || 0}</div>
                  <div className="text-sm opacity-90">総求人数</div>
                  <div className="mt-2 text-xs opacity-75">+8% 先月比</div>
                </Card>
              </motion.div>

              <motion.div {...slideUp} style={{ animationDelay: '0.2s' }}>
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
                  <div className="flex items-start justify-between mb-4">
                    <FileText className="w-8 h-8 opacity-80" />
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{stats?.total_applications || 0}</div>
                  <div className="text-sm opacity-90">総応募数</div>
                  <div className="mt-2 text-xs opacity-75">+25% 先月比</div>
                </Card>
              </motion.div>

              <motion.div {...slideUp} style={{ animationDelay: '0.3s' }}>
                <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
                  <div className="flex items-start justify-between mb-4">
                    <DollarSign className="w-8 h-8 opacity-80" />
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-bold mb-1">
                    ¥{((stats?.total_revenue || 0) / 10000).toFixed(1)}万
                  </div>
                  <div className="text-sm opacity-90">総収益</div>
                  <div className="mt-2 text-xs opacity-75">+{mockStats.monthly.growth}% 先月比</div>
                </Card>
              </motion.div>
            </div>

            <motion.div {...slideUp} style={{ animationDelay: '0.4s' }}>
              <Card>
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Calendar className="w-6 h-6 mr-2 text-primary" />
                  週間トレンド
                </h3>
                <div className="space-y-3">
                  {mockStats.daily.map((day) => (
                    <div key={day.date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">
                        {new Date(day.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                      </span>
                      <div className="flex gap-4 text-sm">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1 text-blue-500" />
                          <span className="font-medium">{day.users}</span>
                        </div>
                        <div className="flex items-center">
                          <Briefcase className="w-4 h-4 mr-1 text-green-500" />
                          <span className="font-medium">{day.jobs}</span>
                        </div>
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-1 text-purple-500" />
                          <span className="font-medium">{day.applications}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div {...slideUp} style={{ animationDelay: '0.5s' }}>
                <Card>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">月間ハイライト</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/10 to-primary-dark/10 rounded-lg">
                      <span className="text-sm text-gray-700">アクティブユーザー</span>
                      <span className="text-lg font-bold text-primary">{mockStats.monthly.activeUsers}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/10 to-primary-dark/10 rounded-lg">
                      <span className="text-sm text-gray-700">完了した求人</span>
                      <span className="text-lg font-bold text-primary">{mockStats.monthly.completedJobs}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/10 to-primary-dark/10 rounded-lg">
                      <span className="text-sm text-gray-700">平均成約率</span>
                      <span className="text-lg font-bold text-primary">32.1%</span>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div {...slideUp} style={{ animationDelay: '0.6s' }}>
                <Card>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">人気カテゴリー</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'IT・エンジニア', count: 234, color: 'blue' },
                      { name: '営業・マーケティング', count: 156, color: 'green' },
                      { name: 'デザイン・クリエイティブ', count: 98, color: 'purple' },
                      { name: 'カスタマーサポート', count: 67, color: 'amber' },
                    ].map((category, _index) => (
                      <div key={category.name} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{category.name}</span>
                          <span className="font-medium">{category.count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`bg-${category.color}-500 h-2 rounded-full`}
                            style={{ width: `${(category.count / 234) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        )}
      </div>

      <BottomNav
        items={[
          { label: 'さがす', path: '/admin/users', icon: Sparkles },
          { label: 'はたらく', path: '/admin/jobs', icon: Zap },
          { label: 'Now', path: '/dashboard', icon: Flame },
          { label: 'メッセージ', path: '/notifications', icon: Bell },
          { label: 'マイページ', path: '/admin/stats', icon: UserCircle },
        ]}
      />
    </div>
  );
}
