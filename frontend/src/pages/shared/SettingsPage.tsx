import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { slideUp, fadeIn } from '../../utils/animations';
import { Settings, Bell, Lock, User, Mail, Save } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    jobAlerts: true,
    applicationUpdates: true,
    paymentAlerts: true,
    marketingEmails: false,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    console.log('Saving settings:', settings);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-gray-900 pb-20">
      <div className="container mx-auto px-4 py-8">
        <motion.div {...fadeIn} className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-white" />
            <h1 className="text-3xl font-bold text-white">設定</h1>
          </div>
          <p className="text-white/80">アカウントと通知の設定を管理</p>
        </motion.div>

        <div className="space-y-4">
          <motion.div {...slideUp}>
            <Card>
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Bell className="w-6 h-6 mr-2 text-primary" />
                通知設定
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">メール通知</p>
                    <p className="text-sm text-gray-600">重要な更新をメールで受け取る</p>
                  </div>
                  <button
                    onClick={() => handleToggle('emailNotifications')}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      settings.emailNotifications ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        settings.emailNotifications ? 'translate-x-6' : ''
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">プッシュ通知</p>
                    <p className="text-sm text-gray-600">ブラウザ通知を有効にする</p>
                  </div>
                  <button
                    onClick={() => handleToggle('pushNotifications')}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      settings.pushNotifications ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        settings.pushNotifications ? 'translate-x-6' : ''
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">求人アラート</p>
                    <p className="text-sm text-gray-600">新しい求人情報を受け取る</p>
                  </div>
                  <button
                    onClick={() => handleToggle('jobAlerts')}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      settings.jobAlerts ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        settings.jobAlerts ? 'translate-x-6' : ''
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">応募状況の更新</p>
                    <p className="text-sm text-gray-600">応募の進捗を通知する</p>
                  </div>
                  <button
                    onClick={() => handleToggle('applicationUpdates')}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      settings.applicationUpdates ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        settings.applicationUpdates ? 'translate-x-6' : ''
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">決済通知</p>
                    <p className="text-sm text-gray-600">支払いや入金を通知する</p>
                  </div>
                  <button
                    onClick={() => handleToggle('paymentAlerts')}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      settings.paymentAlerts ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        settings.paymentAlerts ? 'translate-x-6' : ''
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">マーケティングメール</p>
                    <p className="text-sm text-gray-600">プロモーションやお知らせを受け取る</p>
                  </div>
                  <button
                    onClick={() => handleToggle('marketingEmails')}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      settings.marketingEmails ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        settings.marketingEmails ? 'translate-x-6' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div {...slideUp} style={{ animationDelay: '0.1s' }}>
            <Card>
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <User className="w-6 h-6 mr-2 text-primary" />
                アカウント設定
              </h3>

              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="w-5 h-5 mr-2" />
                  メールアドレスを変更
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Lock className="w-5 h-5 mr-2" />
                  パスワードを変更
                </Button>
              </div>
            </Card>
          </motion.div>

          <motion.div {...slideUp} style={{ animationDelay: '0.2s' }}>
            <Button
              variant="primary"
              onClick={handleSave}
              className="w-full"
            >
              <Save className="w-5 h-5 mr-2" />
              設定を保存
            </Button>
          </motion.div>

          <motion.div {...slideUp} style={{ animationDelay: '0.3s' }}>
            <Card className="border-red-200 bg-red-50">
              <h3 className="text-lg font-bold text-red-900 mb-2">危険な操作</h3>
              <p className="text-sm text-red-700 mb-4">
                アカウントを削除すると、すべてのデータが永久に失われます。この操作は取り消せません。
              </p>
              <Button variant="danger" className="w-full">
                アカウントを削除
              </Button>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
