import { useAuthStore } from '../../stores/authStore';

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">ダッシュボード</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-lg">
          ようこそ、<span className="font-semibold">{user?.full_name || user?.email}</span>さん！
        </p>
        <p className="text-gray-600 mt-2">
          ロール: <span className="capitalize">{user?.role}</span>
        </p>
      </div>
    </div>
  );
}
