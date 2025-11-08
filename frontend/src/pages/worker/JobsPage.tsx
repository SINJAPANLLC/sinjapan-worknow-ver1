import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Badge } from '../../components/ui/Badge';
import { jobsAPI, favoritesAPI, jobNotificationsAPI } from '../../lib/api';
import { MapPin, Clock, Heart, ChevronDown, Sparkles, Zap, Flame, MessageCircle, UserCircle, MapPinIcon } from 'lucide-react';
import { BottomNav } from '../../components/layout/BottomNav';

const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
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
  { label: '時給が高い順', value: 'hourly_rate' },
  { label: '新着順', value: 'created_at' },
];

export default function JobsPage() {
  const queryClient = useQueryClient();
  const [selectedPrefecture, setSelectedPrefecture] = useState('神奈川県');
  const [selectedDate, setSelectedDate] = useState('today');
  const [selectedSort, setSelectedSort] = useState('distance');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [showPrefectureMenu, setShowPrefectureMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.log('位置情報の取得に失敗しました:', error)
      );
    }
  }, []);

  // Convert selected date to ISO format
  const getDateString = () => {
    if (selectedDate === 'today') {
      return new Date().toISOString().split('T')[0];
    } else {
      // For dates like '9', '10', '11', etc., construct the date
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1; // Current month (1-12)
      const day = parseInt(selectedDate);
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  };

  // Fetch jobs with filters
  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['jobs', 'published', selectedPrefecture, selectedDate, selectedSort, userLocation],
    queryFn: () => jobsAPI.list({ 
      status: 'published',
      prefecture: selectedPrefecture,
      date: getDateString(),
      sort: selectedSort,
      user_lat: userLocation?.lat,
      user_lng: userLocation?.lng,
    }),
  });

  // Fetch user's favorites
  const { data: favoritesData } = useQuery({
    queryKey: ['favorites'],
    queryFn: favoritesAPI.list,
  });

  const favorites = new Set(favoritesData || []);

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: (jobId: string) => {
      if (favorites.has(jobId)) {
        return favoritesAPI.remove(jobId);
      } else {
        return favoritesAPI.add(jobId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  // Fetch notification status
  const { data: notificationData } = useQuery({
    queryKey: ['job-notification', getDateString(), selectedPrefecture],
    queryFn: () => jobNotificationsAPI.get({
      target_date: getDateString(),
      prefecture: selectedPrefecture,
    }),
  });

  // Update notification enabled state when data changes
  useEffect(() => {
    if (notificationData) {
      setNotificationEnabled(notificationData.enabled);
    }
  }, [notificationData]);

  // Notification toggle mutation
  const notificationMutation = useMutation({
    mutationFn: (enabled: boolean) => jobNotificationsAPI.set({
      target_date: getDateString(),
      prefecture: selectedPrefecture,
      enabled,
    }),
    onSuccess: () => {
      setNotificationEnabled(!notificationEnabled);
      queryClient.invalidateQueries({ queryKey: ['job-notification'] });
    },
  });

  const toggleFavorite = (jobId: string) => {
    toggleFavoriteMutation.mutate(jobId);
  };

  const toggleNotification = () => {
    notificationMutation.mutate(!notificationEnabled);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00CED1] via-[#00B5B5] to-[#009999] pt-16 pb-24">
      <div className="bg-white/95 backdrop-blur-sm sticky top-0 z-20 shadow-lg pt-20">
        <div className="px-4 py-3 space-y-3">
          <div className="relative">
            <button 
              onClick={() => setShowPrefectureMenu(!showPrefectureMenu)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#00CED1]/10 to-[#009999]/10 rounded-xl hover:from-[#00CED1]/20 hover:to-[#009999]/20 transition-all border border-[#00CED1]/20"
            >
              <div className="flex items-center gap-2">
                <MapPinIcon className="w-5 h-5 text-[#009999]" />
                <span className="font-medium text-gray-900">{selectedPrefecture}</span>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showPrefectureMenu ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showPrefectureMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-64 overflow-y-auto z-30"
                >
                  <div className="grid grid-cols-2 gap-1 p-2">
                    {PREFECTURES.map((prefecture) => (
                      <button
                        key={prefecture}
                        onClick={() => {
                          setSelectedPrefecture(prefecture);
                          setShowPrefectureMenu(false);
                        }}
                        className={`px-3 py-2 text-sm rounded-lg text-left transition-all ${
                          selectedPrefecture === prefecture
                            ? 'bg-gradient-to-r from-[#00CED1] to-[#009999] text-white font-medium'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {prefecture}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {DATES.map((date) => (
              <button
                key={date.value}
                onClick={() => setSelectedDate(date.value)}
                className={`flex-shrink-0 px-4 py-3 rounded-xl font-medium transition-all ${
                  selectedDate === date.value
                    ? 'bg-gradient-to-r from-[#00CED1] to-[#009999] text-white shadow-lg shadow-[#00CED1]/30'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="text-center">
                  <div className={selectedDate === date.value ? 'text-white' : 'text-gray-900'}>
                    {date.label}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#00CED1]/10 to-[#009999]/10 rounded-xl hover:from-[#00CED1]/20 hover:to-[#009999]/20 transition-all border border-[#00CED1]/20"
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#009999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
                <span className="text-sm text-gray-700">
                  {SORT_OPTIONS.find(opt => opt.value === selectedSort)?.label}
                </span>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showSortMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-30"
                >
                  <div className="p-2 space-y-1">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSelectedSort(option.value);
                          setShowSortMenu(false);
                        }}
                        className={`w-full px-4 py-3 text-sm rounded-lg text-left transition-all ${
                          selectedSort === option.value
                            ? 'bg-gradient-to-r from-[#00CED1] to-[#009999] text-white font-medium'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="mb-4 flex items-center justify-between bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-sm">
          <p className="text-sm font-medium text-gray-900">
            {new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">この日の新しい募集を通知</span>
            <button 
              onClick={toggleNotification}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                notificationEnabled 
                  ? 'text-white bg-[#00CED1]' 
                  : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {notificationEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
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
                  <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] relative">
                    <div className="absolute top-0 left-0 z-10">
                      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1 transform -rotate-12 origin-top-left shadow-md">
                        急募
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleFavorite(job.id);
                      }}
                      className="absolute top-2 right-2 z-10 w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg hover:scale-110"
                      disabled={toggleFavoriteMutation.isPending}
                    >
                      <Heart
                        className={`w-5 h-5 transition-colors ${
                          favorites.has(job.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'
                        }`}
                      />
                    </button>

                    <div className="aspect-[4/3] bg-gradient-to-br from-[#00CED1]/20 to-[#009999]/20 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      <div className="absolute bottom-2 left-2">
                        <Badge variant="success" className="bg-white/95 backdrop-blur-sm text-[#009999] border-0 shadow-sm font-bold">
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
                          <Clock className="w-3.5 h-3.5 flex-shrink-0 text-[#00CED1]" />
                          <span className="truncate">
                            {job.starts_at ? new Date(job.starts_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) : '9:30'} 
                            ～ 
                            {job.ends_at ? new Date(job.ends_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) : '11:00'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-[#00CED1]" />
                          <span className="truncate">
                            {job.location || '愛甲郡愛川町'}
                            {job.distance_km && ` • ${job.distance_km.toFixed(1)}km`}
                          </span>
                        </div>
                      </div>

                      <div className="text-2xl font-bold bg-gradient-to-r from-[#00CED1] to-[#009999] bg-clip-text text-transparent">
                        ¥{job.hourly_rate ? job.hourly_rate.toLocaleString() : '2,175'}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center shadow-lg">
            <div className="w-16 h-16 bg-gradient-to-br from-[#00CED1] to-[#009999] rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <p className="text-gray-900 font-bold mb-2">求人が見つかりませんでした</p>
            <p className="text-sm text-gray-600">条件を変更してみてください</p>
          </div>
        )}
      </div>

      <BottomNav
        items={[
          { label: 'さがす', path: '/jobs', icon: Sparkles },
          { label: 'はたらく', path: '/applications', icon: Zap },
          { label: 'Now', path: '/dashboard', icon: Flame },
          { label: 'メッセージ', path: '/messages', icon: MessageCircle },
          { label: 'マイページ', path: '/profile', icon: UserCircle },
        ]}
      />
    </div>
  );
}
