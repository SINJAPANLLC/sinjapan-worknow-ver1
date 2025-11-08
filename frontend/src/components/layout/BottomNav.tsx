import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

interface BottomNavProps {
  items: NavItem[];
}

export function BottomNav({ items }: BottomNavProps) {
  const location = useLocation();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 md:hidden z-50 safe-area-inset-bottom">
      <div className="flex justify-around items-center h-16 px-2">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center flex-1 h-full relative"
            >
              <motion.div
                className={`flex flex-col items-center ${
                  isActive ? 'text-primary-600' : 'text-neutral-500'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-2xl mb-1">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </motion.div>
              
              {isActive && (
                <motion.div
                  className="absolute bottom-0 left-1/2 w-12 h-1 bg-gradient-primary rounded-t-full"
                  layoutId="bottomNavIndicator"
                  initial={{ opacity: 0, x: '-50%' }}
                  animate={{ opacity: 1, x: '-50%' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
