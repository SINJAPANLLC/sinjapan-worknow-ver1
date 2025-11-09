import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { authAPI, paymentsAPI, reviewsAPI, clientSettingsAPI } from '../../lib/api';
import { slideUp, fadeIn } from '../../utils/animations';
import { Mail, Calendar, Shield, CreditCard, TrendingUp, Star, X, Building2, Phone, MapPin, Lock, Eye, EyeOff, Bell, FileText } from 'lucide-react';
import { RoleBottomNav } from '../../components/layout/RoleBottomNav';

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    address: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

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

  const updateProfileMutation = useMutation({
    mutationFn: authAPI.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
      setShowEditModal(false);
      alert('企業情報を更新しました');
    },
    onError: (error: any) => {
      alert(error.response?.data?.detail || '更新に失敗しました');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: authAPI.changePassword,
    onSuccess: () => {
      setShowPasswordModal(false);
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      alert('パスワードを変更しました');
    },
    onError: (error: any) => {
      alert(error.response?.data?.detail || 'パスワード変更に失敗しました');
    },
  });

  const { data: notificationPreferences } = useQuery({
    queryKey: ['client-settings', 'notifications'],
    queryFn: clientSettingsAPI.getNotificationPreferences,
    enabled: !!user && user.role === 'company',
  });

  const { data: invoiceSettings } = useQuery({
    queryKey: ['client-settings', 'invoice'],
    queryFn: clientSettingsAPI.getInvoiceSettings,
    enabled: !!user && user.role === 'company',
  });

  const updateNotificationsMutation = useMutation({
    mutationFn: clientSettingsAPI.updateNotificationPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-settings', 'notifications'] });
      setShowNotificationModal(false);
      alert('通知設定を保存しました');
    },
    onError: (error: any) => {
      alert(error.message || '設定の保存に失敗しました');
    },
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: clientSettingsAPI.updateInvoiceSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-settings', 'invoice'] });
      setShowInvoiceModal(false);
      alert('請求書設定を保存しました');
    },
    onError: (error: any) => {
      alert(error.message || '設定の保存に失敗しました');
    },
  });

  const [notificationForm, setNotificationForm] = useState({
    push_enabled: true,
    email_enabled: true,
    job_applications: true,
    messages: true,
    system_notifications: true,
  });

  const [invoiceForm, setInvoiceForm] = useState({
    company_name: '',
    company_address: '',
    company_phone: '',
    tax_id: '',
  });

  const handleOpenEditModal = () => {
    if (user) {
      setEditForm({
        full_name: user.full_name || '',
        phone: user.phone || '',
        address: user.address || '',
      });
    }
    setShowEditModal(true);
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(editForm);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      alert('新しいパスワードが一致しません');
      return;
    }
    
    if (passwordForm.new_password.length < 8) {
      alert('パスワードは8文字以上である必要があります');
      return;
    }
    
    if (!passwordForm.current_password) {
      alert('現在のパスワードを入力してください');
      return;
    }

    changePasswordMutation.mutate({
      current_password: passwordForm.current_password,
      new_password: passwordForm.new_password,
    });
  };

  const handleOpenNotificationModal = () => {
    if (notificationPreferences) {
      setNotificationForm({
        push_enabled: notificationPreferences.push_enabled,
        email_enabled: notificationPreferences.email_enabled,
        job_applications: notificationPreferences.job_applications,
        messages: notificationPreferences.messages,
        system_notifications: notificationPreferences.system_notifications,
      });
    }
    setShowNotificationModal(true);
  };

  const handleOpenInvoiceModal = () => {
    if (invoiceSettings) {
      setInvoiceForm({
        company_name: invoiceSettings.company_name || '',
        company_address: invoiceSettings.company_address || '',
        company_phone: invoiceSettings.company_phone || '',
        tax_id: invoiceSettings.tax_id || '',
      });
    }
    setShowInvoiceModal(true);
  };

  const handleSaveNotificationSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateNotificationsMutation.mutate(notificationForm);
  };

  const handleSaveInvoiceSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateInvoiceMutation.mutate(invoiceForm);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-gray-900 pt-20 pb-24">
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
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={handleOpenEditModal}
                  >
                    <Building2 className="w-4 h-4 mr-2" />
                    企業情報を編集
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setShowPasswordModal(true)}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    パスワード変更
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={handleOpenNotificationModal}
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    通知設定
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={handleOpenInvoiceModal}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    請求書設定
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        ) : null}
      </div>

      <RoleBottomNav />

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
                <h3 className="text-xl font-bold text-gray-900">企業情報を編集</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    企業名 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={editForm.full_name}
                      onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    電話番号
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="090-1234-5678"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    住所
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <textarea
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                      rows={3}
                      placeholder="東京都渋谷区..."
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowEditModal(false)}
                  >
                    キャンセル
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? '更新中...' : '保存'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
                <h3 className="text-xl font-bold text-gray-900">パスワード変更</h3>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    現在のパスワード <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordForm.current_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    新しいパスワード <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordForm.new_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">8文字以上</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    新しいパスワード（確認） <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={passwordForm.confirm_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
                    }}
                  >
                    キャンセル
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                    disabled={changePasswordMutation.isPending}
                  >
                    {changePasswordMutation.isPending ? '変更中...' : '変更'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Settings Modal */}
      <AnimatePresence>
        {showNotificationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setShowNotificationModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
                <h3 className="text-xl font-bold text-gray-900">通知設定</h3>
                <button
                  onClick={() => setShowNotificationModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form className="p-6 space-y-6" onSubmit={handleSaveNotificationSettings}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">プッシュ通知</h4>
                      <p className="text-xs text-gray-500">モバイルデバイスに通知を送信</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotificationForm({ ...notificationForm, push_enabled: !notificationForm.push_enabled })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notificationForm.push_enabled ? 'bg-primary' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notificationForm.push_enabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">メール通知</h4>
                      <p className="text-xs text-gray-500">メールで通知を受け取る</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotificationForm({ ...notificationForm, email_enabled: !notificationForm.email_enabled })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notificationForm.email_enabled ? 'bg-primary' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notificationForm.email_enabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">通知タイプ</h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={notificationForm.job_applications}
                        onChange={(e) => setNotificationForm({ ...notificationForm, job_applications: e.target.checked })}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <span className="ml-3 text-sm text-gray-700">求人応募通知</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={notificationForm.messages}
                        onChange={(e) => setNotificationForm({ ...notificationForm, messages: e.target.checked })}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <span className="ml-3 text-sm text-gray-700">メッセージ通知</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={notificationForm.system_notifications}
                        onChange={(e) => setNotificationForm({ ...notificationForm, system_notifications: e.target.checked })}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <span className="ml-3 text-sm text-gray-700">システム通知</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowNotificationModal(false)}
                  >
                    キャンセル
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                    disabled={updateNotificationsMutation.isPending}
                  >
                    {updateNotificationsMutation.isPending ? '保存中...' : '保存'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invoice Settings Modal */}
      <AnimatePresence>
        {showInvoiceModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setShowInvoiceModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
                <h3 className="text-xl font-bold text-gray-900">請求書設定</h3>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form className="p-6 space-y-4" onSubmit={handleSaveInvoiceSettings}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    会社名
                  </label>
                  <input
                    type="text"
                    value={invoiceForm.company_name}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, company_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="株式会社〇〇"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    会社住所
                  </label>
                  <textarea
                    value={invoiceForm.company_address}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, company_address: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="〒000-0000 東京都..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    電話番号
                  </label>
                  <input
                    type="tel"
                    value={invoiceForm.company_phone}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, company_phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="03-1234-5678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    法人番号
                  </label>
                  <input
                    type="text"
                    value={invoiceForm.tax_id}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, tax_id: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="1234567890123"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowInvoiceModal(false)}
                  >
                    キャンセル
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                    disabled={updateInvoiceMutation.isPending}
                  >
                    {updateInvoiceMutation.isPending ? '保存中...' : '保存'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
