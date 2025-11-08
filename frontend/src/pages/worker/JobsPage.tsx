import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { jobsAPI } from '../../lib/api';
import { slideUp, fadeIn } from '../../utils/animations';
import { Search, MapPin, Briefcase, Home, FileText, User } from 'lucide-react';
import { BottomNav } from '../../components/layout/BottomNav';

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['jobs', 'published'],
    queryFn: () => jobsAPI.list({ status: 'published' }),
  });

  const filteredJobs = jobsData?.filter((job: any) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedType || job.employment_type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-gray-900 pb-20">
      <div className="container mx-auto px-4 py-8">
        <motion.div {...fadeIn}>
          <h1 className="text-3xl font-bold mb-2 text-white">求人検索</h1>
          <p className="text-white/80 mb-6">あなたにぴったりの仕事を見つけましょう</p>
        </motion.div>

        <motion.div {...slideUp} className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="キーワードで検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border-0 shadow-lg focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {['', 'full-time', 'part-time', 'contract', 'temporary'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  selectedType === type
                    ? 'bg-white text-primary shadow-lg'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {type === '' ? '全て' : type === 'full-time' ? '正社員' : type === 'part-time' ? 'パート' : type === 'contract' ? '契約' : '派遣'}
              </button>
            ))}
          </div>
        </motion.div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        ) : filteredJobs && filteredJobs.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job, index) => (
              <motion.div key={job.id} {...slideUp} style={{ animationDelay: `${index * 0.1}s` }}>
                <Link to={`/jobs/${job.id}`}>
                  <Card className="h-full hover:shadow-xl transition-shadow cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-xl text-gray-900 flex-1">{job.title}</h3>
                      {job.hourly_rate && (
                        <div className="ml-2">
                          <Badge variant="success" size="lg">
                            ¥{job.hourly_rate.toLocaleString()}/時
                          </Badge>
                        </div>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{job.description}</p>

                    <div className="space-y-2 mb-4">
                      {job.location && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2 text-primary" />
                          {job.location}
                        </div>
                      )}
                      {job.employment_type && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Briefcase className="w-4 h-4 mr-2 text-primary" />
                          {job.employment_type === 'full-time' ? '正社員' : job.employment_type === 'part-time' ? 'パート' : job.employment_type === 'contract' ? '契約' : '派遣'}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 flex-wrap mb-4">
                      {job.tags.slice(0, 3).map((tag, i) => (
                        <Badge key={i} variant="neutral" size="sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <Button variant="primary" className="w-full">
                      詳細を見る
                    </Button>
                  </Card>
                </Link>
              </motion.div>
            ))}
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
          { label: 'ホーム', path: '/dashboard', icon: Home },
          { label: '求人検索', path: '/jobs', icon: Search },
          { label: '応募履歴', path: '/applications', icon: FileText },
          { label: 'プロフィール', path: '/profile', icon: User },
        ]}
      />
    </div>
  );
}
