import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { jobsAPI, assignmentsAPI, reviewsAPI, type Assignment, type Job } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { slideUp, fadeIn } from '../../utils/animations';
import { 
  Sparkles, 
  Zap, 
  Flame, 
  MessageCircle, 
  UserCircle, 
  Eye, 
  Edit, 
  Trash2, 
  Users, 
  QrCode, 
  PlusCircle, 
  Briefcase, 
  ChevronDown, 
  ChevronUp, 
  Star,
  LayoutGrid,
  List,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Filter
} from 'lucide-react';
import { BottomNav } from '../../components/layout/BottomNav';

type ViewMode = 'kanban' | 'list';
type JobStatus = 'draft' | 'published' | 'closed';

export default function JobsManagePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  const { user } = useAuthStore();
  
  const { data: jobsData = [], isLoading } = useQuery({
    queryKey: ['jobs', 'my'],
    queryFn: () => jobsAPI.list(),
  });

  const { data: allAssignments } = useQuery({
    queryKey: ['assignments', 'all'],
    queryFn: () => assignmentsAPI.list(),
    enabled: jobsData.length > 0,
  });

  const { data: myReviews } = useQuery({
    queryKey: ['my-reviews', user?.id],
    queryFn: () => reviewsAPI.list({ reviewer_id: user?.id }),
    enabled: !!user?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: (jobId: string) => jobsAPI.delete(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setDeleteConfirmId(null);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: JobStatus }) => 
      jobsAPI.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  const getAssignmentsForJob = (jobId: string): Assignment[] => {
    return allAssignments?.filter(a => a.job_id === jobId) || [];
  };

  const hasReviewed = (assignmentId: string): boolean => {
    return myReviews?.some(r => r.assignment_id === assignmentId) || false;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return { variant: 'neutral' as const, text: '下書き', icon: FileText };
      case 'published':
        return { variant: 'success' as const, text: '公開中', icon: CheckCircle };
      case 'closed':
        return { variant: 'danger' as const, text: '募集終了', icon: XCircle };
      default:
        return { variant: 'neutral' as const, text: status, icon: AlertCircle };
    }
  };

  const filteredJobs = jobsData.filter((job: Job) => 
    statusFilter === 'all' || job.status === statusFilter
  );

  const jobsByStatus = {
    draft: filteredJobs.filter((job: Job) => job.status === 'draft'),
    published: filteredJobs.filter((job: Job) => job.status === 'published'),
    closed: filteredJobs.filter((job: Job) => job.status === 'closed'),
  };

  const handleDeleteClick = (jobId: string) => {
    setDeleteConfirmId(jobId);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      deleteMutation.mutate(deleteConfirmId);
    }
  };

  const handleStatusChange = (jobId: string, newStatus: JobStatus) => {
    updateStatusMutation.mutate({ id: jobId, status: newStatus });
  };

  const renderJobCard = (job: Job, index: number) => {
    const statusInfo = getStatusBadge(job.status);
    const assignments = getAssignmentsForJob(job.id);
    const isExpanded = expandedJobId === job.id;
    const StatusIcon = statusInfo.icon;

    return (
      <motion.div 
        key={job.id} 
        {...slideUp} 
        transition={{ delay: index * 0.05 }}
        layout
      >
        <Card className="hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary/30">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3 mb-2">
                  <h3 className="font-bold text-lg text-gray-900 line-clamp-2 flex-1">
                    {job.title}
                  </h3>
                  {job.is_urgent && (
                    <Badge variant="danger" size="sm">
                      <Flame className="w-3 h-3 mr-1" />
                      緊急
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={statusInfo.variant} size="md">
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusInfo.text}
                  </Badge>
                  <Badge variant="neutral" size="sm">
                    <Users className="w-3 h-3 mr-1" />
                    応募 {job.application_count || 0}件
                  </Badge>
                  <Badge variant="neutral" size="sm">
                    <Users className="w-3 h-3 mr-1" />
                    採用 {assignments.length}名
                  </Badge>
                </div>
              </div>
              
              {job.hourly_rate && (
                <div className="text-right shrink-0">
                  <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                    ¥{job.hourly_rate.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">時給</div>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
              {job.description}
            </p>

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
              {job.prefecture && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {job.prefecture}
                </div>
              )}
              {job.starts_at && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(job.starts_at).toLocaleDateString('ja-JP')}
                </div>
              )}
              {job.created_at && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  作成: {new Date(job.created_at).toLocaleDateString('ja-JP')}
                </div>
              )}
            </div>

            {/* Tags */}
            {job.tags && job.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {job.tags.slice(0, 5).map((tag: string, i: number) => (
                  <Badge key={i} variant="neutral" size="sm">
                    {tag}
                  </Badge>
                ))}
                {job.tags.length > 5 && (
                  <Badge variant="neutral" size="sm">
                    +{job.tags.length - 5}
                  </Badge>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
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
                {(job.application_count || 0) > 0 && (
                  <Link to={`/jobs/${job.id}/applications`}>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-gradient-to-r from-primary/10 to-primary-dark/10"
                    >
                      <Users className="w-4 h-4 mr-1" />
                      応募者
                    </Button>
                  </Link>
                )}
              </div>
              
              <div className="flex gap-2">
                {/* Status Change Buttons */}
                {job.status === 'draft' && (
                  <Button
                    onClick={() => handleStatusChange(job.id, 'published')}
                    size="sm"
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    公開
                  </Button>
                )}
                {job.status === 'published' && (
                  <Button
                    onClick={() => handleStatusChange(job.id, 'closed')}
                    size="sm"
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    募集終了
                  </Button>
                )}
                {job.status === 'closed' && (
                  <Button
                    onClick={() => handleStatusChange(job.id, 'published')}
                    size="sm"
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    再公開
                  </Button>
                )}
                
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => handleDeleteClick(job.id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  削除
                </Button>
              </div>
            </div>

            {/* Assignments Section */}
            {assignments.length > 0 && (
              <div className="pt-4 border-t border-gray-200">
                <Button
                  onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                  variant="ghost"
                  size="sm"
                  className="w-full"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-2" />
                      採用者リストを閉じる
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-2" />
                      採用者リストを表示 ({assignments.length}名)
                    </>
                  )}
                </Button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-2 mt-3"
                    >
                      {assignments.map((assignment: Assignment) => (
                        <motion.div
                          key={assignment.id}
                          {...fadeIn}
                          className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 flex items-center justify-between"
                        >
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900 mb-1">
                              ワーカー ID: {assignment.worker_id}
                            </div>
                            <div className="flex gap-2 items-center">
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
                                  開始: {new Date(assignment.started_at).toLocaleString('ja-JP', { 
                                    month: 'short', 
                                    day: 'numeric', 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {assignment.status === 'active' && (
                              <Button
                                onClick={() => navigate(`/qr-code/${assignment.id}`)}
                                className="bg-gradient-to-r from-primary to-primary-dark text-white hover:from-primary-dark hover:to-primary"
                                size="sm"
                              >
                                <QrCode className="w-4 h-4 mr-1" />
                                QR
                              </Button>
                            )}
                            {assignment.status === 'completed' && !hasReviewed(assignment.id) && (
                              <Button
                                onClick={() => navigate(`/review?assignment_id=${assignment.id}`)}
                                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600"
                                size="sm"
                              >
                                <Star className="w-4 h-4 mr-1" />
                                評価
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    );
  };

  const renderKanbanView = () => {
    const columns = [
      { status: 'draft' as JobStatus, title: '下書き', icon: FileText, color: 'from-gray-400 to-gray-500' },
      { status: 'published' as JobStatus, title: '公開中', icon: CheckCircle, color: 'from-green-500 to-green-600' },
      { status: 'closed' as JobStatus, title: '募集終了', icon: XCircle, color: 'from-red-500 to-red-600' },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => {
          const jobs = jobsByStatus[column.status];
          const ColumnIcon = column.icon;

          return (
            <div key={column.status} className="space-y-4">
              {/* Column Header */}
              <div className={`bg-gradient-to-r ${column.color} rounded-xl p-4 text-white shadow-lg`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ColumnIcon className="w-5 h-5" />
                    <h3 className="font-bold text-lg">{column.title}</h3>
                  </div>
                  <Badge variant="neutral" size="lg" className="bg-white/20 text-white border-white/30">
                    {jobs.length}件
                  </Badge>
                </div>
              </div>

              {/* Column Content */}
              <div className="space-y-4 min-h-[200px]">
                <AnimatePresence mode="popLayout">
                  {jobs.map((job: Job, index: number) => renderJobCard(job, index))}
                </AnimatePresence>
                
                {jobs.length === 0 && (
                  <motion.div 
                    {...fadeIn}
                    className="bg-white/50 backdrop-blur-sm rounded-xl p-8 text-center border-2 border-dashed border-gray-300"
                  >
                    <ColumnIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">
                      {column.status === 'draft' && '下書きの求人はありません'}
                      {column.status === 'published' && '公開中の求人はありません'}
                      {column.status === 'closed' && '募集終了の求人はありません'}
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderListView = () => {
    return (
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredJobs.map((job: Job, index: number) => renderJobCard(job, index))}
        </AnimatePresence>
        
        {filteredJobs.length === 0 && (
          <motion.div {...fadeIn} className="text-center py-12">
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto border-2 border-dashed border-gray-300">
              <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">求人が見つかりません</p>
              <p className="text-gray-500 text-sm">フィルターを変更するか、新しい求人を作成してください</p>
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  // Show success message from JobCreatePage
  const successMessage = location.state?.message;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00CED1] via-[#00B4B4] to-[#009999] pb-24">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Success Message */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <div className="bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
                <CheckCircle className="w-5 h-5" />
                <span>{successMessage}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div {...fadeIn} className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                求人管理
              </h1>
              <p className="text-white/90 text-lg">
                あなたが作成した求人一覧
              </p>
            </div>
            <Link to="/jobs/new">
              <Button 
                variant="primary"
                className="bg-white text-primary hover:bg-gray-100 shadow-xl"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                新規作成
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white/95 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                  {jobsData.length}
                </div>
                <div className="text-sm text-gray-600 mt-1">全求人</div>
              </div>
            </Card>
            <Card className="bg-white/95 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {jobsByStatus.published.length}
                </div>
                <div className="text-sm text-gray-600 mt-1">公開中</div>
              </div>
            </Card>
            <Card className="bg-white/95 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-600">
                  {jobsByStatus.draft.length}
                </div>
                <div className="text-sm text-gray-600 mt-1">下書き</div>
              </div>
            </Card>
            <Card className="bg-white/95 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">
                  {jobsByStatus.closed.length}
                </div>
                <div className="text-sm text-gray-600 mt-1">募集終了</div>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div 
          {...fadeIn}
          transition={{ delay: 0.1 }}
          className="bg-white/95 backdrop-blur-sm rounded-xl p-4 mb-6 shadow-lg"
        >
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <Button
                onClick={() => setViewMode('kanban')}
                variant={viewMode === 'kanban' ? 'primary' : 'outline'}
                size="sm"
              >
                <LayoutGrid className="w-4 h-4 mr-2" />
                カンバン
              </Button>
              <Button
                onClick={() => setViewMode('list')}
                variant={viewMode === 'list' ? 'primary' : 'outline'}
                size="sm"
              >
                <List className="w-4 h-4 mr-2" />
                リスト
              </Button>
            </div>

            {/* Status Filter (Only for List View) */}
            {viewMode === 'list' && (
              <div className="flex gap-2 items-center">
                <Filter className="w-4 h-4 text-gray-600" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as JobStatus | 'all')}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">すべて</option>
                  <option value="draft">下書き</option>
                  <option value="published">公開中</option>
                  <option value="closed">募集終了</option>
                </select>
              </div>
            )}
          </div>
        </motion.div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        ) : jobsData.length > 0 ? (
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {viewMode === 'kanban' ? renderKanbanView() : renderListView()}
          </motion.div>
        ) : (
          <motion.div {...fadeIn} className="text-center py-12">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-12 max-w-md mx-auto shadow-2xl">
              <Briefcase className="w-20 h-20 text-primary/60 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">まだ求人を作成していません</h3>
              <p className="text-gray-600 mb-6">最初の求人を作成して、ワーカーを募集しましょう</p>
              <Link to="/jobs/new">
                <Button variant="primary" className="shadow-lg">
                  <PlusCircle className="w-5 h-5 mr-2" />
                  最初の求人を作成
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setDeleteConfirmId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">求人を削除しますか？</h3>
                <p className="text-gray-600">この操作は取り消せません。関連するデータもすべて削除されます。</p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setDeleteConfirmId(null)}
                  variant="outline"
                  className="flex-1"
                >
                  キャンセル
                </Button>
                <Button
                  onClick={handleDeleteConfirm}
                  variant="danger"
                  className="flex-1"
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? '削除中...' : '削除する'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav
        items={[
          { label: 'ダッシュボード', path: '/dashboard', icon: Sparkles },
          { label: '求人作成', path: '/jobs/new', icon: Zap },
          { label: '求人管理', path: '/jobs/manage', icon: Flame },
          { label: 'メッセージ', path: '/messages', icon: MessageCircle },
          { label: 'マイページ', path: '/profile', icon: UserCircle },
        ]}
      />
    </div>
  );
}
