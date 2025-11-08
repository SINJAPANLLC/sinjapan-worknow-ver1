import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { slideUp, staggerChildren } from '../../utils/animations';

export default function WorkerRegistrationPage() {
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    if (formData.password.length < 8) {
      setError('パスワードは8文字以上で入力してください');
      return;
    }

    setLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
        role: 'worker',
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || '登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-12 bg-gradient-to-br from-primary via-primary-dark to-secondary">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
      
      <motion.div
        className="relative z-10 w-full max-w-md px-4"
        variants={staggerChildren}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={slideUp}>
          <Card padding="lg" className="bg-white/95 backdrop-blur-sm shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                Worker登録
              </h2>
              <p className="text-neutral-600 text-sm">
                即戦力として活躍しませんか？
              </p>
            </div>

            {error && (
              <motion.div
                className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  お名前
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white"
                  placeholder="山田 太郎"
                  autoComplete="name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white"
                  placeholder="email@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  パスワード
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white"
                  placeholder="8文字以上"
                  autoComplete="new-password"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  パスワード（確認）
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white"
                  placeholder="もう一度入力してください"
                  autoComplete="new-password"
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
              >
                Workerとして登録
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-neutral-200 text-center">
              <p className="text-neutral-600 text-sm">
                すでにアカウントをお持ちの方は
              </p>
              <Link to="/login" className="inline-block mt-2 text-primary hover:text-primary-dark font-medium transition-colors">
                ログイン
              </Link>
            </div>
          </Card>
        </motion.div>

        <motion.p
          className="mt-6 text-center text-white/90 text-sm"
          variants={slideUp}
        >
          登録することで、
          <Link to="/terms" className="text-white font-medium hover:underline mx-1">
            利用規約
          </Link>
          と
          <Link to="/privacy" className="text-white font-medium hover:underline mx-1">
            プライバシーポリシー
          </Link>
          に同意したものとみなされます。
        </motion.p>
      </motion.div>
    </div>
  );
}
