import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { authAPI, paymentsAPI } from '../../lib/api';
import { slideUp, fadeIn } from '../../utils/animations';
import { Home, Search, FileText, User, Mail, Calendar, Shield, CreditCard, ExternalLink } from 'lucide-react';
import { BottomNav } from '../../components/layout/BottomNav';
import { useState } from 'react';

export default function ProfilePage() {
  const [connectingStripe, setConnectingStripe] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: authAPI.me,
  });

  const { data: payments } = useQuery({
    queryKey: ['payments'],
    queryFn: () => paymentsAPI.list(),
  });

  const handleConnectStripe = async () => {
    if (!user?.email) return;
    
    setConnectingStripe(true);
    try {
      const result = await paymentsAPI.createConnectAccount(user.email);
      if (result.url) {
        window.open(result.url, '_blank');
      }
    } catch (error) {
      console.error('Stripe接続エラー:', error);
    } finally {
      setConnectingStripe(false);
    }
  };

  const totalEarnings = payments?.items
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-gray-900 pb-20">
      <div className="container mx-auto px-4 py-8">
        <motion.div {...fadeIn}>
          <h1 className="text-3xl font-bold mb-2 text-white">プロフィール</h1>
          <p className="text-white/80 mb-6">あなたのアカウント情報</p>
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
                      ワーカー
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
                  <CreditCard className="w-6 h-6 mr-2 text-primary" />
                  決済情報
                </h3>

                <div className="bg-gradient-to-r from-primary/10 to-primary-dark/10 rounded-lg p-6 mb-4">
                  <div className="text-sm text-gray-600 mb-1">累計収益</div>
                  <div className="text-3xl font-bold text-primary">
                    ¥{totalEarnings.toLocaleString()}
                  </div>
                </div>

                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleConnectStripe}
                  disabled={connectingStripe}
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  {connectingStripe ? 'Stripe接続中...' : 'Stripe Connectアカウントを設定'}
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  報酬を受け取るにはStripe Connectアカウントが必要です
                </p>
              </Card>
            </motion.div>

            <motion.div {...slideUp} style={{ animationDelay: '0.2s' }}>
              <Card>
                <h3 className="text-xl font-bold text-gray-900 mb-4">アカウント設定</h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    パスワード変更
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    通知設定
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    プライバシー設定
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
          { label: 'ホーム', path: '/dashboard', icon: Home },
          { label: '求人検索', path: '/jobs', icon: Search },
          { label: '応募履歴', path: '/applications', icon: FileText },
          { label: 'プロフィール', path: '/profile', icon: User },
        ]}
      />
    </div>
  );
}
