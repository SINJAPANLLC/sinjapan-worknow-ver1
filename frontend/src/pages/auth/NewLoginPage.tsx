import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { slideUp, staggerChildren } from '../../utils/animations';

export default function NewLoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('ログインに失敗しました。メールアドレスとパスワードを確認してください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-secondary">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
      
      <motion.div
        className="relative z-10 w-full max-w-sm px-4"
        variants={staggerChildren}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={slideUp}>
          <Card padding="md" className="bg-white/95 backdrop-blur-sm shadow-2xl">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                ログイン
              </h2>
              <p className="text-neutral-600 text-sm">
                働き方に彩りを。採用には自由を。
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

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                  メールアドレス
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white"
                  placeholder="email@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                  パスワード
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2 rounded border-neutral-300 text-primary focus:ring-primary" />
                  <span className="text-neutral-600">ログイン状態を保持</span>
                </label>
                <Link to="/forgot-password" className="text-primary hover:text-primary-dark font-medium transition-colors">
                  パスワードを忘れた
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
              >
                ログイン
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-neutral-200">
              <p className="text-center text-neutral-600 text-sm">
                アカウントをお持ちでない方
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Link to="/register/worker">
                  <Button variant="outline" fullWidth>
                    Worker登録
                  </Button>
                </Link>
                <Link to="/register/client">
                  <Button variant="outline" fullWidth>
                    Client登録
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.p
          className="mt-6 text-center text-white/90 text-sm"
          variants={slideUp}
        >
          ログインすることで、
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
