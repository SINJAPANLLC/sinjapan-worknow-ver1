import { useQuery } from '@tanstack/react-query';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useAuthStore } from '../stores/authStore';
import { BottomNav } from '../components/layout/BottomNav';
import { AlertTriangle, XCircle, Ban, Sparkles, Zap, Flame, MessageCircle, UserCircle } from 'lucide-react';
import { penaltiesAPI } from '../lib/api';

interface Penalty {
  id: string;
  type: 'warning' | 'suspension' | 'ban';
  reason: string;
  description?: string;
  penalty_points: number;
  issued_at: string;
  expires_at?: string;
  is_active: boolean;
}

const penaltyIcons = {
  warning: AlertTriangle,
  suspension: XCircle,
  ban: Ban,
};

const penaltyColors = {
  warning: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  suspension: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  ban: 'bg-red-500/10 text-red-600 border-red-500/20',
};

export function PenaltiesPage() {
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['penalties'],
    queryFn: () => penaltiesAPI.list(),
  });

  const penalties: Penalty[] = data?.items || [];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00CED1] via-[#00CED1]/80 to-[#009999] pb-28">
      <div className="container mx-auto px-4 pt-24 max-w-4xl">
        <h1 className="text-3xl font-bold text-white mb-6 break-keep">ペナルティ履歴</h1>

        {isLoading ? (
          <Card className="p-8">
            <p className="text-center text-gray-500">読み込み中...</p>
          </Card>
        ) : penalties.length === 0 ? (
          <Card className="p-8">
            <p className="text-center text-gray-500">ペナルティはありません</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {penalties.map((penalty) => {
              const Icon = penaltyIcons[penalty.type];
              return (
                <Card key={penalty.id} className={`border-2 ${penaltyColors[penalty.type]}`}>
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <Icon className="w-8 h-8 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant={penalty.is_active ? 'danger' : 'neutral'}>
                            {penalty.is_active ? '有効' : '無効'}
                          </Badge>
                          <Badge variant="warning">{penalty.penalty_points}ポイント</Badge>
                        </div>
                        <h3 className="text-lg font-semibold mb-2 break-keep">{penalty.reason}</h3>
                        {penalty.description && (
                          <p className="text-gray-700 mb-4 break-keep">{penalty.description}</p>
                        )}
                        <div className="text-sm text-gray-500 space-y-1">
                          <p>発行日時: {new Date(penalty.issued_at).toLocaleString('ja-JP')}</p>
                          {penalty.expires_at && (
                            <p>有効期限: {new Date(penalty.expires_at).toLocaleString('ja-JP')}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
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
