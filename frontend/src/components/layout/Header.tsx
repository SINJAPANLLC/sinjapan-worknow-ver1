import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import { useState } from 'react';

export function Header() {
  const { user, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-primary via-primary to-primary-dark backdrop-blur-sm border-b border-primary-dark/30 z-50">
      <div className="container mx-auto px-4 h-24 md:h-28 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <motion.img
            src="/logo-new.jpg"
            alt="Work Now in Japan Logo"
            className="h-12 md:h-16 w-auto rounded-md"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
        </Link>
        
        <nav className="flex items-center space-x-3 md:space-x-6">
          {user ? (
            <>
              <Link to="/dashboard" className="hidden md:block text-white hover:text-white/80 transition-colors font-medium">
                ダッシュボード
              </Link>
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  onBlur={() => setTimeout(() => setIsMenuOpen(false), 200)}
                  className="flex items-center space-x-2 text-white hover:text-white/80 transition-colors"
                >
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-medium">
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:block text-sm font-medium">{user.full_name}</span>
                </button>
                
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-1">
                    <Link
                      to="/dashboard"
                      className="block md:hidden px-4 py-2 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      ダッシュボード
                    </Link>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      プロフィール
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      設定
                    </Link>
                    <hr className="my-1 border-neutral-200" />
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger/10"
                    >
                      ログアウト
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link to="/login" className="text-white hover:text-white/80 transition-colors font-medium text-sm md:text-base">
              ログイン
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
