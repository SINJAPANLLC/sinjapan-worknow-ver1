import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { jobsAPI } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { slideUp, fadeIn } from '../../utils/animations';
import { Home, PlusCircle, Briefcase, User, ArrowLeft } from 'lucide-react';
import { BottomNav } from '../../components/layout/BottomNav';

export default function JobCreatePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    employment_type: 'full-time',
    hourly_rate: '',
    tags: '',
    starts_at: '',
    ends_at: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await jobsAPI.create({
        title: formData.title,
        description: formData.description,
        location: formData.location || undefined,
        employment_type: formData.employment_type || undefined,
        hourly_rate: formData.hourly_rate ? parseInt(formData.hourly_rate) : undefined,
        currency: 'JPY',
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
        starts_at: formData.starts_at || undefined,
        ends_at: formData.ends_at || undefined,
      });
      alert('求人を作成しました！');
      navigate('/jobs/manage');
    } catch (error) {
      console.error('求人作成エラー:', error);
      alert('求人作成に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-gray-900 pb-20">
      <div className="container mx-auto px-4 py-8">
        <motion.div {...fadeIn} className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-white/80 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            戻る
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">新規求人作成</h1>
          <p className="text-white/80">求人情報を入力してください</p>
        </motion.div>

        <motion.div {...slideUp}>
          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  求人タイトル <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="例：フロントエンドエンジニア募集"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  仕事内容 <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="仕事の詳細を記入してください"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    勤務地
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="例：東京都渋谷区"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    雇用形態
                  </label>
                  <select
                    name="employment_type"
                    value={formData.employment_type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="full-time">正社員</option>
                    <option value="part-time">パート</option>
                    <option value="contract">契約</option>
                    <option value="temporary">派遣</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  時給（円）
                </label>
                <input
                  type="number"
                  name="hourly_rate"
                  value={formData.hourly_rate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="例：1500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  タグ（カンマ区切り）
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="例：リモート可, 経験者歓迎, 即日勤務可"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    勤務開始日
                  </label>
                  <input
                    type="date"
                    name="starts_at"
                    value={formData.starts_at}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    勤務終了日（任意）
                  </label>
                  <input
                    type="date"
                    name="ends_at"
                    value={formData.ends_at}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="flex-1"
                >
                  キャンセル
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? '作成中...' : '求人を作成'}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>

      <BottomNav
        items={[
          { label: 'ホーム', path: '/dashboard', icon: Home },
          { label: '求人作成', path: '/jobs/new', icon: PlusCircle },
          { label: '求人管理', path: '/jobs/manage', icon: Briefcase },
          { label: 'プロフィール', path: '/profile', icon: User },
        ]}
      />
    </div>
  );
}
