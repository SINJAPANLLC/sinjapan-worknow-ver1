import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { slideUp, fadeIn } from '../../utils/animations';
import {
  Search,
  Edit,
  Trash2,
  Shield,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Mail,
  Calendar,
  User
} from 'lucide-react';
import { RoleBottomNav } from '../../components/layout/RoleBottomNav';
import { adminAPI } from '../../lib/api';

export default function UsersManagePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const { data: allUsers = [], isLoading: isLoadingAll } = useQuery({
    queryKey: ['admin', 'users', 'all'],
    queryFn: () => adminAPI.listUsers({ limit: 500 }),
  });

  const { data: filteredByRole = [], isLoading: isLoadingFiltered } = useQuery({
    queryKey: ['admin', 'users', roleFilter],
    queryFn: () => adminAPI.listUsers({ 
      role: roleFilter === 'all' ? undefined : roleFilter,
      limit: 500 
    }),
    enabled: roleFilter !== 'all',
  });

  const users = roleFilter === 'all' ? allUsers : filteredByRole;
  const isLoading = roleFilter === 'all' ? isLoadingAll : isLoadingFiltered;

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [users, searchQuery]);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'worker':
        return { variant: 'primary' as const, text: 'ワーカー' };
      case 'company':
        return { variant: 'success' as const, text: '企業' };
      case 'admin':
        return { variant: 'warning' as const, text: '管理者' };
      default:
        return { variant: 'neutral' as const, text: role };
    }
  };

  const roleStats = useMemo(() => ({
    all: allUsers.length,
    worker: allUsers.filter(u => u.role === 'worker').length,
    company: allUsers.filter(u => u.role === 'company').length,
    admin: allUsers.filter(u => u.role === 'admin').length,
  }), [allUsers]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00CED1] via-[#00B4B4] to-[#009999] pb-24">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div {...fadeIn} className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-white">ユーザー管理</h1>
            <p className="text-white/80 mt-1">登録ユーザーの管理と監視</p>
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div {...slideUp} className="space-y-4 mb-6">
          <Card className="bg-white/95 backdrop-blur-sm p-4">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="名前またはメールアドレスで検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-none outline-none bg-transparent text-gray-900 placeholder-gray-400"
              />
            </div>
          </Card>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { key: 'all', label: `全て (${roleStats.all})` },
              { key: 'worker', label: `ワーカー (${roleStats.worker})` },
              { key: 'company', label: `企業 (${roleStats.company})` },
              { key: 'admin', label: `管理者 (${roleStats.admin})` },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setRoleFilter(key)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all font-medium ${
                  roleFilter === key
                    ? 'bg-white text-primary shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Users List */}
        {isLoading ? (
          <Card className="bg-white/95 backdrop-blur-sm p-12">
            <div className="text-center">
              <div className="inline-block w-12 h-12 border-4 border-gray-300 border-t-primary rounded-full animate-spin mb-4" />
              <p className="text-gray-500">読み込み中...</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
          {filteredUsers.map((user, index) => {
            const roleInfo = getRoleBadge(user.role);

            return (
              <motion.div
                key={user.id}
                {...slideUp}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="bg-white/95 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-xl font-bold">
                          {user.full_name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900 mb-2">{user.full_name}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <Mail className="w-4 h-4" />
                            <span>{user.email}</span>
                          </div>
                          <div className="flex gap-2 flex-wrap">
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
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>登録日: {new Date(user.created_at).toLocaleDateString('ja-JP')}</span>
                      </div>
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
                  </div>
                </Card>
              </motion.div>
            );
          })}

          {!isLoading && filteredUsers.length === 0 && (
            <Card className="bg-white/95 backdrop-blur-sm p-12">
              <div className="text-center text-gray-500">
                <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>該当するユーザーが見つかりませんでした</p>
              </div>
            </Card>
          )}
          </div>
        )}
      </div>

      <RoleBottomNav />
    </div>
  );
}
