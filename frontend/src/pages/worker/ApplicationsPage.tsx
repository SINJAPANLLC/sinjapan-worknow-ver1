import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { applicationsAPI, assignmentsAPI, reviewsAPI, type Application, type Assignment } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { Sparkles, Zap, Flame, Bell, UserCircle, Clock, CheckCircle, XCircle, AlertCircle, BookOpen, ChevronRight, QrCode, LogIn, LogOut, Star } from 'lucide-react';
import { BottomNav } from '../../components/layout/BottomNav';

export default function ApplicationsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const { user } = useAuthStore();

  const { data: applications, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: applicationsAPI.list,
  });

  const { data: assignments } = useQuery({
    queryKey: ['assignments'],
    queryFn: assignmentsAPI.list,
  });

  const { data: myReviews } = useQuery({
    queryKey: ['my-reviews', user?.id],
    queryFn: () => reviewsAPI.list({ reviewer_id: user?.id }),
    enabled: !!user?.id,
  });

  const upcomingApplications = applications?.filter(app => 
    app.status === 'hired' || app.status === 'interview'
  ) || [];

  const pastApplications = applications?.filter(app => 
    app.status === 'rejected' || app.status === 'withdrawn'
  ) || [];

  const getStatusBadge = (status: Application['status']) => {
    switch (status) {
      case 'pending':
        return { variant: 'warning' as const, icon: Clock, text: '審査中' };
      case 'interview':
        return { variant: 'info' as const, icon: AlertCircle, text: '面接予定' };
      case 'hired':
        return { variant: 'success' as const, icon: CheckCircle, text: '採用' };
      case 'rejected':
        return { variant: 'danger' as const, icon: XCircle, text: '不採用' };
      case 'withdrawn':
        return { variant: 'neutral' as const, icon: XCircle, text: '辞退' };
      default:
        return { variant: 'neutral' as const, icon: Clock, text: status };
    }
  };

  const getAssignmentForApplication = (applicationId: string): Assignment | undefined => {
    return assignments?.find(a => a.application_id === applicationId);
  };

  const hasReviewed = (assignmentId: string): boolean => {
    return myReviews?.some(r => r.assignment_id === assignmentId) || false;
  };

  const currentApplications = activeTab === 'upcoming' ? upcomingApplications : pastApplications;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00CED1] via-[#00B5B5] to-[#009999] pt-16 pb-24">
      <div className="bg-white/95 backdrop-blur-sm pt-20 pb-0 sticky top-0 z-20 shadow-lg">
        <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-[#00CED1] to-[#009999] bg-clip-text text-transparent py-4">はたらく</h1>
        
        <div className="flex">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-4 text-center font-medium transition-all relative ${
              activeTab === 'upcoming' 
                ? 'text-gray-900' 
                : 'text-gray-500'
            }`}
          >
            今後の予定
            {activeTab === 'upcoming' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00CED1] to-[#009999]"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 py-4 text-center font-medium transition-all relative ${
              activeTab === 'past' 
                ? 'text-gray-900' 
                : 'text-gray-500'
            }`}
          >
            これまでの仕事
            {activeTab === 'past' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00CED1] to-[#009999]"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        </div>
      </div>

      <div className="px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#00CED1] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : currentApplications.length > 0 ? (
          <div className="space-y-3">
            {currentApplications.map((application, index) => {
              const statusInfo = getStatusBadge(application.status);
              const StatusIcon = statusInfo.icon;
              const assignment = getAssignmentForApplication(application.id);
              const canCheckIn = assignment && assignment.status === 'active' && !assignment.started_at;
              const canCheckOut = assignment && assignment.status === 'active' && assignment.started_at && !assignment.completed_at;
              const isCompleted = assignment && assignment.completed_at;
              const canReview = assignment && assignment.status === 'completed' && !hasReviewed(assignment.id);

              return (
                <motion.div
                  key={application.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-base text-gray-900 mb-2">求人ID: {application.job_id}</h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={statusInfo.variant} size="sm">
                            <StatusIcon className="w-3.5 h-3.5 mr-1" />
                            {statusInfo.text}
                          </Badge>
                          {assignment && (
                            <Badge variant={assignment.status === 'active' ? 'success' : 'neutral'} size="sm">
                              {assignment.status === 'active' ? '進行中' : assignment.status === 'completed' ? '完了' : 'キャンセル'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {application.cover_letter && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-xs font-medium text-gray-700 mb-1">カバーレター</p>
                        <p className="text-xs text-gray-600 line-clamp-2">{application.cover_letter}</p>
                      </div>
                    )}

                    {assignment && (
                      <div className="bg-gradient-to-r from-[#00CED1]/10 to-[#009999]/10 rounded-lg p-3 mb-3">
                        <div className="text-xs space-y-1">
                          {assignment.started_at && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-[#00CED1]" />
                              <span className="text-gray-700">
                                開始: {new Date(assignment.started_at).toLocaleString('ja-JP')}
                              </span>
                            </div>
                          )}
                          {assignment.completed_at && (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                              <span className="text-gray-700">
                                完了: {new Date(assignment.completed_at).toLocaleString('ja-JP')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>応募日: {new Date(application.created_at).toLocaleDateString('ja-JP')}</span>
                    </div>

                    {(canCheckIn || canCheckOut || canReview) && (
                      <div className="flex gap-2 pt-3 border-t border-gray-200">
                        {canCheckIn && (
                          <Button
                            onClick={() => navigate(`/qr-scan?assignment_id=${assignment.id}&type=check_in`)}
                            className="flex-1 bg-gradient-to-r from-[#00CED1] to-[#009999] text-white hover:from-[#00D4D4] hover:to-[#008888]"
                            size="sm"
                          >
                            <LogIn className="w-4 h-4 mr-1" />
                            チェックイン
                          </Button>
                        )}
                        {canCheckOut && (
                          <Button
                            onClick={() => navigate(`/qr-scan?assignment_id=${assignment.id}&type=check_out`)}
                            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                            size="sm"
                          >
                            <LogOut className="w-4 h-4 mr-1" />
                            チェックアウト
                          </Button>
                        )}
                        {canReview && (
                          <Button
                            onClick={() => navigate(`/review?assignment_id=${assignment.id}`)}
                            className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600"
                            size="sm"
                          >
                            <Star className="w-4 h-4 mr-1" />
                            レビューする
                          </Button>
                        )}
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-8 px-4"
          >
            <div className="relative mb-8 overflow-hidden rounded-3xl bg-white/95 backdrop-blur-sm p-8 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00CED1]/10 via-[#00B5B5]/10 to-[#009999]/10" />
              
              <motion.div
                className="relative"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex justify-center mb-6">
                  <motion.div
                    className="relative w-32 h-32"
                    animate={{
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#00CED1] to-[#009999] rounded-full opacity-20 blur-xl" />
                    <div className="absolute inset-2 bg-gradient-to-br from-[#00CED1] to-[#009999] rounded-full flex items-center justify-center shadow-2xl">
                      <Zap className="w-16 h-16 text-white" />
                    </div>
                  </motion.div>
                </div>

                <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-[#00CED1] to-[#009999] bg-clip-text text-transparent mb-3 whitespace-nowrap">
                  {activeTab === 'upcoming' ? '今後の予定はありません' : '過去の仕事はありません'}
                </h2>
                <p className="text-center text-gray-700 mb-6">
                  次のお仕事を探してみましょう。<br/>
                  今すぐ働いて、即時報酬を手に入れよう！
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link to="/jobs" className="flex-1 sm:flex-none">
                    <Button 
                      variant="primary" 
                      className="w-full bg-gradient-to-r from-[#00CED1] to-[#009999] hover:from-[#00D4D4] hover:to-[#008888] text-white px-8 py-4 rounded-xl shadow-lg font-bold"
                    >
                      おすすめ求人を見る
                    </Button>
                  </Link>
                  <Link to="/guide/work-style" className="flex-1 sm:flex-none">
                    <Button 
                      variant="outline" 
                      className="w-full border-2 border-[#00CED1] text-[#00CED1] hover:bg-[#00CED1]/10 px-8 py-4 rounded-xl font-bold"
                    >
                      ガイドで準備する
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#00CED1] to-[#009999] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg bg-gradient-to-r from-[#00CED1] to-[#009999] bg-clip-text text-transparent mb-2">Work Now の使い方</h3>
                  <p className="text-sm text-gray-700 mb-3">初めての方でも安心。働き方ガイドで詳しく説明しています。</p>
                  <Link to="/guide/work-style" className="text-sm font-semibold text-[#00CED1] hover:text-[#009999] flex items-center gap-1">
                    詳しく見る
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <BottomNav
        items={[
          { label: 'さがす', path: '/jobs', icon: Sparkles },
          { label: 'はたらく', path: '/applications', icon: Zap },
          { label: 'Now', path: '/dashboard', icon: Flame },
          { label: 'メッセージ', path: '/notifications', icon: Bell },
          { label: 'マイページ', path: '/profile', icon: UserCircle },
        ]}
      />
    </div>
  );
}
