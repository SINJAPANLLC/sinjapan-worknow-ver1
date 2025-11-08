import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  EnvelopeIcon, 
  CalendarIcon,
  CameraIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuthStore } from '../stores/authStore';
import { authAPI, filesAPI, phoneAPI } from '../lib/api';
import { slideUp } from '../utils/animations';
import { Sparkles, Zap, Flame, Bell, UserCircle } from 'lucide-react';
import { BottomNav } from '../components/layout/BottomNav';

export function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [formData, setFormData] = useState<{
    full_name: string;
    phone: string;
    date_of_birth: string;
    gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | '';
    address: string;
    work_style: string;
    affiliation: string;
    preferred_prefecture: string;
    latitude?: number;
    longitude?: number;
  }>({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    date_of_birth: user?.date_of_birth || '',
    gender: user?.gender || '',
    address: user?.address || '',
    work_style: user?.work_style || '',
    affiliation: user?.affiliation || '',
    preferred_prefecture: user?.preferred_prefecture || '',
    latitude: user?.latitude,
    longitude: user?.longitude,
  });

  if (!user) return null;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await filesAPI.uploadAvatar(file);
      setUser(result.user);
    } catch (error) {
      console.error('Avatar upload failed:', error);
      alert('プロフィール写真のアップロードに失敗しました');
    } finally {
      setIsUploading(false);
    }
  };

  const handleIdDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await filesAPI.uploadIdDocument(file);
      setUser(result.user);
      alert('本人確認書類をアップロードしました');
    } catch (error) {
      console.error('ID document upload failed:', error);
      alert('本人確認書類のアップロードに失敗しました');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      const updateData = {
        ...formData,
        gender: formData.gender || undefined,
      };
      const updated = await authAPI.updateProfile(updateData);
      setUser(updated);
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update failed:', error);
      alert('プロフィールの更新に失敗しました');
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: user.full_name,
      phone: user.phone || '',
      date_of_birth: user.date_of_birth || '',
      gender: user.gender || '',
      address: user.address || '',
      work_style: user.work_style || '',
      affiliation: user.affiliation || '',
      preferred_prefecture: user.preferred_prefecture || '',
      latitude: user.latitude,
      longitude: user.longitude,
    });
    setIsEditing(false);
    setCodeSent(false);
    setVerificationCode('');
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('お使いのブラウザは位置情報をサポートしていません');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        alert('現在地を取得しました');
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('位置情報の取得に失敗しました');
      }
    );
  };

  const handleSendCode = async () => {
    if (!formData.phone) {
      alert('電話番号を入力してください');
      return;
    }

    setIsVerifying(true);
    try {
      const result = await phoneAPI.sendVerificationCode(formData.phone);
      setCodeSent(true);
      alert(`認証コードを送信しました（開発モード: ${result.code}）`);
    } catch (error) {
      console.error('Failed to send verification code:', error);
      alert('認証コードの送信に失敗しました');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      alert('認証コードを入力してください');
      return;
    }

    setIsVerifying(true);
    try {
      const updated = await phoneAPI.verifyCode(formData.phone, verificationCode);
      setUser(updated);
      setCodeSent(false);
      setVerificationCode('');
      alert('電話番号を認証しました');
    } catch (error) {
      console.error('Failed to verify code:', error);
      alert('認証コードが正しくありません');
    } finally {
      setIsVerifying(false);
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'worker':
        return 'ワーカー';
      case 'company':
        return '企業';
      case 'admin':
        return '管理者';
      default:
        return role;
    }
  };

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case 'male':
        return '男性';
      case 'female':
        return '女性';
      case 'other':
        return 'その他';
      case 'prefer_not_to_say':
        return '回答しない';
      default:
        return '';
    }
  };

  const PREFECTURES = [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
    '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
    '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
    '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00CED1] via-[#00A5A8] to-[#007E7A] p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div
          variants={slideUp}
          initial="initial"
          animate="animate"
        >
          <Card className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#00CED1] to-[#007E7A] flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                  ) : (
                    user.full_name.charAt(0).toUpperCase()
                  )}
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50"
                >
                  <CameraIcon className="w-4 h-4 text-gray-600" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={isUploading}
                />
              </div>

              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">{user.full_name}</h1>
                <Badge variant="primary" className="mt-2">
                  {getRoleName(user.role)}
                </Badge>
              </div>

              <div className="w-full space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <EnvelopeIcon className="w-5 h-5 mr-2" />
                  {user.email}
                </div>
                <div className="flex items-center text-gray-600">
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  登録日: {new Date(user.created_at).toLocaleDateString('ja-JP')}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {user.role === 'worker' && (
          <motion.div
            variants={slideUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">決済情報</h2>
              <div className="space-y-4">
                <div className="text-gray-600">
                  <p className="text-sm">累計収益</p>
                  <p className="text-3xl font-bold text-[#00CED1]">¥0</p>
                </div>
                <Button variant="primary" className="w-full">
                  Stripe Connectアカウントを設定
                </Button>
                <p className="text-xs text-gray-500">
                  報酬を受け取るにはStripe Connectアカウントが必要です
                </p>
              </div>
            </Card>
          </motion.div>
        )}

        <motion.div
          variants={slideUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">プロフィール情報</h2>
              {!isEditing && (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  編集
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  氏名
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00CED1] focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{user.full_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  電話番号
                  {user.phone_verified && (
                    <CheckCircleIcon className="w-4 h-4 text-green-500 inline ml-1" />
                  )}
                </label>
                {isEditing ? (
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00CED1] focus:border-transparent"
                        placeholder="080-1234-5678"
                        disabled={codeSent || isVerifying}
                      />
                      {formData.phone && formData.phone !== user.phone && !codeSent && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleSendCode}
                          disabled={isVerifying}
                        >
                          認証コード送信
                        </Button>
                      )}
                    </div>
                    {codeSent && (
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00CED1] focus:border-transparent"
                          placeholder="6桁の認証コード"
                          maxLength={6}
                        />
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleVerifyCode}
                          disabled={isVerifying}
                        >
                          認証
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-900">{user.phone || '未設定'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  生年月日
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00CED1] focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">
                    {user.date_of_birth
                      ? new Date(user.date_of_birth).toLocaleDateString('ja-JP')
                      : '未設定'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  性別
                </label>
                {isEditing ? (
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as '' | 'male' | 'female' | 'other' | 'prefer_not_to_say' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00CED1] focus:border-transparent"
                  >
                    <option value="">選択してください</option>
                    <option value="male">男性</option>
                    <option value="female">女性</option>
                    <option value="other">その他</option>
                    <option value="prefer_not_to_say">回答しない</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{getGenderLabel(user.gender || '') || '未設定'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  住所
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00CED1] focus:border-transparent"
                    rows={2}
                    placeholder="東京都渋谷区..."
                  />
                ) : (
                  <p className="text-gray-900">{user.address || '未設定'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  希望勤務地（都道府県）
                </label>
                {isEditing ? (
                  <select
                    value={formData.preferred_prefecture}
                    onChange={(e) => setFormData({ ...formData, preferred_prefecture: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00CED1] focus:border-transparent"
                  >
                    <option value="">選択してください</option>
                    {PREFECTURES.map((pref) => (
                      <option key={pref} value={pref}>
                        {pref}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900">{user.preferred_prefecture || '未設定'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  現在地
                </label>
                {isEditing ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {formData.latitude && formData.longitude ? (
                        <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-600">
                          <MapPinIcon className="w-4 h-4 inline mr-1" />
                          緯度: {formData.latitude.toFixed(6)}, 経度: {formData.longitude.toFixed(6)}
                        </div>
                      ) : (
                        <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-500">
                          位置情報が設定されていません
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleGetLocation}
                      >
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        現在地取得
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      位置情報を使用して、近くの仕事を表示できます
                    </p>
                  </div>
                ) : user.latitude && user.longitude ? (
                  <p className="text-gray-900">
                    <MapPinIcon className="w-4 h-4 inline mr-1" />
                    設定済み（緯度: {user.latitude.toFixed(4)}, 経度: {user.longitude.toFixed(4)}）
                  </p>
                ) : (
                  <p className="text-gray-900">未設定</p>
                )}
              </div>

              {user.role === 'worker' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      働き方
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.work_style}
                        onChange={(e) => setFormData({ ...formData, work_style: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00CED1] focus:border-transparent"
                        placeholder="フルタイム、パートタイムなど"
                      />
                    ) : (
                      <p className="text-gray-900">{user.work_style || '未設定'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      所属
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.affiliation}
                        onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00CED1] focus:border-transparent"
                        placeholder="フリーランス、学生など"
                      />
                    ) : (
                      <p className="text-gray-900">{user.affiliation || '未設定'}</p>
                    )}
                  </div>
                </>
              )}

              {isEditing && (
                <div className="flex space-x-3 pt-4">
                  <Button variant="primary" onClick={handleSave} className="flex-1">
                    保存
                  </Button>
                  <Button variant="outline" onClick={handleCancel} className="flex-1">
                    キャンセル
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {user.role === 'worker' && (
          <motion.div
            variants={slideUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">本人確認</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">本人確認書類</p>
                    <p className="text-sm text-gray-600">
                      {user.id_document_url ? 'アップロード済み' : '未アップロード'}
                    </p>
                  </div>
                  {user.id_document_url ? (
                    <CheckCircleIcon className="w-6 h-6 text-green-500" />
                  ) : (
                    <XCircleIcon className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <label htmlFor="id-document-upload">
                  <Button variant="outline" className="w-full" disabled={isUploading}>
                    {user.id_document_url ? '書類を再アップロード' : '書類をアップロード'}
                  </Button>
                </label>
                <input
                  id="id-document-upload"
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={handleIdDocumentUpload}
                  disabled={isUploading}
                />
                <p className="text-xs text-gray-500">
                  運転免許証、パスポート、マイナンバーカードなどの本人確認書類をアップロードしてください
                </p>
              </div>
            </Card>
          </motion.div>
        )}

        <motion.div
          variants={slideUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">アカウント設定</h2>
            <Button variant="outline" className="w-full">
              パスワード変更
            </Button>
          </Card>
        </motion.div>
      </div>

      <BottomNav
        items={[
          { label: 'さがす', path: user.role === 'worker' ? '/jobs' : user.role === 'company' ? '/jobs/manage' : '/admin/users', icon: Sparkles },
          { label: 'はたらく', path: user.role === 'worker' ? '/applications' : user.role === 'company' ? '/jobs/new' : '/admin/jobs', icon: Zap },
          { label: 'Now', path: '/dashboard', icon: Flame },
          { label: 'メッセージ', path: '/notifications', icon: Bell },
          { label: 'マイページ', path: user.role === 'admin' ? '/admin/stats' : '/profile', icon: UserCircle },
        ]}
      />
    </div>
  );
}
