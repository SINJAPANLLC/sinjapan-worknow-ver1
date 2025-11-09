import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { jobsAPI, authAPI } from '../../lib/api';
import { slideUp, fadeIn, scaleIn } from '../../utils/animations';
import {
  Briefcase,
  FileText,
  Users,
  Radio,
  Plus,
  TrendingUp,
  Calendar,
  Zap,
  MessageCircle,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { RoleBottomNav } from '../../components/layout/RoleBottomNav';

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: myJobs, isLoading: jobsLoading, refetch: refetchJobs } = useQuery({
    queryKey: ['jobs', 'my'],
    queryFn: () => jobsAPI.list({ size: 20 }),
  });

  const { data: onlineWorkers, refetch: refetchWorkers } = useQuery({
    queryKey: ['workers', 'online'],
    queryFn: () => authAPI.getOnlineWorkers(20),
    refetchInterval: 30000,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchJobs(), refetchWorkers()]);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const publishedJobs = myJobs?.filter((j: any) => j.status === 'published') || [];
  const draftJobs = myJobs?.filter((j: any) => j.status === 'draft') || [];

  const thisMonthJobs = myJobs?.filter((j: any) => {
    const jobDate = new Date(j.created_at);
    const now = new Date();
    return jobDate.getMonth() === now.getMonth() && jobDate.getFullYear() === now.getFullYear();
  }) || [];

  // Calculate total applications from job data
  const totalApplications = myJobs?.reduce((sum: number, job: any) => sum + (job.application_count || 0), 0) || 0;

  const stats = [
    {
      icon: Briefcase,
      label: '公開中',
      value: publishedJobs.length,
      color: 'from-green-400 to-emerald-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: FileText,
      label: '下書き',
      value: draftJobs.length,
      color: 'from-yellow-400 to-orange-400',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-500/10',
    },
    {
      icon: Users,
      label: '総応募数',
      value: totalApplications,
      color: 'from-blue-400 to-cyan-400',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: TrendingUp,
      label: '今月の求人',
      value: thisMonthJobs.length,
      color: 'from-[#00CED1] to-[#009999]',
      textColor: 'text-[#00CED1]',
      bgColor: 'bg-[#00CED1]/10',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00CED1] via-[#00A5A8] to-[#009999] pb-24 pt-28">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          variants={fadeIn}
          initial="initial"
          animate="animate"
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">企業ダッシュボード</h1>
              <p className="text-white/90">求人と応募者を管理しましょう</p>
            </div>
            <button
              onClick={handleRefresh}
              className={`p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            >
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={slideUp}
              initial="initial"
              animate="animate"
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-4 md:p-5 hover:shadow-xl transition-shadow">
                <div className="flex flex-col items-center text-center">
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-lg`}>
                    <stat.icon className="w-6 h-6 md:w-7 md:h-7 text-white" strokeWidth={2.5} />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-xs md:text-sm text-gray-600 font-medium">{stat.label}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-6">
          {/* Quick Actions */}
          <motion.div
            variants={slideUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.2 }}
          >
            <Card className="p-5 md:p-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#00CED1]" />
                クイックアクション
              </h2>
              <div className="space-y-3">
                <Link to="/jobs/new" className="block">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="primary" className="w-full justify-start text-left h-auto py-4">
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                          <Plus className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold">新しい求人を作成</p>
                          <p className="text-xs text-white/80">ワーカーを募集する</p>
                        </div>
                      </div>
                    </Button>
                  </motion.div>
                </Link>
                
                <Link to="/jobs/manage" className="block">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <div className="p-4 rounded-xl border-2 border-[#00CED1]/30 hover:border-[#00CED1] bg-[#00CED1]/5 hover:bg-[#00CED1]/10 transition-all cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#00CED1]/20 flex items-center justify-center flex-shrink-0">
                          <Briefcase className="w-5 h-5 text-[#00CED1]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900">求人を管理</p>
                          <p className="text-xs text-gray-600">応募者の確認・選考</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>

                <Link to="/client/messages" className="block">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <div className="p-4 rounded-xl border-2 border-neutral-200 hover:border-neutral-300 bg-neutral-50 hover:bg-neutral-100 transition-all cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-neutral-200 flex items-center justify-center flex-shrink-0">
                          <MessageCircle className="w-5 h-5 text-neutral-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900">メッセージ</p>
                          <p className="text-xs text-gray-600">ワーカーと連絡</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </div>
            </Card>
          </motion.div>

          {/* Online Workers */}
          <motion.div
            variants={slideUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.3 }}
          >
            <Card className="p-5 md:p-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Radio className="w-5 h-5 text-[#00CED1] animate-pulse" />
                  オンライン中のワーカー
                </h2>
                <Badge variant="success" className="animate-pulse">
                  {onlineWorkers?.length || 0}人
                </Badge>
              </div>

              {onlineWorkers && onlineWorkers.length > 0 ? (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#00CED1]/20 scrollbar-track-transparent">
                  {onlineWorkers.slice(0, 15).map((worker: any, index: number) => (
                    <motion.div
                      key={worker.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-[#00CED1]/10 to-[#009999]/10 hover:from-[#00CED1]/20 hover:to-[#009999]/20 transition-all group cursor-pointer"
                      onClick={() => navigate(`/client/messages?user=${worker.id}`)}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00CED1] to-[#009999] flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md">
                        {worker.full_name?.charAt(0) || 'W'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{worker.full_name}</p>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                          <p className="text-xs text-gray-600">稼働可能</p>
                        </div>
                      </div>
                      <MessageCircle className="w-4 h-4 text-[#00CED1] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-8 h-8 text-neutral-400" />
                  </div>
                  <p className="text-gray-600 text-sm">現在オンラインのワーカーはいません</p>
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Recent Jobs */}
        <motion.div
          variants={slideUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.4 }}
        >
          <Card className="p-5 md:p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#00CED1]" />
                あなたの求人
              </h2>
              <Link to="/jobs/new">
                <Button variant="ghost" size="sm" className="text-[#00CED1]">
                  <Plus className="w-4 h-4 mr-1" />
                  新規作成
                </Button>
              </Link>
            </div>

            {jobsLoading ? (
              <div className="text-center py-12">
                <div className="inline-block w-12 h-12 border-4 border-[#00CED1]/20 border-t-[#00CED1] rounded-full animate-spin"></div>
                <p className="text-gray-600 mt-4">読み込み中...</p>
              </div>
            ) : myJobs && myJobs.length > 0 ? (
              <div className="space-y-3">
                {myJobs.slice(0, 5).map((job: any) => (
                  <motion.div
                    key={job.id}
                    variants={scaleIn}
                    whileHover={{ scale: 1.01 }}
                    className="p-4 border-2 border-neutral-200 rounded-xl hover:border-[#00CED1] hover:shadow-md transition-all cursor-pointer bg-white"
                    onClick={() => navigate(`/jobs/${job.id}/edit`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="font-bold text-gray-900 text-lg">{job.title}</h3>
                          <Badge
                            variant={
                              job.status === 'published'
                                ? 'success'
                                : job.status === 'draft'
                                ? 'warning'
                                : 'danger'
                            }
                          >
                            {job.status === 'published'
                              ? '公開中'
                              : job.status === 'draft'
                              ? '下書き'
                              : '終了'}
                          </Badge>
                          {job.is_urgent && (
                            <Badge variant="danger">
                              急募
                            </Badge>
                          )}
                        </div>
                        {job.hourly_rate && (
                          <p className="text-[#00CED1] font-bold text-xl mb-2">
                            ¥{job.hourly_rate.toLocaleString()}/時
                          </p>
                        )}
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{job.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{job.work_date ? new Date(job.work_date).toLocaleDateString('ja-JP') : '日時未定'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{job.application_count || 0}件の応募</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/jobs/${job.id}/edit`);
                      }}>
                        編集
                      </Button>
                    </div>

                    {job.tags && job.tags.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {job.tags.slice(0, 4).map((tag: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-1 text-xs bg-[#00CED1]/10 text-[#00CED1] rounded-lg font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
                
                {myJobs.length > 5 && (
                  <Link to="/jobs/manage">
                    <Button variant="outline" className="w-full mt-4">
                      すべての求人を見る ({myJobs.length}件)
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-[#00CED1]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-10 h-10 text-[#00CED1]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">まだ求人を作成していません</h3>
                <p className="text-gray-600 mb-6">最初の求人を作成して、優秀なワーカーを見つけましょう</p>
                <Link to="/jobs/new">
                  <Button variant="primary" size="lg">
                    <Plus className="w-5 h-5 mr-2" />
                    最初の求人を作成
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      <RoleBottomNav />
    </div>
  );
}
