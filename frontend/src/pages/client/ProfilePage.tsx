import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { authAPI, paymentsAPI, reviewsAPI } from '../../lib/api';
import { slideUp, fadeIn } from '../../utils/animations';
import { Sparkles, Zap, Flame, MessageCircle, UserCircle, Mail, Calendar, Shield, CreditCard, TrendingUp, Star } from 'lucide-react';
import { BottomNav } from '../../components/layout/BottomNav';

export default function ProfilePage() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: authAPI.me,
  });

  const { data: payments } = useQuery({
    queryKey: ['payments'],
    queryFn: () => paymentsAPI.list(),
  });

  const { data: receivedReviews } = useQuery({
    queryKey: ['reviews', 'received', user?.id],
    queryFn: () => reviewsAPI.list({ reviewee_id: user?.id }),
    enabled: !!user?.id,
  });

  const totalSpent = payments?.items
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0) || 0;

  const averageRating = receivedReviews && receivedReviews.length > 0
    ? receivedReviews.reduce((sum, r) => sum + r.rating, 0) / receivedReviews.length
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-gray-900 pb-20">
      <div className="container mx-auto px-4 py-8">
        <motion.div {...fadeIn}>
          <h1 className="text-3xl font-bold mb-2 text-white">プロフィール</h1>
          <p className="text-white/80 mb-6">企業アカウント情報</p>
        </motion.div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        ) : user ? (
          <div className="space-y-4">
            <motion.div {...slideUp}>
              <Card>
                <div className="flex items-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-3xl font-bold mr-4">
                    {user.full_name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">{user.full_name}</h2>
                    <Badge variant="info" size="lg" className="mt-2">
                      <Shield className="w-4 h-4 mr-1" />
                      企業アカウント
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <Mail className="w-5 h-5 mr-3 text-primary" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Calendar className="w-5 h-5 mr-3 text-primary" />
                    <span>登録日: {new Date(user.created_at).toLocaleDateString('ja-JP')}</span>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div {...slideUp} style={{ animationDelay: '0.1s' }}>
              <Card>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-6 h-6 mr-2 text-primary" />
                  利用状況
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-primary/10 to-primary-dark/10 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">掲載中の求人</div>
                    <div className="text-2xl font-bold text-primary">0</div>
                  </div>

                  <div className="bg-gradient-to-r from-primary/10 to-primary-dark/10 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">総応募者数</div>
                    <div className="text-2xl font-bold text-primary">0</div>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div {...slideUp} style={{ animationDelay: '0.2s' }}>
              <Card>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="w-6 h-6 mr-2 text-primary" />
                  決済情報
                </h3>

                <div className="bg-gradient-to-r from-primary/10 to-primary-dark/10 rounded-lg p-6 mb-4">
                  <div className="text-sm text-gray-600 mb-1">累計支払額</div>
                  <div className="text-3xl font-bold text-primary">
                    ¥{totalSpent.toLocaleString()}
                  </div>
                </div>

                <Button variant="primary" className="w-full">
                  <CreditCard className="w-5 h-5 mr-2" />
                  支払い方法を管理
                </Button>
              </Card>
            </motion.div>

            <motion.div {...slideUp} style={{ animationDelay: '0.3s' }}>
              <Card>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Star className="w-6 h-6 mr-2 text-yellow-500" />
                  受け取ったレビュー
                </h3>

                {receivedReviews && receivedReviews.length > 0 ? (
                  <>
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-600 mb-1">平均評価</div>
                          <div className="flex items-center">
                            <span className="text-3xl font-bold text-gray-900 mr-2">
                              {averageRating.toFixed(1)}
                            </span>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-6 h-6 ${
                                    star <= Math.round(averageRating)
                                      ? 'text-yellow-500 fill-yellow-500'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">{receivedReviews.length}</div>
                          <div className="text-sm text-gray-600">件のレビュー</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {receivedReviews.slice(0, 5).map((review) => (
                        <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= review.rating
                                      ? 'text-yellow-500 fill-yellow-500'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(review.created_at).toLocaleDateString('ja-JP')}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="text-sm text-gray-700">{review.comment}</p>
                          )}
                        </div>
                      ))}
                    </div>

                    {receivedReviews.length > 5 && (
                      <p className="text-sm text-gray-500 text-center mt-3">
                        他{receivedReviews.length - 5}件のレビュー
                      </p>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>まだレビューがありません</p>
                  </div>
                )}
              </Card>
            </motion.div>

            <motion.div {...slideUp} style={{ animationDelay: '0.4s' }}>
              <Card>
                <h3 className="text-xl font-bold text-gray-900 mb-4">アカウント設定</h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    企業情報を編集
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    パスワード変更
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    通知設定
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    請求書設定
                  </Button>
                  <Button variant="danger" className="w-full justify-start">
                    アカウント削除
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        ) : null}
      </div>

      <BottomNav
        items={[
          { label: 'さがす', path: '/jobs/manage', icon: Sparkles },
          { label: 'はたらく', path: '/jobs/new', icon: Zap },
          { label: 'Now', path: '/dashboard', icon: Flame },
          { label: 'メッセージ', path: '/messages', icon: MessageCircle },
          { label: 'マイページ', path: '/profile', icon: UserCircle },
        ]}
      />
    </div>
  );
}
