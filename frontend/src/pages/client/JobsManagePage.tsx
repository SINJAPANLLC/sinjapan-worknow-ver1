import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { jobsAPI, assignmentsAPI, type Assignment } from '../../lib/api';
import { slideUp, fadeIn } from '../../utils/animations';
import { Sparkles, Zap, Flame, Bell, UserCircle, Eye, Edit, Trash2, Users, QrCode, PlusCircle, Briefcase, ChevronDown, ChevronUp } from 'lucide-react';
import { BottomNav } from '../../components/layout/BottomNav';

export default function JobsManagePage() {
  const navigate = useNavigate();
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  
  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['jobs', 'my'],
    queryFn: () => jobsAPI.list(),
  });

  const { data: allAssignments } = useQuery({
    queryKey: ['assignments', 'all'],
    queryFn: () => assignmentsAPI.list(),
    enabled: !!jobsData && jobsData.length > 0,
  });

  const getAssignmentsForJob = (jobId: string): Assignment[] => {
    return allAssignments?.filter(a => a.job_id === jobId) || [];
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return { variant: 'neutral' as const, text: '下書き' };
      case 'published':
        return { variant: 'success' as const, text: '公開中' };
      case 'closed':
        return { variant: 'danger' as const, text: '募集終了' };
      default:
        return { variant: 'neutral' as const, text: status };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-gray-900 pb-20">
      <div className="container mx-auto px-4 py-8">
        <motion.div {...fadeIn} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">求人管理</h1>
            <p className="text-white/80">あなたが作成した求人一覧</p>
          </div>
          <Link to="/jobs/new">
            <Button variant="primary">
              <PlusCircle className="w-5 h-5 mr-2" />
              新規作成
            </Button>
          </Link>
        </motion.div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        ) : jobsData && jobsData.length > 0 ? (
          <div className="space-y-4">
            {jobsData.map((job: any, index: number) => {
              const statusInfo = getStatusBadge(job.status);
              const assignments = getAssignmentsForJob(job.id);
              const isExpanded = expandedJobId === job.id;

              return (
                <motion.div key={job.id} {...slideUp} style={{ animationDelay: `${index * 0.1}s` }}>
                  <Card>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-gray-900 mb-2">{job.title}</h3>
                        <Badge variant={statusInfo.variant} size="lg">
                          {statusInfo.text}
                        </Badge>
                      </div>
                      {job.hourly_rate && (
                        <div className="ml-4">
                          <div className="text-2xl font-bold text-primary">
                            ¥{job.hourly_rate.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">時給</div>
                        </div>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{job.description}</p>

                    <div className="flex gap-2 flex-wrap mb-4">
                      {job.tags.slice(0, 5).map((tag: string, i: number) => (
                        <Badge key={i} variant="neutral" size="sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-1" />
                        <span>アサイン: {assignments.length}名</span>
                      </div>

                      <div className="flex gap-2">
                        <Link to={`/jobs/${job.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            詳細
                          </Button>
                        </Link>
                        <Link to={`/jobs/${job.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-1" />
                            編集
                          </Button>
                        </Link>
                        <Button variant="danger" size="sm">
                          <Trash2 className="w-4 h-4 mr-1" />
                          削除
                        </Button>
                      </div>
                    </div>

                    {assignments.length > 0 && (
                      <div className="pt-4 border-t border-gray-200">
                        <Button
                          onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                          variant="ghost"
                          size="sm"
                          className="w-full mb-2"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4 mr-2" />
                              アサインリストを閉じる
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4 mr-2" />
                              アサインリストを表示 ({assignments.length})
                            </>
                          )}
                        </Button>

                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2 mt-3"
                          >
                            {assignments.map((assignment: Assignment) => (
                              <div
                                key={assignment.id}
                                className="bg-gray-50 rounded-lg p-3 flex items-center justify-between"
                              >
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-900 mb-1">
                                    ワーカー ID: {assignment.worker_id}
                                  </div>
                                  <div className="flex gap-2">
                                    <Badge
                                      variant={
                                        assignment.status === 'active'
                                          ? 'success'
                                          : assignment.status === 'completed'
                                          ? 'neutral'
                                          : 'danger'
                                      }
                                      size="sm"
                                    >
                                      {assignment.status === 'active' && '進行中'}
                                      {assignment.status === 'completed' && '完了'}
                                      {assignment.status === 'cancelled' && 'キャンセル'}
                                    </Badge>
                                    {assignment.started_at && (
                                      <span className="text-xs text-gray-600">
                                        開始: {new Date(assignment.started_at).toLocaleString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {assignment.status === 'active' && (
                                  <Button
                                    onClick={() => navigate(`/qr-code/${assignment.id}`)}
                                    className="bg-gradient-to-r from-[#00CED1] to-[#009999] text-white hover:from-[#00D4D4] hover:to-[#008888]"
                                    size="sm"
                                  >
                                    <QrCode className="w-4 h-4 mr-1" />
                                    QRコード
                                  </Button>
                                )}
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div {...fadeIn} className="text-center py-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto">
              <Briefcase className="w-16 h-16 text-white/60 mx-auto mb-4" />
              <p className="text-white text-lg mb-4">まだ求人を作成していません</p>
              <Link to="/jobs/new">
                <Button variant="primary">
                  <PlusCircle className="w-5 h-5 mr-2" />
                  最初の求人を作成
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>

      <BottomNav
        items={[
          { label: 'さがす', path: '/jobs/manage', icon: Sparkles },
          { label: 'はたらく', path: '/jobs/new', icon: Zap },
          { label: 'Now', path: '/dashboard', icon: Flame },
          { label: 'メッセージ', path: '/notifications', icon: Bell },
          { label: 'マイページ', path: '/profile', icon: UserCircle },
        ]}
      />
    </div>
  );
}
