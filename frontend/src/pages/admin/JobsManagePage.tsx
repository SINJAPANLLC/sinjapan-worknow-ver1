import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { jobsAPI } from '../../lib/api';
import { slideUp, fadeIn } from '../../utils/animations';
import { Sparkles, Zap, Flame, Bell, UserCircle, Search, Eye, Edit, Trash2, UserPlus } from 'lucide-react';
import { BottomNav } from '../../components/layout/BottomNav';

export default function JobsManagePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['jobs', 'all'],
    queryFn: () => jobsAPI.list(),
  });

  const filteredJobs = jobsData?.filter((job: any) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        <motion.div {...fadeIn}>
          <h1 className="text-3xl font-bold mb-2 text-white">求人管理</h1>
          <p className="text-white/80 mb-6">全ての求人情報を管理</p>
        </motion.div>

        <motion.div {...slideUp} className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="求人タイトルまたは内容で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border-0 shadow-lg focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {['', 'draft', 'published', 'closed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  statusFilter === status
                    ? 'bg-white text-primary shadow-lg'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {status === '' ? '全て' : status === 'draft' ? '下書き' : status === 'published' ? '公開中' : '募集終了'}
              </button>
            ))}
          </div>
        </motion.div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        ) : filteredJobs && filteredJobs.length > 0 ? (
          <div className="space-y-4">
            {filteredJobs.map((job, index) => {
              const statusInfo = getStatusBadge(job.status);

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
                      {job.tags.slice(0, 5).map((tag, i) => (
                        <Badge key={i} variant="neutral" size="sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>企業ID: {job.company_id}</div>
                        <div className="flex items-center">
                          <UserPlus className="w-4 h-4 mr-1" />
                          <span>応募者: 0名</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          詳細
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          編集
                        </Button>
                        <Button variant="danger" size="sm">
                          <Trash2 className="w-4 h-4 mr-1" />
                          削除
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div {...fadeIn} className="text-center py-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto">
              <Briefcase className="w-16 h-16 text-white/60 mx-auto mb-4" />
              <p className="text-white text-lg mb-2">求人が見つかりませんでした</p>
              <p className="text-white/70 text-sm">検索条件を変更してみてください</p>
            </div>
          </motion.div>
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
