import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export function Header() {
  const { user, logout } = useAuthStore();
  
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-neutral-200 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <motion.div
            className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent"
            whileHover={{ scale: 1.05 }}
          >
            WORK NOW
          </motion.div>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          {user ? (
            <>
              <Link to="/dashboard" className="text-neutral-700 hover:text-primary-600 transition-colors">
                ダッシュボード
              </Link>
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center space-x-2 text-neutral-700 hover:text-primary-600 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-medium">
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{user.full_name}</span>
                </Menu.Button>
                
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-medium border border-neutral-200 py-1 focus:outline-none">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/profile"
                          className={`block px-4 py-2 text-sm ${
                            active ? 'bg-primary-50 text-primary-600' : 'text-neutral-700'
                          }`}
                        >
                          プロフィール
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/settings"
                          className={`block px-4 py-2 text-sm ${
                            active ? 'bg-primary-50 text-primary-600' : 'text-neutral-700'
                          }`}
                        >
                          設定
                        </Link>
                      )}
                    </Menu.Item>
                    <hr className="my-1 border-neutral-200" />
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={logout}
                          className={`block w-full text-left px-4 py-2 text-sm ${
                            active ? 'bg-danger/10 text-danger' : 'text-danger'
                          }`}
                        >
                          ログアウト
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            </>
          ) : (
            <>
              <Link to="/login" className="text-neutral-700 hover:text-primary-600 transition-colors">
                ログイン
              </Link>
              <Link
                to="/register/worker"
                className="px-4 py-2 bg-gradient-primary text-white rounded-lg hover:shadow-medium transition-all"
              >
                登録
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
