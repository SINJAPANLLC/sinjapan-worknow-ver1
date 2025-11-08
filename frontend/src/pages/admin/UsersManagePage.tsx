import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { slideUp, fadeIn } from '../../utils/animations';
import { Sparkles, Zap, Flame, MessageCircle, UserCircle, Search, Edit, Trash2, Shield, CheckCircle, XCircle } from 'lucide-react';
import { BottomNav } from '../../components/layout/BottomNav';

export default function UsersManagePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');

  const mockUsers = [
    { id: '1', email: 'worker1@example.com', full_name: '山田太郎', role: 'worker', is_active: true, created_at: '2025-01-01' },
    { id: '2', email: 'company1@example.com', full_name: '株式会社ABC', role: 'company', is_active: true, created_at: '2025-01-02' },
    { id: '3', email: 'worker2@example.com', full_name: '佐藤花子', role: 'worker', is_active: false, created_at: '2025-01-03' },
  ];

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'worker':
        return { variant: 'info' as const, text: 'ワーカー' };
      case 'company':
        return { variant: 'success' as const, text: '企業' };
      case 'admin':
        return { variant: 'warning' as const, text: '管理者' };
      default:
        return { variant: 'neutral' as const, text: role };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-gray-900 pb-20">
      <div className="container mx-auto px-4 py-8">
        <motion.div {...fadeIn}>
          <h1 className="text-3xl font-bold mb-2 text-white">ユーザー管理</h1>
          <p className="text-white/80 mb-6">登録ユーザーの管理と監視</p>
        </motion.div>

        <motion.div {...slideUp} className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="名前またはメールアドレスで検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border-0 shadow-lg focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {['', 'worker', 'company', 'admin'].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  roleFilter === role
                    ? 'bg-white text-primary shadow-lg'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {role === '' ? '全て' : role === 'worker' ? 'ワーカー' : role === 'company' ? '企業' : '管理者'}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="space-y-4">
          {filteredUsers.map((user, index) => {
            const roleInfo = getRoleBadge(user.role);

            return (
              <motion.div key={user.id} {...slideUp} style={{ animationDelay: `${index * 0.1}s` }}>
                <Card>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start flex-1">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-lg font-bold mr-4">
                        {user.full_name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 mb-1">{user.full_name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{user.email}</p>
                        <div className="flex gap-2">
                          <Badge variant={roleInfo.variant}>
                            <Shield className="w-3 h-3 mr-1" />
                            {roleInfo.text}
                          </Badge>
                          <Badge variant={user.is_active ? 'success' : 'danger'}>
                            {user.is_active ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                有効
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 mr-1" />
                                無効
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <span className="text-sm text-gray-500">
                      登録日: {new Date(user.created_at).toLocaleDateString('ja-JP')}
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-1" />
                        編集
                      </Button>
                      <Button variant="danger" size="sm">
                        <Trash2 className="w-4 h-4 mr-1" />
                        削除
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filteredUsers.length === 0 && (
          <motion.div {...fadeIn} className="text-center py-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto">
              <Users className="w-16 h-16 text-white/60 mx-auto mb-4" />
              <p className="text-white text-lg mb-2">ユーザーが見つかりませんでした</p>
              <p className="text-white/70 text-sm">検索条件を変更してみてください</p>
            </div>
          </motion.div>
        )}
      </div>

      <BottomNav
        items={[
          { label: 'さがす', path: '/admin/users', icon: Sparkles },
          { label: 'はたらく', path: '/admin/jobs', icon: Zap },
          { label: 'Now', path: '/dashboard', icon: Flame },
          { label: 'メッセージ', path: '/messages', icon: MessageCircle },
          { label: 'マイページ', path: '/admin/stats', icon: UserCircle },
        ]}
      />
    </div>
  );
}
