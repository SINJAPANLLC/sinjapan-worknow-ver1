import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { applicationsAPI, jobsAPI, assignmentsAPI, usersAPI, type Application } from '../../lib/api';
import { slideUp, fadeIn } from '../../utils/animations';
import { 
  ArrowLeft,
  User as UserIcon,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  MessageSquare,
  AlertCircle,
  Filter,
  Briefcase,
  MapPin
} from 'lucide-react';
import { RoleBottomNav } from '../../components/layout/RoleBottomNav';

type ApplicationStatus = 'pending' | 'interview' | 'hired' | 'rejected' | 'withdrawn';

export default function ApplicationsManagePage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  const { data: job, isLoading: jobLoading } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => jobsAPI.get(jobId!),
    enabled: !!jobId,
  });

  // Fetch all applications for stats (unfiltered)
  const { data: allApplications = [], isLoading: allApplicationsLoading } = useQuery({
    queryKey: ['applications', 'all', jobId],
    queryFn: () => applicationsAPI.list({ job_id: jobId }),
    enabled: !!jobId,
  });

  // Filtered applications for display
  const filteredApplications = statusFilter === 'all' 
    ? allApplications 
    : allApplications.filter((app: Application) => app.status === statusFilter);

  const applications = filteredApplications;

  const { data: assignments = [] } = useQuery({
    queryKey: ['assignments', jobId],
    queryFn: () => assignmentsAPI.list({ job_id: jobId }),
    enabled: !!jobId,
  });

  const { data: workerInfo } = useQuery({
    queryKey: ['worker', selectedApplication?.worker_id],
    queryFn: () => usersAPI.get(selectedApplication!.worker_id),
    enabled: !!selectedApplication?.worker_id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ApplicationStatus }) => 
      applicationsAPI.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setSelectedApplication(null);
    },
  });

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'pending':
        return { variant: 'neutral' as const, text: '応募中', icon: Clock };
      case 'interview':
        return { variant: 'warning' as const, text: '面接予定', icon: Users };
      case 'hired':
        return { variant: 'success' as const, text: '採用', icon: CheckCircle };
      case 'rejected':
        return { variant: 'danger' as const, text: '不採用', icon: XCircle };
      case 'withdrawn':
        return { variant: 'neutral' as const, text: '辞退', icon: AlertCircle };
      default:
        return { variant: 'neutral' as const, text: status, icon: Clock };
    }
  };


  const applicationsByStatus = {
    pending: allApplications.filter((app: Application) => app.status === 'pending'),
    interview: allApplications.filter((app: Application) => app.status === 'interview'),
    hired: allApplications.filter((app: Application) => app.status === 'hired'),
    rejected: allApplications.filter((app: Application) => app.status === 'rejected'),
    withdrawn: allApplications.filter((app: Application) => app.status === 'withdrawn'),
  };

  const handleStatusChange = (applicationId: string, newStatus: ApplicationStatus) => {
    updateStatusMutation.mutate({ id: applicationId, status: newStatus });
  };

  const isHired = (application: Application) => {
    return assignments.some(a => a.application_id === application.id);
  };

  const renderApplicationCard = (application: Application, index: number) => {
    const statusInfo = getStatusBadge(application.status);
    const StatusIcon = statusInfo.icon;
    const hired = isHired(application);

    return (
      <motion.div 
        key={application.id} 
        {...slideUp} 
        transition={{ delay: index * 0.05 }}
        layout
      >
        <Card className="hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary/30">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {application.worker_id.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900">
                      ワーカーID: {application.worker_id.substring(0, 8)}...
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={statusInfo.variant} size="sm">
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusInfo.text}
                      </Badge>
                      {hired && (
                        <Badge variant="success" size="sm">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          採用済み
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cover Letter */}
            {application.cover_letter && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">カバーレター</span>
                </div>
                <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                  {application.cover_letter}
                </p>
              </div>
            )}

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                応募日: {new Date(application.created_at).toLocaleDateString('ja-JP')}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex gap-2">
                <Button
                  onClick={() => setSelectedApplication(application)}
                  variant="outline"
                  size="sm"
                >
                  <UserIcon className="w-4 h-4 mr-1" />
                  詳細
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/client/messages?user_id=${application.worker_id}`)}
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  メッセージ
                </Button>
              </div>
              
              <div className="flex gap-2">
                {/* Status Change Buttons */}
                {application.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => handleStatusChange(application.id, 'interview')}
                      size="sm"
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                      disabled={updateStatusMutation.isPending}
                    >
                      <Users className="w-4 h-4 mr-1" />
                      面接設定
                    </Button>
                    <Button
                      onClick={() => handleStatusChange(application.id, 'hired')}
                      size="sm"
                      className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                      disabled={updateStatusMutation.isPending}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      採用
                    </Button>
                    <Button
                      onClick={() => handleStatusChange(application.id, 'rejected')}
                      size="sm"
                      variant="danger"
                      disabled={updateStatusMutation.isPending}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      不採用
                    </Button>
                  </>
                )}
                {application.status === 'interview' && (
                  <>
                    <Button
                      onClick={() => handleStatusChange(application.id, 'hired')}
                      size="sm"
                      className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                      disabled={updateStatusMutation.isPending}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      採用
                    </Button>
                    <Button
                      onClick={() => handleStatusChange(application.id, 'rejected')}
                      size="sm"
                      variant="danger"
                      disabled={updateStatusMutation.isPending}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      不採用
                    </Button>
                  </>
                )}
                {(application.status === 'hired' || application.status === 'rejected') && (
                  <span className="text-sm text-gray-500 px-3 py-2">
                    {application.status === 'hired' ? '採用済み' : '不採用済み'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  const isLoading = jobLoading || allApplicationsLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00CED1] via-[#00B4B4] to-[#009999] pb-24 pt-28">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div {...fadeIn} className="mb-8">
          <Button
            onClick={() => navigate('/jobs/manage')}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            求人管理に戻る
          </Button>

          {job && (
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl mb-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {job.title}
                  </h1>
                  <p className="text-gray-600 mb-4">{job.description}</p>
                  <div className="flex gap-2 flex-wrap">
                    {job.hourly_rate && (
                      <Badge variant="neutral" size="md">
                        時給 ¥{job.hourly_rate.toLocaleString()}
                      </Badge>
                    )}
                    {job.prefecture && (
                      <Badge variant="neutral" size="md">
                        <MapPin className="w-3 h-3 mr-1" />
                        {job.prefecture}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card className="bg-white/95 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                  {allApplications.length}
                </div>
                <div className="text-sm text-gray-600 mt-1">全応募</div>
              </div>
            </Card>
            <Card className="bg-white/95 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-600">
                  {applicationsByStatus.pending.length}
                </div>
                <div className="text-sm text-gray-600 mt-1">応募中</div>
              </div>
            </Card>
            <Card className="bg-white/95 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {applicationsByStatus.interview.length}
                </div>
                <div className="text-sm text-gray-600 mt-1">面接予定</div>
              </div>
            </Card>
            <Card className="bg-white/95 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {applicationsByStatus.hired.length}
                </div>
                <div className="text-sm text-gray-600 mt-1">採用</div>
              </div>
            </Card>
            <Card className="bg-white/95 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">
                  {applicationsByStatus.rejected.length}
                </div>
                <div className="text-sm text-gray-600 mt-1">不採用</div>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Filter */}
        <motion.div 
          {...fadeIn}
          transition={{ delay: 0.1 }}
          className="bg-white/95 backdrop-blur-sm rounded-xl p-4 mb-6 shadow-lg"
        >
          <div className="flex items-center gap-4">
            <Filter className="w-4 h-4 text-gray-600" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | 'all')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">すべて ({allApplications.length})</option>
              <option value="pending">応募中 ({applicationsByStatus.pending.length})</option>
              <option value="interview">面接予定 ({applicationsByStatus.interview.length})</option>
              <option value="hired">採用 ({applicationsByStatus.hired.length})</option>
              <option value="rejected">不採用 ({applicationsByStatus.rejected.length})</option>
              <option value="withdrawn">辞退 ({applicationsByStatus.withdrawn.length})</option>
            </select>
          </div>
        </motion.div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        ) : applications.length > 0 ? (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {applications.map((application: Application, index: number) => 
                renderApplicationCard(application, index)
              )}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div {...fadeIn} className="text-center py-12">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-12 max-w-md mx-auto shadow-2xl">
              <Users className="w-20 h-20 text-primary/60 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">応募者がいません</h3>
              <p className="text-gray-600 mb-6">
                {statusFilter === 'all' 
                  ? 'まだ応募者がいません。求人を公開して応募を待ちましょう。'
                  : `${getStatusBadge(statusFilter as ApplicationStatus).text}の応募者はいません。`
                }
              </p>
              <Link to="/jobs/manage">
                <Button variant="primary" className="shadow-lg">
                  <Briefcase className="w-5 h-5 mr-2" />
                  求人管理に戻る
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>

      {/* Application Detail Modal */}
      <AnimatePresence>
        {selectedApplication && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedApplication(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">応募詳細</h3>
                  <Badge variant={getStatusBadge(selectedApplication.status).variant} size="lg">
                    {getStatusBadge(selectedApplication.status).text}
                  </Badge>
                </div>
                <Button
                  onClick={() => setSelectedApplication(null)}
                  variant="ghost"
                  size="sm"
                >
                  <XCircle className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Worker Info */}
                <div className="bg-gradient-to-r from-[#00CED1]/10 to-[#009999]/10 rounded-lg p-4 border border-[#00CED1]/20">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-[#00CED1]" />
                    ワーカー情報
                  </h4>
                  {workerInfo ? (
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3">
                        {workerInfo.avatar_url ? (
                          <img 
                            src={workerInfo.avatar_url} 
                            alt={workerInfo.full_name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-[#00CED1] to-[#009999] rounded-full flex items-center justify-center text-white font-bold">
                            {workerInfo.full_name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-lg text-gray-900">{workerInfo.full_name}</div>
                          {workerInfo.affiliation && (
                            <div className="text-xs text-gray-600">{workerInfo.affiliation}</div>
                          )}
                        </div>
                      </div>
                      
                      {workerInfo.gender && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">性別:</span>
                          <span className="font-medium text-gray-900">
                            {workerInfo.gender === 'male' ? '男性' : 
                             workerInfo.gender === 'female' ? '女性' : 
                             workerInfo.gender === 'other' ? 'その他' : '回答しない'}
                          </span>
                        </div>
                      )}
                      
                      {workerInfo.preferred_prefecture && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">希望勤務地:</span>
                          <span className="font-medium text-gray-900">{workerInfo.preferred_prefecture}</span>
                        </div>
                      )}
                      
                      {workerInfo.work_style && (
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">働き方:</span>
                          <span className="font-medium text-gray-900">{workerInfo.work_style}</span>
                        </div>
                      )}
                      
                      {workerInfo.qualifications && workerInfo.qualifications.length > 0 && (
                        <div>
                          <div className="text-gray-600 mb-2 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-gray-500" />
                            スキル・資格:
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {workerInfo.qualifications.map((qual, idx) => (
                              <Badge key={idx} variant="success" size="sm">
                                {qual}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                        <span className="text-gray-600">登録日:</span>
                        <span className="font-medium text-gray-900 text-xs">
                          {new Date(workerInfo.created_at).toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-4">
                      <div className="inline-block w-6 h-6 border-2 border-[#00CED1]/30 border-t-[#00CED1] rounded-full animate-spin" />
                      <span className="ml-2 text-sm text-gray-600">読み込み中...</span>
                    </div>
                  )}
                </div>

                {/* Cover Letter */}
                {selectedApplication.cover_letter && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      カバーレター
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedApplication.cover_letter}
                    </p>
                  </div>
                )}

                {/* Application Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    応募情報
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">応募日時:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(selectedApplication.created_at).toLocaleString('ja-JP')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">更新日時:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(selectedApplication.updated_at).toLocaleString('ja-JP')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  {selectedApplication.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => handleStatusChange(selectedApplication.id, 'interview')}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                        disabled={updateStatusMutation.isPending}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        面接設定
                      </Button>
                      <Button
                        onClick={() => handleStatusChange(selectedApplication.id, 'hired')}
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                        disabled={updateStatusMutation.isPending}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        採用
                      </Button>
                      <Button
                        onClick={() => handleStatusChange(selectedApplication.id, 'rejected')}
                        className="flex-1"
                        variant="danger"
                        disabled={updateStatusMutation.isPending}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        不採用
                      </Button>
                    </>
                  )}
                  {selectedApplication.status === 'interview' && (
                    <>
                      <Button
                        onClick={() => handleStatusChange(selectedApplication.id, 'hired')}
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                        disabled={updateStatusMutation.isPending}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        採用
                      </Button>
                      <Button
                        onClick={() => handleStatusChange(selectedApplication.id, 'rejected')}
                        className="flex-1"
                        variant="danger"
                        disabled={updateStatusMutation.isPending}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        不採用
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <RoleBottomNav />
    </div>
  );
}
