import { BottomNav } from './BottomNav';
import { Sparkles, Zap, Flame, Bell, UserCircle } from 'lucide-react';
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
        { label: 'さがす', path: '/jobs/manage', icon: Sparkles },
        { label: 'はたらく', path: '/jobs/new', icon: Zap },
        { label: 'Now', path: '/dashboard', icon: Flame },
        { label: 'メッセージ', path: '/notifications', icon: Bell },
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
