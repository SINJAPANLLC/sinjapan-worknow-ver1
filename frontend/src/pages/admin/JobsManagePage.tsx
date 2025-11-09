import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { slideUp, fadeIn } from '../../utils/animations';
import {
  Search,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Calendar,
  DollarSign,
  MapPin,
  Eye,
  Trash2,
  AlertCircle,
  Briefcase
} from 'lucide-react';
import { Sparkles, Zap, Flame, MessageCircle, UserCircle } from 'lucide-react';
import { BottomNav } from '../../components/layout/BottomNav';

export default function AdminJobsManagePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const mockJobs = [
    {
      id: '1',
      title: 'Webデザイナー募集',
      description: 'クリエイティブなWebデザイナーを募集しています',
      hourly_rate: 2000,
      status: 'published',
      prefecture: '東京都',
      created_at: '2025-01-01',
      company_name: '株式会社ABC',
      is_urgent: true,
    },
    {
      id: '2',
      title: '倉庫作業員',
      description: '倉庫での軽作業スタッフを募集',
      hourly_rate: 1200,
      status: 'draft',
      prefecture: '神奈川県',
      created_at: '2025-01-02',
      company_name: '株式会社XYZ',
      is_urgent: false,
    },
    {
      id: '3',
      title: 'イベントスタッフ',
      description: '週末イベントのサポートスタッフ',
      hourly_rate: 1500,
      status: 'closed',
      prefecture: '大阪府',
      created_at: '2025-01-03',
      company_name: '株式会社イベント社',
      is_urgent: false,
    },
  ];

  const filteredJobs = mockJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return { variant: 'success' as const, text: '公開中', icon: CheckCircle };
      case 'draft':
        return { variant: 'neutral' as const, text: '下書き', icon: AlertCircle };
      case 'closed':
        return { variant: 'danger' as const, text: '終了', icon: XCircle };
      default:
        return { variant: 'neutral' as const, text: status, icon: AlertCircle };
    }
  };

  const statusStats = {
    all: mockJobs.length,
    published: mockJobs.filter(j => j.status === 'published').length,
    draft: mockJobs.filter(j => j.status === 'draft').length,
    closed: mockJobs.filter(j => j.status === 'closed').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00CED1] via-[#00B4B4] to-[#009999] pb-24">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div {...fadeIn} className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-white">求人管理</h1>
            <p className="text-white/80 mt-1">求人の承認と削除</p>
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div {...slideUp} className="space-y-4 mb-6">
          <Card className="bg-white/95 backdrop-blur-sm p-4">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="求人タイトル、説明、企業名で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-none outline-none bg-transparent text-gray-900 placeholder-gray-400"
              />
            </div>
          </Card>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { key: 'all', label: `全て (${statusStats.all})` },
              { key: 'published', label: `公開中 (${statusStats.published})` },
              { key: 'draft', label: `下書き (${statusStats.draft})` },
              { key: 'closed', label: `終了 (${statusStats.closed})` },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all font-medium ${
                  statusFilter === key
                    ? 'bg-white text-primary shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Jobs List */}
        <div className="space-y-4">
          {filteredJobs.map((job, index) => {
            const statusInfo = getStatusBadge(job.status);
            const StatusIcon = statusInfo.icon;

            return (
              <motion.div
                key={job.id}
                {...slideUp}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="bg-white/95 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg text-gray-900">{job.title}</h3>
                          {job.is_urgent && (
                            <Badge variant="danger" size="sm">
                              🔥 急募
                            </Badge>
                          )}
                          <Badge variant={statusInfo.variant}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo.text}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{job.description}</p>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            <span>{job.company_name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span className="font-medium text-primary">¥{job.hourly_rate}/時間</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{job.prefecture}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(job.created_at).toLocaleDateString('ja-JP')}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200">
                      <Button
                        onClick={() => navigate(`/jobs/${job.id}`)}
                        variant="outline"
                        size="sm"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        詳細
                      </Button>
                      <Button variant="primary" size="sm">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        承認
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

          {filteredJobs.length === 0 && (
            <Card className="bg-white/95 backdrop-blur-sm p-12">
              <div className="text-center text-gray-500">
                <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>該当する求人が見つかりませんでした</p>
              </div>
            </Card>
          )}
        </div>
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
