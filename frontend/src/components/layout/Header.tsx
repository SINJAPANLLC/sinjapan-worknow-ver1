import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export function Header() {
  const { user, logout } = useAuthStore();
  
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
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center space-x-2 text-white hover:text-white/80 transition-colors">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-medium">
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:block text-sm font-medium">{user.full_name}</span>
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
            <Link to="/login" className="text-white hover:text-white/80 transition-colors font-medium text-sm md:text-base">
              ログイン
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
