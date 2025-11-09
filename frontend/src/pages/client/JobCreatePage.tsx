import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { jobsAPI } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { slideUp, fadeIn } from '../../utils/animations';
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Tag,
  Eye,
  Save,
  Send,
  AlertCircle,
  CheckCircle,
  Zap,
  Plus,
  Flame,
  MessageCircle,
  UserCircle,
} from 'lucide-react';
import { BottomNav } from '../../components/layout/BottomNav';

interface FormData {
  title: string;
  description: string;
  location: string;
  prefecture: string;
  employment_type: string;
  hourly_rate: string;
  tags: string;
  starts_at: string;
  ends_at: string;
  is_urgent: boolean;
}

interface FormErrors {
  title?: string;
  description?: string;
  hourly_rate?: string;
  starts_at?: string;
}

export default function JobCreatePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [saveAsDraft, setSaveAsDraft] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    location: '',
    prefecture: '',
    employment_type: 'part-time',
    hourly_rate: '',
    tags: '',
    starts_at: '',
    ends_at: '',
    is_urgent: false,
  });

  const prefectures = [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
    '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
    '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
    '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
  ];

  // Real-time validation for individual fields
  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'title':
        if (!value.trim()) return '求人タイトルは必須です';
        if (value.length < 5) return 'タイトルは5文字以上で入力してください';
        return undefined;
      
      case 'description':
        if (!value.trim()) return '仕事内容は必須です';
        if (value.length < 20) return '仕事内容は20文字以上で入力してください';
        return undefined;
      
      case 'hourly_rate':
        // Clear error when field is empty (optional field)
        if (!value || value === '') return undefined;
        
        const rate = parseInt(value);
        if (isNaN(rate)) return '有効な数値を入力してください';
        if (rate < 1000) return '時給は1000円以上で設定してください';
        if (rate > 10000) return '時給は10000円以下で設定してください';
        return undefined;
      
      case 'starts_at':
        // Clear error when field is empty (optional field)
        if (!value || value === '') return undefined;
        
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) return '過去の日付は選択できません';
        return undefined;
      
      default:
        return undefined;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    newErrors.title = validateField('title', formData.title);
    newErrors.description = validateField('description', formData.description);
    newErrors.hourly_rate = validateField('hourly_rate', formData.hourly_rate);
    newErrors.starts_at = validateField('starts_at', formData.starts_at);

    // Filter out undefined errors
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key as keyof FormErrors]) {
        delete newErrors[key as keyof FormErrors];
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();
    
    if (!isDraft && !validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSaveAsDraft(isDraft);

    try {
      // Create the job (defaults to DRAFT status)
      const createdJob = await jobsAPI.create({
        title: formData.title,
        description: formData.description,
        location: formData.location || undefined,
        prefecture: formData.prefecture || undefined,
        employment_type: formData.employment_type || undefined,
        hourly_rate: formData.hourly_rate ? parseInt(formData.hourly_rate) : undefined,
        currency: 'JPY',
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        starts_at: formData.starts_at || undefined,
        ends_at: formData.ends_at || undefined,
        is_urgent: formData.is_urgent,
      });
      
      // If not saving as draft, publish the job using jobsAPI
      if (!isDraft && createdJob.id) {
        await jobsAPI.publish(createdJob.id);
      }
      
      navigate('/jobs/manage', { 
        state: { 
          message: isDraft ? '下書きとして保存しました' : '求人を公開しました！' 
        } 
      });
    } catch (error: any) {
      console.error('求人作成エラー:', error);
      alert(error.response?.data?.detail || error.message || '求人作成に失敗しました');
    } finally {
      setIsSubmitting(false);
      setSaveAsDraft(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Real-time validation on change for all validation fields
    if (type !== 'checkbox' && (name === 'title' || name === 'description' || name === 'hourly_rate' || name === 'starts_at')) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const tagsArray = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00CED1] via-[#00A5A8] to-[#009999] pb-24 pt-28">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <motion.div
          variants={fadeIn}
          initial="initial"
          animate="animate"
          className="mb-6"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-white/90 hover:text-white mb-4 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            戻る
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">新規求人作成</h1>
              <p className="text-white/90">優秀なワーカーを見つけましょう</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? '編集に戻る' : 'プレビュー'}
            </Button>
          </div>
        </motion.div>

        {showPreview ? (
          /* Preview Mode */
          <motion.div
            variants={slideUp}
            initial="initial"
            animate="animate"
          >
            <Card className="p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Eye className="w-6 h-6 text-[#00CED1]" />
                求人プレビュー
              </h2>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <h3 className="text-2xl font-bold text-gray-900">{formData.title || '（タイトル未入力）'}</h3>
                    {formData.is_urgent && (
                      <Badge variant="danger">急募</Badge>
                    )}
                    <Badge variant="success">募集中</Badge>
                  </div>
                  
                  {formData.hourly_rate && (
                    <p className="text-3xl font-bold text-[#00CED1] mb-4">
                      ¥{parseInt(formData.hourly_rate).toLocaleString()}/時
                    </p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {formData.prefecture && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin className="w-5 h-5 text-[#00CED1]" />
                      <span>{formData.prefecture} {formData.location}</span>
                    </div>
                  )}
                  {formData.starts_at && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="w-5 h-5 text-[#00CED1]" />
                      <span>{new Date(formData.starts_at).toLocaleDateString('ja-JP')}</span>
                    </div>
                  )}
                  {formData.employment_type && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Briefcase className="w-5 h-5 text-[#00CED1]" />
                      <span>
                        {formData.employment_type === 'full-time' ? '正社員' :
                         formData.employment_type === 'part-time' ? 'パート' :
                         formData.employment_type === 'contract' ? '契約' : '派遣'}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">仕事内容</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {formData.description || '（仕事内容未入力）'}
                  </p>
                </div>

                {tagsArray.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">タグ</h4>
                    <div className="flex gap-2 flex-wrap">
                      {tagsArray.map((tag, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 text-sm bg-[#00CED1]/10 text-[#00CED1] rounded-full font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(false)}
                  className="w-full"
                >
                  編集に戻る
                </Button>
              </div>
            </Card>
          </motion.div>
        ) : (
          /* Edit Mode */
          <motion.div
            variants={slideUp}
            initial="initial"
            animate="animate"
          >
            <Card className="p-6 md:p-8">
              <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
                {/* Urgent Toggle */}
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-200">
                  <input
                    type="checkbox"
                    id="is_urgent"
                    name="is_urgent"
                    checked={formData.is_urgent}
                    onChange={handleChange}
                    className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                  />
                  <label htmlFor="is_urgent" className="flex items-center gap-2 text-gray-900 font-medium cursor-pointer">
                    <Zap className="w-5 h-5 text-red-600" />
                    急募として目立たせる
                  </label>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    求人タイトル <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 rounded-xl border-2 ${
                      errors.title ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#00CED1]'
                    } focus:ring-2 focus:ring-[#00CED1]/20 transition-colors`}
                    placeholder="例：軽作業スタッフ募集 | 短期アルバイト"
                  />
                  {errors.title && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.title}
                    </p>
                  )}
                  {!errors.title && formData.title && formData.title.length >= 5 && (
                    <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      OK
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    仕事内容 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    rows={8}
                    className={`w-full px-4 py-3 rounded-xl border-2 ${
                      errors.description ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#00CED1]'
                    } focus:ring-2 focus:ring-[#00CED1]/20 transition-colors`}
                    placeholder="仕事の詳細、必要なスキル、勤務時間などを記入してください"
                  />
                  <div className="flex items-center justify-between mt-2">
                    {errors.description ? (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.description}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500">
                        {formData.description.length}文字
                      </p>
                    )}
                    {!errors.description && formData.description && formData.description.length >= 20 && (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        OK
                      </p>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      都道府県
                    </label>
                    <select
                      name="prefecture"
                      value={formData.prefecture}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#00CED1] focus:ring-2 focus:ring-[#00CED1]/20 transition-colors"
                    >
                      <option value="">選択してください</option>
                      {prefectures.map(pref => (
                        <option key={pref} value={pref}>{pref}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      詳細住所
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#00CED1] focus:ring-2 focus:ring-[#00CED1]/20 transition-colors"
                      placeholder="例：渋谷区道玄坂1-2-3"
                    />
                  </div>
                </div>

                {/* Employment Type & Hourly Rate */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      雇用形態
                    </label>
                    <select
                      name="employment_type"
                      value={formData.employment_type}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#00CED1] focus:ring-2 focus:ring-[#00CED1]/20 transition-colors"
                    >
                      <option value="full-time">正社員</option>
                      <option value="part-time">パート</option>
                      <option value="contract">契約</option>
                      <option value="temporary">派遣</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      時給（円）
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        name="hourly_rate"
                        value={formData.hourly_rate}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 ${
                          errors.hourly_rate ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#00CED1]'
                        } focus:ring-2 focus:ring-[#00CED1]/20 transition-colors`}
                        placeholder="1500"
                        min="0"
                      />
                    </div>
                    {errors.hourly_rate && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.hourly_rate}
                      </p>
                    )}
                  </div>
                </div>

                {/* Work Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    募集開始日
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      name="starts_at"
                      value={formData.starts_at}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 ${
                        errors.starts_at ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#00CED1]'
                      } focus:ring-2 focus:ring-[#00CED1]/20 transition-colors`}
                    />
                  </div>
                  {errors.starts_at && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.starts_at}
                    </p>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    タグ（カンマ区切り）
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#00CED1] focus:ring-2 focus:ring-[#00CED1]/20 transition-colors"
                      placeholder="例：リモート可, 経験者歓迎, 即日勤務可"
                    />
                  </div>
                  {tagsArray.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-3">
                      {tagsArray.map((tag, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 text-sm bg-[#00CED1]/10 text-[#00CED1] rounded-full font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    募集終了日（任意）
                  </label>
                  <input
                    type="date"
                    name="ends_at"
                    value={formData.ends_at}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#00CED1] focus:ring-2 focus:ring-[#00CED1]/20 transition-colors"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => handleSubmit(e as any, true)}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saveAsDraft && isSubmitting ? '保存中...' : '下書き保存'}
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {!saveAsDraft && isSubmitting ? '公開中...' : '求人を公開'}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </div>

      <BottomNav
        items={[
          { label: '求人管理', path: '/jobs/manage', icon: Briefcase },
          { label: '新規作成', path: '/jobs/new', icon: Plus },
          { label: 'Now', path: '/dashboard', icon: Flame },
          { label: 'メッセージ', path: '/messages', icon: MessageCircle },
          { label: 'マイページ', path: '/profile', icon: UserCircle },
        ]}
      />
    </div>
  );
}
