import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Badge } from '../../components/ui/Badge';
import { jobsAPI } from '../../lib/api';
import { MapPin, Clock, Heart, ChevronDown, Sparkles, Zap, Flame, Bell, UserCircle, MapPinIcon } from 'lucide-react';
import { BottomNav } from '../../components/layout/BottomNav';

const PREFECTURES = [
  '全国', '東京都', '神奈川県', '大阪府', '愛知県', '福岡県', '北海道', 
  '埼玉県', '千葉県', '兵庫県', '京都府', '宮城県'
];

const DATES = [
  { label: '今日', value: 'today' },
  { label: '9日', value: '9' },
  { label: '10日', value: '10' },
  { label: '11日', value: '11' },
  { label: '12日', value: '12' },
  { label: '13日', value: '13' },
];

const SORT_OPTIONS = [
  { label: '現在地から近い順', value: 'distance' },
  { label: '時給が高い順', value: 'hourly_rate_desc' },
  { label: '新着順', value: 'newest' },
  { label: '応募が少ない順', value: 'least_applications' },
];

export default function JobsPage() {
  const [selectedPrefecture, setSelectedPrefecture] = useState('神奈川県');
  const [selectedDate, setSelectedDate] = useState('today');
  const [selectedSort, setSelectedSort] = useState('distance');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['jobs', 'published'],
    queryFn: () => jobsAPI.list({ status: 'published' }),
  });

  const toggleFavorite = (jobId: string) => {
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white sticky top-0 z-10 shadow-sm">
        <div className="px-4 py-3 space-y-3">
          <button className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-2">
              <MapPinIcon className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">{selectedPrefecture}</span>
            </div>
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </button>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {DATES.map((date) => (
              <button
                key={date.value}
                onClick={() => setSelectedDate(date.value)}
                className={`flex-shrink-0 px-4 py-3 rounded-xl font-medium transition-all ${
                  selectedDate === date.value
                    ? 'bg-yellow-400 text-gray-900 shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {date.label}
              </button>
            ))}
          </div>

          <button className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <span className="text-sm text-gray-700">
              {SORT_OPTIONS.find(opt => opt.value === selectedSort)?.label}
            </span>
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900">
            2025年11月8日
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">この日の新しい募集を通知</span>
            <button className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200">
              OFF
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : jobsData && jobsData.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {jobsData.map((job: any, index: number) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={`/jobs/${job.id}`}>
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative">
                    <div className="absolute top-0 left-0 z-10">
                      <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 transform -rotate-12 origin-top-left shadow-md">
                        急募
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleFavorite(job.id);
                      }}
                      className="absolute top-2 right-2 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-md"
                    >
                      <Heart
                        className={`w-5 h-5 transition-colors ${
                          favorites.has(job.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'
                        }`}
                      />
                    </button>

                    <div className="aspect-[4/3] bg-gradient-to-br from-gray-200 to-gray-300 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      <div className="absolute bottom-2 left-2">
                        <Badge variant="success" className="bg-white/90 backdrop-blur-sm text-gray-900 border-0">
                          未経験歓迎
                        </Badge>
                      </div>
                    </div>

                    <div className="p-3">
                      <h3 className="font-bold text-sm text-gray-900 mb-2 line-clamp-2 leading-snug">
                        {job.title}
                      </h3>

                      <div className="space-y-1 mb-3">
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">
                            {job.starts_at ? new Date(job.starts_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) : '9:30'} 
                            ～ 
                            {job.ends_at ? new Date(job.ends_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) : '11:00'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{job.location || '愛甲郡愛川町'} • 0.6km</span>
                        </div>
                      </div>

                      <div className="text-2xl font-bold text-gray-900">
                        ¥{job.hourly_rate ? job.hourly_rate.toLocaleString() : '2,175'}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium mb-2">求人が見つかりませんでした</p>
            <p className="text-sm text-gray-500">条件を変更してみてください</p>
          </div>
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
