import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { jobsAPI, applicationsAPI } from '../../lib/api';
import { slideUp, fadeIn } from '../../utils/animations';
import {
  BriefcaseIcon,
  DocumentTextIcon,
  UserGroupIcon,
  PlusIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export default function ClientDashboard() {
  const { data: myJobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['jobs', 'my'],
    queryFn: () => jobsAPI.list({ size: 10 }),
  });

  const { data: applications } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationsAPI.list(),
  });

  const publishedJobs = myJobs?.items.filter((j) => j.status === 'published') || [];
  const draftJobs = myJobs?.items.filter((j) => j.status === 'draft') || [];
  const totalApplications = applications?.length || 0;
  const pendingReviews = applications?.filter((a) => a.status === 'pending').length || 0;

  const getApplicationCount = (jobId: string) => {
    return applications?.filter((app) => app.job_id === jobId).length || 0;
  };

  const stats = [
    {
      icon: BriefcaseIcon,
      label: '公開中の求人',
      value: publishedJobs.length,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: DocumentTextIcon,
      label: '下書き',
      value: draftJobs.length,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
    },
    {
      icon: UserGroupIcon,
      label: '総応募数',
      value: totalApplications,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      icon: EyeIcon,
      label: '未確認',
      value: pendingReviews,
      color: 'text-primary-dark',
      bgColor: 'bg-primary-dark/10',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-light to-white pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          variants={fadeIn}
          initial="initial"
          animate="animate"
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            企業ダッシュボード
          </h1>
          <p className="text-gray-600">
            求人と応募者を管理しましょう
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={slideUp}
              initial="initial"
              animate="animate"
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <motion.div
            variants={slideUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                クイックアクション
              </h2>
              <div className="space-y-3">
                <Link to="/jobs/new">
                  <Button variant="primary" className="w-full justify-start">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    新しい求人を作成
                  </Button>
                </Link>
                <Link to="/applications">
                  <Button variant="outline" className="w-full justify-start">
                    <DocumentTextIcon className="w-5 h-5 mr-2" />
                    応募者を確認
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>

          <motion.div
            variants={slideUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                最近の応募
              </h2>
              {applications && applications.length > 0 ? (
                <div className="space-y-3">
                  {applications.slice(0, 3).map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          応募 #{app.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(app.created_at).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                      <Badge
                        variant={
                          app.status === 'hired'
                            ? 'success'
                            : app.status === 'rejected'
                            ? 'danger'
                            : app.status === 'interview'
                            ? 'warning'
                            : 'neutral'
                        }
                      >
                        {app.status === 'pending'
                          ? '審査中'
                          : app.status === 'interview'
                          ? '面接'
                          : app.status === 'hired'
                          ? '採用'
                          : app.status === 'rejected'
                          ? '不採用'
                          : '取り下げ'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">まだ応募がありません</p>
              )}
            </Card>
          </motion.div>
        </div>

        <motion.div
          variants={slideUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">あなたの求人</h2>
              <Link to="/jobs/new">
                <Button variant="ghost" size="sm">
                  <PlusIcon className="w-4 h-4 mr-1" />
                  新規作成
                </Button>
              </Link>
            </div>
            {jobsLoading ? (
              <p className="text-gray-600">読み込み中...</p>
            ) : myJobs && myJobs.items.length > 0 ? (
              <div className="space-y-4">
                {myJobs.items.map((job) => (
                  <div
                    key={job.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900">
                            {job.title}
                          </h3>
                          <Badge
                            variant={
                              job.status === 'published'
                                ? 'success'
                                : job.status === 'draft'
                                ? 'neutral'
                                : 'danger'
                            }
                            size="sm"
                          >
                            {job.status === 'published'
                              ? '公開中'
                              : job.status === 'draft'
                              ? '下書き'
                              : '終了'}
                          </Badge>
                        </div>
                        {job.hourly_rate && (
                          <span className="text-primary font-bold text-sm">
                            ¥{job.hourly_rate.toLocaleString()}/時
                          </span>
                        )}
                      </div>
                      <Link to={`/jobs/${job.id}/edit`}>
                        <Button variant="outline" size="sm">
                          編集
                        </Button>
                      </Link>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {job.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {job.tags.slice(0, 3).map((tag, i) => (
                          <Badge key={i} variant="neutral" size="sm">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <UserGroupIcon className="w-4 h-4" />
                        <span>{getApplicationCount(job.id)}応募</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BriefcaseIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  まだ求人を作成していません
                </p>
                <Link to="/jobs/new">
                  <Button variant="primary">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    最初の求人を作成
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
