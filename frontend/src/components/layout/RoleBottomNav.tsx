import { BottomNav } from './BottomNav';
import { Sparkles, Zap, Flame, Bell, UserCircle, Briefcase, Plus, Home, MessageCircle, Users, BarChart3, Settings } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

export function RoleBottomNav() {
  const { user } = useAuthStore();

  if (!user) return null;

  if (user.role === 'worker') {
    return (
      <BottomNav items={[
        { label: 'さがす', path: '/jobs', icon: Sparkles },
        { label: 'はたらく', path: '/applications', icon: Zap },
        { label: 'Now', path: '/dashboard', icon: Flame },
        { label: 'メッセージ', path: '/notifications', icon: Bell },
        { label: 'マイページ', path: '/profile', icon: UserCircle },
      ]} />
    );
  }

  if (user.role === 'company') {
    return (
      <BottomNav items={[
        { label: 'ホーム', path: '/dashboard', icon: Home },
        { label: '求人管理', path: '/jobs/manage', icon: Briefcase },
        { label: '求人作成', path: '/jobs/new', icon: Plus },
        { label: 'メッセージ', path: '/client/messages', icon: MessageCircle },
        { label: 'マイページ', path: '/profile', icon: UserCircle },
      ]} />
    );
  }

  if (user.role === 'admin') {
    return (
      <BottomNav items={[
        { label: 'ユーザー', path: '/admin/users', icon: Users },
        { label: '求人', path: '/admin/jobs', icon: Briefcase },
        { label: 'ホーム', path: '/dashboard', icon: Home },
        { label: '統計', path: '/admin/stats', icon: BarChart3 },
        { label: '設定', path: '/profile', icon: Settings },
      ]} />
    );
  }

  return null;
}
