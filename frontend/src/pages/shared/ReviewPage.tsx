import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { reviewsAPI } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Star, Send, CheckCircle } from 'lucide-react';

export default function ReviewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const assignmentId = searchParams.get('assignment_id');
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const createReviewMutation = useMutation({
    mutationFn: (data: { assignment_id: string; rating: number; comment?: string; is_public: boolean }) =>
      reviewsAPI.create(data),
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ['my-reviews'] });
      setTimeout(() => {
        navigate(user?.role === 'worker' ? '/applications' : '/jobs/manage');
      }, 2000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentId || rating === 0) return;

    createReviewMutation.mutate({
      assignment_id: assignmentId,
      rating,
      comment: comment.trim() || undefined,
      is_public: isPublic,
    });
  };

  if (!assignmentId) {
    navigate(-1);
    return null;
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-cyan-50 to-teal-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-md"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">レビューを投稿しました</h2>
          <p className="text-gray-700 mb-6">ご協力ありがとうございました！</p>
          <div className="text-sm text-gray-500">自動的にページが切り替わります...</div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-cyan-50 to-teal-50 pt-16 pb-24 px-4">
      <div className="max-w-2xl mx-auto">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          戻る
        </Button>

        <Card className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#00CED1] to-[#009999] rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-white fill-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">レビューを投稿</h1>
            <p className="text-gray-700">
              {user?.role === 'worker' ? 'クライアント' : 'ワーカー'}を評価してください
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                評価 <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center justify-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-all transform hover:scale-110"
                  >
                    <Star
                      className={`w-12 h-12 transition-colors ${
                        star <= (hoveredRating || rating)
                          ? 'text-[#00CED1] fill-[#00CED1]'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-center text-sm text-gray-700 font-medium">
                  {rating === 5 && '最高！'}
                  {rating === 4 && '良かった'}
                  {rating === 3 && '普通'}
                  {rating === 2 && 'イマイチ'}
                  {rating === 1 && '悪かった'}
                </p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-900 mb-2">
                コメント（任意）
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                maxLength={2000}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00CED1] focus:border-transparent resize-none"
                placeholder="良かった点や改善点などをご記入ください"
              />
              <p className="text-xs text-gray-500 mt-1">{comment.length} / 2000</p>
            </div>

            {/* Public/Private */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <input
                type="checkbox"
                id="is_public"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-[#00CED1] focus:ring-[#00CED1]"
              />
              <label htmlFor="is_public" className="text-sm text-gray-700 cursor-pointer">
                このレビューを公開する（他のユーザーが閲覧できます）
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={() => navigate(-1)}
                variant="outline"
                className="flex-1"
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                disabled={rating === 0 || createReviewMutation.isPending}
                className="flex-1 bg-gradient-to-r from-[#00CED1] to-[#009999] text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createReviewMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    送信中...
                  </div>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    投稿する
                  </>
                )}
              </Button>
            </div>

            {createReviewMutation.isError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                エラーが発生しました。もう一度お試しください。
              </div>
            )}
          </form>
        </Card>

        <div className="mt-6 p-4 bg-white/80 backdrop-blur-sm rounded-xl">
          <h3 className="font-bold text-gray-900 mb-2 text-sm">💡 レビューのポイント</h3>
          <ul className="text-xs text-gray-700 space-y-1">
            <li>• 具体的な内容を書くと、他の方の参考になります</li>
            <li>• 建設的なフィードバックを心がけましょう</li>
            <li>• 個人情報や誹謗中傷は避けてください</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
