import { useQuery } from '@tanstack/react-query';
import { Card } from '../components/ui/Card';
import { useAuthStore } from '../stores/authStore';
import { BottomNav } from '../components/layout/BottomNav';
import { Star } from 'lucide-react';
import { reviewsAPI } from '../lib/api';
import { Sparkles, Zap, Flame, MessageCircle, UserCircle } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  comment?: string;
  reviewer_id: string;
  reviewee_id: string;
  reviewer_name?: string;
  reviewee_name?: string;
  assignment_id: string;
  created_at: string;
  is_public: boolean;
}

export function ReviewsListPage() {
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['my-reviews'],
    queryFn: () => reviewsAPI.list({ reviewer_id: user?.id }),
    enabled: !!user,
  });

  const reviews: Review[] = data || [];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00CED1] via-[#00CED1]/80 to-[#009999] pb-28">
      <div className="container mx-auto px-4 pt-24 max-w-4xl">
        <h1 className="text-3xl font-bold text-white mb-6">レビュー</h1>

        {isLoading ? (
          <Card className="p-8">
            <p className="text-center text-gray-500">読み込み中...</p>
          </Card>
        ) : reviews.length === 0 ? (
          <Card className="p-8">
            <p className="text-center text-gray-500">レビューはありません</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400/20 to-amber-400/20 flex items-center justify-center">
                      <Star className="w-6 h-6 text-yellow-600 fill-yellow-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= review.rating
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-gray-700 mb-2">{review.comment}</p>
                    )}
                    <div className="text-sm text-gray-600">
                      {user.role === 'worker' ? (
                        <p>評価先: {review.reviewee_name || '会社'}</p>
                      ) : (
                        <p>評価者: {review.reviewer_name || 'ワーカー'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      <BottomNav
        items={[
          { label: 'さがす', path: user.role === 'worker' ? '/jobs' : user.role === 'company' ? '/jobs/manage' : '/admin/users', icon: Sparkles },
          { label: 'はたらく', path: user.role === 'worker' ? '/applications' : user.role === 'company' ? '/jobs/new' : '/admin/jobs', icon: Zap },
          { label: 'Now', path: '/dashboard', icon: Flame },
          { label: 'メッセージ', path: '/messages', icon: MessageCircle },
          { label: 'マイページ', path: user.role === 'admin' ? '/admin/stats' : '/profile', icon: UserCircle },
        ]}
      />
    </div>
  );
}
