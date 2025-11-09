import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { jobsAPI, applicationsAPI } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { slideUp, fadeIn } from '../../utils/animations';
import {
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  Calendar,
  ArrowLeft,
  Send,
  Building2,
} from 'lucide-react';

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const [coverLetter, setCoverLetter] = useState('');
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  const { data: job, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobsAPI.get(id!),
    enabled: !!id,
  });

  const applyMutation = useMutation({
    mutationFn: () =>
      applicationsAPI.create({
        job_id: id!,
        cover_letter: coverLetter,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setShowApplicationForm(false);
      setCoverLetter('');
      alert('応募が完了しました！');
    },
  });

  const handleApply = () => {
    if (!coverLetter.trim()) {
      alert('カバーレターを入力してください');
      return;
    }
    applyMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-gray-900 flex items-center justify-center">
        <div className="inline-block w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">求人が見つかりません</div>
      </div>
    );
  }

  const calculateWorkingHours = () => {
    if (!job.starts_at || !job.ends_at) return null;
    const start = new Date(job.starts_at);
    const end = new Date(job.ends_at);
    const hours = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60) * 10) / 10;
    return hours > 0 ? hours : null;
  };

  const workingHours = calculateWorkingHours();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00CED1] via-[#00B5B5] to-[#009999] pb-20">
      <div className="container mx-auto px-4 py-8">
        <motion.div {...fadeIn}>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-white/90 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            戻る
          </button>
        </motion.div>

        <motion.div {...slideUp} className="space-y-6">
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl mt-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00CED1] to-[#009999] bg-clip-text text-transparent mb-3">
                  {job.title}
                </h1>
                {job.company_name && (
                  <div className="flex items-center gap-2 text-gray-700 mb-4">
                    <Building2 className="w-5 h-5 text-[#00CED1]" />
                    <span className="font-medium">{job.company_name}</span>
                  </div>
                )}
                <Badge
                  variant={
                    job.status === 'published' ? 'success' : job.status === 'draft' ? 'neutral' : 'danger'
                  }
                  size="lg"
                >
                  {job.status === 'published' ? '募集中' : job.status === 'draft' ? '下書き' : '募集終了'}
                </Badge>
              </div>

              {job.hourly_rate && (
                <div className="text-right">
                  <div className="text-3xl font-bold bg-gradient-to-r from-[#00CED1] to-[#009999] bg-clip-text text-transparent">
                    ¥{job.hourly_rate.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">時給</div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {job.location && (
                <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-[#00CED1]/10 to-[#009999]/10 rounded-lg border border-[#00CED1]/20">
                  <MapPin className="w-5 h-5 text-[#00CED1]" />
                  <div>
                    <div className="text-xs text-gray-600">勤務地</div>
                    <div className="font-medium text-gray-900">{job.location}</div>
                  </div>
                </div>
              )}

              {job.employment_type && (
                <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-[#00CED1]/10 to-[#009999]/10 rounded-lg border border-[#00CED1]/20">
                  <Briefcase className="w-5 h-5 text-[#00CED1]" />
                  <div>
                    <div className="text-xs text-gray-600">雇用形態</div>
                    <div className="font-medium text-gray-900">
                      {job.employment_type === 'full-time'
                        ? '正社員'
                        : job.employment_type === 'part-time'
                        ? 'パート'
                        : job.employment_type === 'contract'
                        ? '契約'
                        : '派遣'}
                    </div>
                  </div>
                </div>
              )}

              {workingHours !== null && (
                <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-[#00CED1]/10 to-[#009999]/10 rounded-lg border border-[#00CED1]/20">
                  <Clock className="w-5 h-5 text-[#00CED1]" />
                  <div>
                    <div className="text-xs text-gray-600">稼働時間</div>
                    <div className="font-medium text-gray-900">{workingHours}時間</div>
                  </div>
                </div>
              )}

              {job.starts_at && (
                <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-[#00CED1]/10 to-[#009999]/10 rounded-lg border border-[#00CED1]/20">
                  <Calendar className="w-5 h-5 text-[#00CED1]" />
                  <div>
                    <div className="text-xs text-gray-600">開始日時</div>
                    <div className="font-medium text-gray-900">
                      {new Date(job.starts_at).toLocaleString('ja-JP', { 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">仕事内容</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
            </div>

            {job.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">タグ</h3>
                <div className="flex gap-2 flex-wrap">
                  {job.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-gradient-to-r from-[#00CED1]/20 to-[#009999]/20 text-gray-700 rounded-full text-sm font-medium border border-[#00CED1]/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {user?.role === 'worker' && job.status === 'published' && (
              <div className="pt-6 border-t border-gray-200">
                {!showApplicationForm ? (
                  <Button
                    variant="primary"
                    className="w-full bg-gradient-to-r from-[#00CED1] to-[#009999] hover:from-[#00D4D4] hover:to-[#008888] text-white font-bold py-3 rounded-xl shadow-lg"
                    onClick={() => setShowApplicationForm(true)}
                  >
                    <Send className="w-5 h-5 mr-2" />
                    この求人に応募する
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold bg-gradient-to-r from-[#00CED1] to-[#009999] bg-clip-text text-transparent">
                      応募フォーム
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        カバーレター <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        rows={6}
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-[#00CED1] focus:border-[#00CED1] transition-colors"
                        placeholder="志望動機や自己PRを記入してください..."
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowApplicationForm(false);
                          setCoverLetter('');
                        }}
                        className="flex-1 border-2 border-gray-300 hover:bg-gray-100"
                      >
                        キャンセル
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleApply}
                        disabled={applyMutation.isPending}
                        className="flex-1 bg-gradient-to-r from-[#00CED1] to-[#009999] hover:from-[#00D4D4] hover:to-[#008888] text-white font-bold"
                      >
                        {applyMutation.isPending ? '送信中...' : '応募を送信'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
