import { HTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { scaleIn } from '../../utils/animations';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  gradient?: boolean;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ children, gradient = false, hover = true, padding = 'md', className = '', ...props }: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  const baseClasses = 'rounded-xl bg-white shadow-soft transition-all duration-300';
  const hoverClasses = hover ? 'hover:shadow-medium hover:-translate-y-1' : '';
  const gradientClasses = gradient ? 'bg-gradient-primary text-white' : '';
  
  const classes = `${baseClasses} ${hoverClasses} ${gradientClasses} ${paddingClasses[padding]} ${className}`;
  
  return (
    <motion.div
      className={classes}
      variants={scaleIn}
      whileHover={hover ? { y: -4 } : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
}
