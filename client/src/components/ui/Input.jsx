import { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Input = forwardRef(({ label, error, icon: Icon, className = '', containerClassName = '', ...props }, ref) => {
  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label className="text-xs font-medium text-surface-500 dark:text-surface-400 ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500 group-focus-within:text-primary-500 transition-colors duration-300 z-10">
            <Icon className="w-4 h-4 flex-shrink-0" />
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full h-11 rounded-xl border bg-white dark:bg-surface-900/50 px-4 text-sm 
            text-surface-900 dark:text-white placeholder:text-surface-500 
            focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50
            transition-all duration-200 border-surface-200 dark:border-white/10
            ${Icon ? '!pl-11' : ''} 
            ${error ? 'border-danger-500/50 focus:ring-danger-500/10 focus:border-danger-500/50' : 'hover:border-surface-300 dark:hover:border-white/20'} 
            ${className}
          `}
          {...props}
        />
      </div>
      
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-[11px] font-medium text-danger-400 ml-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
