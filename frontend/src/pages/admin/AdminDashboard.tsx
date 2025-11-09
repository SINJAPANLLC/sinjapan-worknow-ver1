import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { adminAPI } from '../../lib/api';
import { slideUp, fadeIn } from '../../utils/animations';
import {
  Users,
  Briefcase,
  FileText,
  DollarSign,
  TrendingUp,
  Activity,
  UserCheck,
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Sparkles, Zap, Flame, MessageCircle, UserCircle } from 'lucide-react';
import { BottomNav } from '../../components/layout/BottomNav';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminAPI.stats(),
  });

  const statsData = stats as any;
  const statsCards = [
    {
      icon: Users,
      label: '総ユーザー数',
      value: statsData?.total_users || 0,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      link: '/admin/users',
    },
    {
      icon: Briefcase,
      label: '総求人数',
      value: statsData?.total_jobs || 0,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      link: '/admin/jobs',
    },
    {
      icon: FileText,
      label: '総応募数',
      value: statsData?.total_applications || 0,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      link: '/applications',
    },
    {
      icon: DollarSign,
      label: '総売上',
      value: `¥${(statsData?.total_revenue || 0).toLocaleString()}`,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      link: '/payments',
    },
  ];

  const recentActivities = [
    { type: 'user', message: '新規ユーザー登録: 田中太郎', time: '5分前', icon: UserCheck, color: 'text-green-600' },
    { type: 'job', message: '新規求人投稿: Webデザイナー募集', time: '10分前', icon: Briefcase, color: 'text-blue-600' },
    { type: 'application', message: '新規応募: 倉庫作業員', time: '15分前', icon: FileText, color: 'text-purple-600' },
    { type: 'payment', message: '支払い完了: ¥50,000', time: '20分前', icon: CheckCircle, color: 'text-green-600' },
    { type: 'alert', message: 'システムアラート: データベース接続エラー', time: '30分前', icon: AlertTriangle, color: 'text-red-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00CED1] via-[#00B4B4] to-[#009999] pb-24">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div {...fadeIn} className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">管理者ダッシュボード</h1>
          <p className="text-white/80 text-lg">プラットフォーム全体の統計とアクティビティ</p>
        </motion.div>

        {isLoading ? (
          <Card className="bg-white/95 backdrop-blur-sm p-12">
            <div className="text-center text-gray-500">読み込み中...</div>
          </Card>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statsCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    {...slideUp}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      className="bg-white/95 backdrop-blur-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
                      onClick={() => navigate(stat.link)}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                            <Icon className={`w-6 h-6 ${stat.textColor}`} />
                          </div>
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Recent Activity */}
            <motion.div {...fadeIn} transition={{ delay: 0.4 }}>
              <Card className="bg-white/95 backdrop-blur-sm">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Activity className="w-6 h-6 text-primary" />
                      <h2 className="text-xl font-bold text-gray-900">最近のアクティビティ</h2>
                    </div>
                    <Button
                      onClick={() => navigate('/activity')}
                      variant="outline"
                      size="sm"
                    >
                      すべて見る
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => {
                      const Icon = activity.icon;
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className={`p-2 rounded-lg ${activity.color} bg-opacity-10`}>
                            <Icon className={`w-5 h-5 ${activity.color}`} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <p className="text-xs text-gray-500">{activity.time}</p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              {...fadeIn}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
            >
              <Card
                className="bg-white/95 backdrop-blur-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => navigate('/admin/users')}
              >
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-50">
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">ユーザー管理</h3>
                      <p className="text-sm text-gray-600">ユーザーの確認と管理</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card
                className="bg-white/95 backdrop-blur-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => navigate('/admin/jobs')}
              >
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-purple-50">
                      <Briefcase className="w-8 h-8 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">求人管理</h3>
                      <p className="text-sm text-gray-600">求人の承認と削除</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card
                className="bg-white/95 backdrop-blur-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => navigate('/admin/stats')}
              >
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-green-50">
                      <Activity className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">統計情報</h3>
                      <p className="text-sm text-gray-600">詳細な統計とレポート</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </div>

      <BottomNav
        items={[
          { label: 'ユーザー', path: '/admin/users', icon: Sparkles },
          { label: '求人', path: '/admin/jobs', icon: Zap },
          { label: 'Now', path: '/dashboard', icon: Flame },
          { label: 'メッセージ', path: '/messages', icon: MessageCircle },
          { label: 'マイページ', path: '/profile', icon: UserCircle },
        ]}
      />
    </div>
  );
}
