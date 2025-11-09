import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Star,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  Heart,
  Filter,
  ArrowLeft,
  User as UserIcon,
  Award,
  Briefcase
} from 'lucide-react';
import { type User } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { slideUp, fadeIn } from '../../utils/animations';
import { RoleBottomNav } from '../../components/layout/RoleBottomNav';

export default function ClientWorkersPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrefecture, setSelectedPrefecture] = useState<string>('all');
  const [minRating, setMinRating] = useState<number>(0);
  const [showFavorites, setShowFavorites] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<User | null>(null);

  const { data: workers = [], isLoading } = useQuery({
    queryKey: ['workers'],
    queryFn: async () => {
      try {
        return [];
      } catch (error) {
        console.error('Failed to fetch workers:', error);
        return [];
      }
    },
  });

  const prefectures = [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県',
    '岐阜県', '静岡県', '愛知県', '三重県',
    '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県',
    '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県',
    '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
  ];

  const filteredWorkers = workers.filter((worker: User) => {
    if (searchQuery && !worker.full_name?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedPrefecture !== 'all' && worker.preferred_prefecture !== selectedPrefecture) {
      return false;
    }
    const workerRating = (worker as any).average_rating || 0;
    if (minRating > 0 && workerRating < minRating) {
      return false;
    }
    const isFavorite = (worker as any).is_favorite || false;
    if (showFavorites && !isFavorite) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00CED1] via-[#00B4B4] to-[#009999] pb-24 pt-28">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          {...fadeIn}
          className="flex items-center gap-4 mb-8"
        >
          <Button
            onClick={() => navigate('/client/dashboard')}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-4xl font-bold text-white">ワーカー管理</h1>
        </motion.div>

        {/* Search and Filters */}
        <div className="grid gap-4 mb-8">
          {/* Search Bar */}
          <motion.div {...fadeIn} transition={{ delay: 0.1 }}>
            <Card className="bg-white/95 backdrop-blur-sm p-4">
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ワーカー名で検索..."
                  className="flex-1 border-none outline-none bg-transparent text-gray-900 placeholder-gray-400"
                />
              </div>
            </Card>
          </motion.div>

          {/* Filters */}
          <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
            <Card className="bg-white/95 backdrop-blur-sm p-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">フィルター:</span>
                </div>
                
                <select
                  value={selectedPrefecture}
                  onChange={(e) => setSelectedPrefecture(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">すべての都道府県</option>
                  {prefectures.map((pref) => (
                    <option key={pref} value={pref}>{pref}</option>
                  ))}
                </select>

                <select
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value={0}>すべての評価</option>
                  <option value={4}>★ 4.0以上</option>
                  <option value={4.5}>★ 4.5以上</option>
                  <option value={4.8}>★ 4.8以上</option>
                </select>

                <Button
                  onClick={() => setShowFavorites(!showFavorites)}
                  variant={showFavorites ? 'primary' : 'outline'}
                  size="sm"
                >
                  <Heart className={`w-4 h-4 mr-1 ${showFavorites ? 'fill-current' : ''}`} />
                  お気に入りのみ
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Workers List */}
        {isLoading ? (
          <Card className="bg-white/95 backdrop-blur-sm p-12">
            <div className="text-center text-gray-500">読み込み中...</div>
          </Card>
        ) : filteredWorkers.length === 0 ? (
          <Card className="bg-white/95 backdrop-blur-sm p-12">
            <div className="text-center text-gray-500">
              <UserIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>該当するワーカーが見つかりませんでした</p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredWorkers.map((worker: User) => (
              <motion.div
                key={worker.id}
                {...slideUp}
              >
                <Card className="bg-white/95 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                  <div className="p-6">
                    {/* Worker Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-lg">
                          {worker.full_name?.charAt(0) || 'W'}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{worker.full_name}</h3>
                          <div className="flex items-center gap-1 text-yellow-500 text-sm">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="font-medium">4.8</span>
                            <span className="text-gray-500 text-xs">(24件)</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Heart className="w-5 h-5 text-gray-400 hover:text-red-500 hover:fill-current transition-colors" />
                      </Button>
                    </div>

                    {/* Worker Info */}
                    <div className="space-y-2 mb-4">
                      {worker.preferred_prefecture && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{worker.preferred_prefecture}</span>
                        </div>
                      )}
                      {worker.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{worker.phone}</span>
                        </div>
                      )}
                      {worker.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{worker.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Qualifications */}
                    {worker.qualifications && worker.qualifications.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                          <Award className="w-3 h-3" />
                          <span>資格・スキル</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {worker.qualifications.slice(0, 3).map((qual: string, idx: number) => (
                            <Badge key={idx} variant="neutral" size="sm">
                              {qual}
                            </Badge>
                          ))}
                          {worker.qualifications.length > 3 && (
                            <Badge variant="neutral" size="sm">
                              +{worker.qualifications.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                      <Button
                        onClick={() => setSelectedWorker(worker)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <UserIcon className="w-4 h-4 mr-1" />
                        詳細
                      </Button>
                      <Button
                        onClick={() => navigate(`/client/messages?user_id=${worker.id}`)}
                        variant="primary"
                        size="sm"
                        className="flex-1"
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        連絡
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Worker Detail Modal */}
      {selectedWorker && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedWorker(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-gradient-to-r from-primary to-primary-dark text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-2xl">
                    {selectedWorker.full_name?.charAt(0) || 'W'}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedWorker.full_name}</h2>
                    <div className="flex items-center gap-1 text-yellow-300 mt-1">
                      <Star className="w-5 h-5 fill-current" />
                      <span className="font-medium">4.8</span>
                      <span className="text-white/70 text-sm ml-1">(24件のレビュー)</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => setSelectedWorker(null)}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  ✕
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-3">基本情報</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">メール:</span>
                    <span className="font-medium text-gray-900">{selectedWorker.email}</span>
                  </div>
                  {selectedWorker.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">電話:</span>
                      <span className="font-medium text-gray-900">{selectedWorker.phone}</span>
                    </div>
                  )}
                  {selectedWorker.preferred_prefecture && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">希望勤務地:</span>
                      <span className="font-medium text-gray-900">{selectedWorker.preferred_prefecture}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Qualifications */}
              {selectedWorker.qualifications && selectedWorker.qualifications.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    資格・スキル
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedWorker.qualifications.map((qual: string, idx: number) => (
                      <Badge key={idx} variant="primary">
                        {qual}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Work History */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  実績
                </h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">48</div>
                    <div className="text-xs text-gray-600">完了案件</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">4.8</div>
                    <div className="text-xs text-gray-600">平均評価</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">98%</div>
                    <div className="text-xs text-gray-600">完了率</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={() => navigate(`/client/messages?user_id=${selectedWorker.id}`)}
                  variant="primary"
                  className="flex-1"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  メッセージを送る
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  お気に入りに追加
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      <RoleBottomNav />
    </div>
  );
}
