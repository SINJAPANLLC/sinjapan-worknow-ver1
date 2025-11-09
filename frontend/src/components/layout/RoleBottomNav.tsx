import { BottomNav } from './BottomNav';
import { Sparkles, Zap, Flame, Bell, UserCircle, Briefcase, Plus, Home, MessageCircle } from 'lucide-react';
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
        { label: 'さがす', path: '/admin/users', icon: Sparkles },
        { label: 'はたらく', path: '/admin/jobs', icon: Zap },
        { label: 'Now', path: '/dashboard', icon: Flame },
        { label: 'メッセージ', path: '/notifications', icon: Bell },
        { label: 'マイページ', path: '/admin/stats', icon: UserCircle },
      ]} />
    );
  }

  return null;
}
