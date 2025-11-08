import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { applicationsAPI, type Application } from '../../lib/api';
import { slideUp, fadeIn } from '../../utils/animations';
import { Sparkles, Zap, Flame, Bell, UserCircle, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { BottomNav } from '../../components/layout/BottomNav';

export default function ApplicationsPage() {
  const { data: applications, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: applicationsAPI.list,
  });

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-gray-900 pb-20">
      <div className="container mx-auto px-4 py-8">
        <motion.div {...fadeIn}>
          <h1 className="text-3xl font-bold mb-2 text-white">応募履歴</h1>
          <p className="text-white/80 mb-6">あなたの応募状況を確認できます</p>
        </motion.div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        ) : applications && applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((application, index) => {
              const statusInfo = getStatusBadge(application.status);
              const StatusIcon = statusInfo.icon;

              return (
                <motion.div key={application.id} {...slideUp} style={{ animationDelay: `${index * 0.1}s` }}>
                  <Card>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 mb-2">求人ID: {application.job_id}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant={statusInfo.variant} size="lg">
                            <StatusIcon className="w-4 h-4 mr-1" />
                            {statusInfo.text}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {application.cover_letter && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">カバーレター</p>
                        <p className="text-sm text-gray-600">{application.cover_letter}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>応募日: {new Date(application.created_at).toLocaleDateString('ja-JP')}</span>
                      {application.updated_at !== application.created_at && (
                        <span>更新日: {new Date(application.updated_at).toLocaleDateString('ja-JP')}</span>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div {...fadeIn} className="text-center py-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto">
              <FileText className="w-16 h-16 text-white/60 mx-auto mb-4" />
              <p className="text-white text-lg mb-2">まだ応募履歴がありません</p>
              <p className="text-white/70 text-sm">求人検索から気になる仕事に応募してみましょう</p>
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
