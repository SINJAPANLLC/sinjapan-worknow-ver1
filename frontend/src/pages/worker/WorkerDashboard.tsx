import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { jobsAPI, applicationsAPI, assignmentsAPI } from '../../lib/api';
import { Sparkles, Zap, Flame, Bell, UserCircle, MapPin, BarChart3, Menu, Radio } from 'lucide-react';
import { BottomNav } from '../../components/layout/BottomNav';

export default function WorkerDashboard() {
  const [isOnline, setIsOnline] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const { data: jobs } = useQuery({
    queryKey: ['jobs', 'published'],
    queryFn: () => jobsAPI.list({ status: 'published', size: 5 }),
  });

  const { data: applications } = useQuery({
    queryKey: ['applications'],
    queryFn: applicationsAPI.list,
  });

  const { data: assignments } = useQuery({
    queryKey: ['assignments'],
    queryFn: assignmentsAPI.list,
  });

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

  return (
    <div className="min-h-screen bg-gray-100 pb-20 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-green-100/30 via-blue-50/30 to-yellow-50/30" 
           style={{
             backgroundImage: `
               linear-gradient(to right, rgba(0,0,0,0.02) 1px, transparent 1px),
               linear-gradient(to bottom, rgba(0,0,0,0.02) 1px, transparent 1px)
             `,
             backgroundSize: '40px 40px'
           }}>
      </div>

      <div className="absolute top-4 left-4 z-10">
        <button className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <button className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
          <Radio className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {userLocation && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="relative"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-[#00CED1] to-[#009999] rounded-full shadow-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full" />
            </div>
            <motion.div
              className="absolute inset-0 bg-[#00CED1]/30 rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </div>
      )}

      <div className="absolute top-1/4 left-1/4 z-5">
        <div className="bg-white rounded-2xl px-4 py-2 shadow-md flex items-center gap-2">
          <MapPin className="w-4 h-4 text-pink-500" />
          <div>
            <p className="text-xs text-gray-600">相模川ふれあい科学館</p>
            <p className="text-xs font-medium text-gray-900">学園 アクアリウムさがみはら</p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-20 pb-4">
        <div className="px-6 pt-6 pb-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Sagami</h2>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm text-gray-600">配達の需要</p>
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

            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-4 flex items-center gap-3 mb-4 border border-purple-100">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-xl flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 font-medium">
                  11/9は1件あたりの報酬が通常時より… 次から：9:00
                </p>
              </div>
              <button className="text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`w-full py-5 rounded-2xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-3 ${
              isOnline
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                : 'bg-gradient-to-r from-[#00CED1] to-[#009999] text-white hover:from-[#00D4D4] hover:to-[#00A0A0]'
            }`}
          >
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <span>{isOnline ? 'オフラインにする' : 'オンラインにする'}</span>
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
