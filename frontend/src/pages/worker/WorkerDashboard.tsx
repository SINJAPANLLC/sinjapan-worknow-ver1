import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { jobsAPI, applicationsAPI, assignmentsAPI } from '../../lib/api';
import { slideUp, fadeIn } from '../../utils/animations';
import { 
  BriefcaseIcon, 
  DocumentTextIcon, 
  CheckCircleIcon,
  CurrencyYenIcon,
  MagnifyingGlassIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export default function WorkerDashboard() {
  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['jobs', 'published'],
    queryFn: () => jobsAPI.list({ status: 'published', size: 5 }),
  });

  const { data: applications, isLoading: appsLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationsAPI.list(),
  });

  const { data: assignments } = useQuery({
    queryKey: ['assignments'],
    queryFn: () => assignmentsAPI.list(),
  });

  const activeAssignments = assignments?.filter(a => a.status === 'active') || [];
  const pendingApps = applications?.filter(a => a.status === 'pending') || [];
  
  const stats = [
    {
      icon: DocumentTextIcon,
      label: '応募中',
      value: pendingApps.length,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: BriefcaseIcon,
      label: '進行中',
      value: activeAssignments.length,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      icon: CheckCircleIcon,
      label: '完了',
      value: assignments?.filter(a => a.status === 'completed').length || 0,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: CurrencyYenIcon,
      label: '今月の収入',
      value: '¥0',
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
            ダッシュボード
          </h1>
          <p className="text-gray-600">
            あなたのワーク状況を確認しましょう
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
                <Link to="/jobs">
                  <Button variant="primary" className="w-full justify-start">
                    <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                    新しい求人を探す
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="outline" className="w-full justify-start">
                    <UserCircleIcon className="w-5 h-5 mr-2" />
                    プロフィールを編集
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
              {appsLoading ? (
                <p className="text-gray-600">読み込み中...</p>
              ) : applications && applications.length > 0 ? (
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
                      <Badge variant={
                        app.status === 'hired' ? 'success' :
                        app.status === 'rejected' ? 'danger' :
                        app.status === 'interview' ? 'warning' :
                        'neutral'
                      }>
                        {app.status === 'pending' ? '審査中' :
                         app.status === 'interview' ? '面接' :
                         app.status === 'hired' ? '採用' :
                         app.status === 'rejected' ? '不採用' : '取り下げ'}
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
              <h2 className="text-xl font-bold text-gray-900">
                おすすめの求人
              </h2>
              <Link to="/jobs">
                <Button variant="ghost" size="sm">
                  すべて見る
                </Button>
              </Link>
            </div>
            {jobsLoading ? (
              <p className="text-gray-600">読み込み中...</p>
            ) : jobs && jobs.items.length > 0 ? (
              <div className="space-y-4">
                {jobs.items.map((job) => (
                  <div
                    key={job.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-gray-900">{job.title}</h3>
                      {job.hourly_rate && (
                        <span className="text-primary font-bold">
                          ¥{job.hourly_rate.toLocaleString()}/時
                        </span>
                      )}
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
                      <Link to={`/jobs/${job.id}`}>
                        <Button variant="outline" size="sm">
                          詳細を見る
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">求人がありません</p>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
