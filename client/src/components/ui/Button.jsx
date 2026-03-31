import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40',
  secondary: 'bg-white/80 dark:bg-surface-800/80 backdrop-blur-md text-surface-700 dark:text-surface-200 border border-surface-200/50 dark:border-surface-700/50 hover:bg-white dark:hover:bg-surface-800',
  danger: 'bg-gradient-to-r from-danger-600 to-danger-500 text-white shadow-lg shadow-danger-500/20',
  success: 'bg-gradient-to-r from-success-600 to-success-500 text-white shadow-lg shadow-success-500/20',
  ghost: 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800/50',
  outline: 'border-2 border-primary-500/50 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/30 hover:border-primary-500',
  glass: 'glass-morphism text-white hover:bg-white/10 border-white/20'
};

const sizes = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base'
};

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading, 
  disabled, 
  className = '', 
  ...props 
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative inline-flex items-center justify-center gap-2 font-display font-black tracking-tight transition-all duration-300 h-14
        ${variants[variant]} ${sizes[size]} ${loading || disabled ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute flex items-center justify-center inset-0 bg-inherit rounded-inherit"
          >
            <Loader2 className="w-5 h-5 animate-spin" />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Shine effect on hover */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 hover:opacity-100 transition-opacity duration-500 -translate-x-full hover:translate-x-full transform ease-out" />
    </motion.button>
  );
}

