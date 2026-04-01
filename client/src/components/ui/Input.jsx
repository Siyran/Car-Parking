import { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Input = forwardRef(({ label, error, icon: Icon, className = '', containerClassName = '', ...props }, ref) => {
  return (
    <div className={`flex flex-col gap-4 ${containerClassName}`}>
      {label && (
        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-surface-500 mb-1 ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-primary-500 transition-colors duration-300 z-10">
            <Icon className="w-5 h-5 flex-shrink-0" />
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full h-14 rounded-2xl border bg-white dark:bg-surface-900 px-6 text-base md:text-sm 
            text-surface-900 dark:text-white placeholder:text-surface-400 
            focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500
            transition-all duration-300 border-surface-200 dark:border-surface-800
            ${Icon ? '!pl-14' : ''} 
            ${error ? 'border-danger-500 focus:ring-danger-500/10' : 'hover:border-surface-300 dark:hover:border-surface-700'} 
            ${className}
          `}
          {...props}
        />
        <div className="absolute inset-0 rounded-2xl pointer-events-none border border-transparent group-focus-within:border-primary-500/30 transition-all duration-300" />
      </div>
      
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-xs font-semibold text-danger-500 ml-1 leading-relaxed"
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
