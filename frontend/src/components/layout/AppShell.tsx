import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition } from '../../utils/animations';

interface AppShellProps {
  children: ReactNode;
  showBottomNav?: boolean;
  showHeader?: boolean;
  gradient?: boolean;
}

export function AppShell({ children, showBottomNav = true, showHeader = true, gradient = true }: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {gradient && (
        <div className="fixed inset-0 bg-gradient-primary opacity-5 pointer-events-none" />
      )}
      
      <AnimatePresence mode="wait">
        <motion.main
          className={`flex-1 ${showBottomNav ? 'pb-16 md:pb-0' : ''} ${showHeader ? 'pt-16' : ''}`}
          {...pageTransition}
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
