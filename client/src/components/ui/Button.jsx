import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-primary-600 text-white shadow-lg shadow-primary-500/20 hover:bg-primary-500 active:bg-primary-700 border border-primary-400/20',
  secondary: 'bg-white/5 dark:bg-white/5 backdrop-blur-md text-white border border-white/10 hover:bg-white/10 active:bg-white/20',
  danger: 'bg-danger-600 text-white shadow-lg shadow-danger-500/20 hover:bg-danger-500 active:bg-danger-700',
  success: 'bg-success-600 text-white shadow-lg shadow-success-500/20 hover:bg-success-500 active:bg-success-700',
  ghost: 'text-surface-400 hover:text-white hover:bg-white/5 active:bg-white/10',
  outline: 'border border-primary-500/50 text-primary-400 hover:bg-primary-500/10 hover:border-primary-500 active:bg-primary-500/20',
  glass: 'glass-premium text-white hover:bg-white/10 active:bg-white/20'
};

const sizes = {
  sm: 'px-4 h-9 text-xs',
  md: 'px-6 h-11 text-sm',
  lg: 'px-8 h-14 text-base'
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
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative inline-flex items-center justify-center gap-2 font-sans font-medium tracking-tight transition-all duration-200 rounded-xl
        ${variants[variant]} ${sizes[size]} ${loading || disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center justify-center"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex items-center gap-2"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

