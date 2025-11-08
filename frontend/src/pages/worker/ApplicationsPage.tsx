import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { applicationsAPI, type Application } from '../../lib/api';
import { Sparkles, Zap, Flame, Bell, UserCircle, Clock, CheckCircle, XCircle, AlertCircle, BookOpen } from 'lucide-react';
import { BottomNav } from '../../components/layout/BottomNav';

export default function ApplicationsPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const { data: applications, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: applicationsAPI.list,
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

  const currentApplications = activeTab === 'upcoming' ? upcomingApplications : pastApplications;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00C6A7] via-[#009B8F] to-[#007E7A] pb-20">
      <div className="bg-white/95 backdrop-blur-sm pt-20 pb-0 sticky top-0 z-20 shadow-lg">
        <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-[#00C6A7] to-[#007E7A] bg-clip-text text-transparent py-4">はたらく</h1>
        
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
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00C6A7] to-[#007E7A]"
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
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00C6A7] to-[#007E7A]"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        </div>
      </div>

      <div className="px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#00C6A7] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : currentApplications.length > 0 ? (
          <div className="space-y-3">
            {currentApplications.map((application, index) => {
              const statusInfo = getStatusBadge(application.status);
              const StatusIcon = statusInfo.icon;

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
                        <Badge variant={statusInfo.variant} size="sm">
                          <StatusIcon className="w-3.5 h-3.5 mr-1" />
                          {statusInfo.text}
                        </Badge>
                      </div>
                    </div>

                    {application.cover_letter && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-xs font-medium text-gray-700 mb-1">カバーレター</p>
                        <p className="text-xs text-gray-600 line-clamp-2">{application.cover_letter}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>応募日: {new Date(application.created_at).toLocaleDateString('ja-JP')}</span>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-8"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-3">
                {activeTab === 'upcoming' ? '今後の予定はありません' : '過去の仕事はありません'}
              </h2>
              <p className="text-white/90 mb-6">
                次のお仕事を探してみましょう。
              </p>
              <Link to="/jobs">
                <Button 
                  variant="primary" 
                  className="bg-gradient-to-r from-[#00C6A7] to-[#007E7A] hover:from-[#00B599] hover:to-[#006B68] text-white px-8 py-3 rounded-xl shadow-lg"
                >
                  仕事をさがす
                </Button>
              </Link>
            </div>

            <div className="flex justify-center mb-8">
              <svg className="w-64 h-48" viewBox="0 0 200 150" fill="none">
                <ellipse cx="100" cy="120" rx="80" ry="15" fill="#E5E7EB" opacity="0.5"/>
                <path d="M30 100 Q50 80 70 100 L130 100 Q150 80 170 100" fill="#D1D5DB"/>
                <g transform="translate(80, 50)">
                  <circle cx="15" cy="35" r="20" fill="none" stroke="#FCD34D" strokeWidth="4"/>
                  <circle cx="55" cy="35" r="20" fill="none" stroke="#D1D5DB" strokeWidth="4"/>
                  <path d="M15 15 L35 25 L55 15" fill="none" stroke="#FCD34D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M35 25 L35 35" stroke="#FCD34D" strokeWidth="3" strokeLinecap="round"/>
                  <rect x="32" y="30" width="6" height="12" rx="1" fill="#FCD34D"/>
                  <circle cx="8" cy="35" r="3" fill="#1E40AF"/>
                  <circle cx="22" cy="35" r="3" fill="#1E40AF"/>
                  <circle cx="48" cy="35" r="3" fill="#6B7280"/>
                  <circle cx="62" cy="35" r="3" fill="#6B7280"/>
                </g>
              </svg>
            </div>

            <div className="bg-white rounded-2xl p-6 flex items-center gap-4 shadow-lg border-2 border-[#00C6A7]">
              <div className="w-20 h-20 bg-gradient-to-br from-[#00C6A7] to-[#007E7A] rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                <div className="w-12 h-16 bg-white rounded-lg flex items-center justify-center relative">
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-6 h-8 bg-gradient-to-br from-[#00C6A7] to-[#007E7A] rounded" />
                  <BookOpen className="w-6 h-6 text-gray-600 relative z-10" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xl bg-gradient-to-r from-[#00C6A7] to-[#007E7A] bg-clip-text text-transparent mb-1">Work Now</h3>
                <p className="text-sm text-gray-700 font-medium">かんたん</p>
                <p className="text-lg font-bold text-gray-900">働きかたガイド</p>
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
