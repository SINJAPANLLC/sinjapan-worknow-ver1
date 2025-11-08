import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<any>;
}

interface BottomNavProps {
  items: NavItem[];
}

export function BottomNav({ items }: BottomNavProps) {
  const location = useLocation();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-neutral-200/50 md:hidden z-50 shadow-lg">
      <div className="flex justify-around items-center h-20 px-2 safe-area-inset-bottom">
        {items.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center flex-1 h-full relative group"
            >
              <motion.div
                className="flex flex-col items-center gap-1"
                whileTap={{ scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <motion.div
                  className={`
                    relative flex items-center justify-center w-12 h-12 rounded-2xl
                    transition-all duration-300
                    ${isActive 
                      ? 'bg-gradient-to-br from-primary via-primary to-primary-dark shadow-lg shadow-primary/30' 
                      : 'bg-neutral-100 group-hover:bg-neutral-200'
                    }
                  `}
                  animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Icon 
                    className={`w-6 h-6 transition-colors ${
                      isActive ? 'text-white' : 'text-neutral-600 group-hover:text-primary'
                    }`}
                    strokeWidth={2.5}
                  />
                  
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl bg-white/20"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.div>
                
                <span className={`text-xs font-semibold transition-colors ${
                  isActive ? 'text-primary' : 'text-neutral-500 group-hover:text-neutral-700'
                }`}>
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
