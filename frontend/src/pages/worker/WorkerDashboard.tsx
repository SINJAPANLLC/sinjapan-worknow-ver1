import { useState, useEffect, lazy, Suspense } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { jobsAPI, authAPI } from '../../lib/api';
import { Sparkles, Zap, Flame, Bell, UserCircle, MapPin, BarChart3, Menu, Radio } from 'lucide-react';
import { BottomNav } from '../../components/layout/BottomNav';

// Lazy load map component to avoid React 19 compatibility issues
const MapComponent = lazy(() => import('../../components/map/WorkerMap'));

export default function WorkerDashboard() {
  const [isOnline, setIsOnline] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const { data: jobs } = useQuery({
    queryKey: ['jobs', 'published'],
    queryFn: () => jobsAPI.list({ status: 'published', size: 5 }),
  });

  const onlineStatusMutation = useMutation({
    mutationFn: (isOnline: boolean) => authAPI.setOnlineStatus(isOnline),
    onSuccess: () => {
      // Successfully updated online status
    },
    onError: (error) => {
      console.error('Failed to update online status:', error);
      // Revert UI state on error
      setIsOnline(!isOnline);
    },
  });

  const handleToggleOnline = () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    onlineStatusMutation.mutate(newStatus);
  };

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

  const demandLevel = 'low';
  const demandText = demandLevel === 'low' ? '低' : demandLevel === 'medium' ? '中' : '高';
  const demandColor = demandLevel === 'low' ? 'bg-gray-400' : demandLevel === 'medium' ? 'bg-yellow-400' : 'bg-red-400';

  const defaultCenter: [number, number] = userLocation 
    ? [userLocation.lat, userLocation.lng] 
    : [35.6812, 139.7671]; // Tokyo default

  return (
    <div className="min-h-screen bg-gray-100 pt-16 pb-24 relative">
      {/* Map Container */}
      <div className="absolute inset-0">
        {userLocation ? (
          <Suspense fallback={
            <div className="absolute inset-0 bg-gradient-to-br from-green-100/30 via-blue-50/30 to-yellow-50/30 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-[#00CED1] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600 font-medium">マップを読み込み中...</p>
              </div>
            </div>
          }>
            <MapComponent center={defaultCenter} jobs={jobs || []} isOnline={isOnline} />
          </Suspense>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-green-100/30 via-blue-50/30 to-yellow-50/30 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#00CED1] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium">位置情報を取得中...</p>
            </div>
          </div>
        )}
      </div>

      {/* Top buttons */}
      <div className="absolute top-4 left-4 z-[1000]">
        <button className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      <div className="absolute top-4 right-4 z-[1000]">
        <button className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
          <Radio className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {/* Bottom sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-[1000] pb-32">
        <div className="px-6 pt-6 pb-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {userLocation ? '現在地周辺' : '位置情報取得中...'}
            </h2>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm text-gray-600">お仕事の需要</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((bar) => (
                  <div
                    key={bar}
                    className={`w-1 h-4 rounded-full ${
                      bar <= 2 ? demandColor : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-700">{demandText}</span>
            </div>

            {isOnline && jobs && jobs.length > 0 ? (
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {jobs.slice(0, 3).map((job) => (
                  <div
                    key={job.id}
                    className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-4 border border-purple-100 cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-xl flex items-center justify-center flex-shrink-0">
                        <BarChart3 className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-gray-900 mb-1 truncate">{job.title}</h3>
                        <p className="text-xs text-gray-600 mb-2">{job.location}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-[#00CED1]">¥{job.hourly_rate.toLocaleString()}/時</span>
                          <span className="text-xs text-gray-500">{new Date(job.start_date).toLocaleDateString('ja-JP')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 mb-4 border border-gray-200 text-center">
                <p className="text-sm text-gray-600">
                  {isOnline ? '現在、近くに求人はありません' : 'オンラインにすると求人が表示されます'}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleToggleOnline}
            disabled={onlineStatusMutation.isPending}
            className={`w-full py-5 rounded-2xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-3 relative overflow-hidden disabled:opacity-70 ${
              isOnline
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                : 'bg-gradient-to-r from-[#00CED1] to-[#009999] text-white hover:from-[#00D4D4] hover:to-[#00A0A0]'
            }`}
          >
            {isOnline && (
              <motion.div
                className="absolute inset-0 bg-white/20"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
            )}
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-white animate-pulse' : 'bg-white/50'}`} />
            <span className="relative z-10">{isOnline ? 'オンライン中' : 'オンラインにする'}</span>
            {isOnline && <span className="text-xs opacity-75 absolute bottom-1 right-4 relative z-10">タップでオフラインに</span>}
          </button>
        </div>
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
