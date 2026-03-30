import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:shadow-lg hover:shadow-primary-500/25 hover:-translate-y-0.5',
  secondary: 'bg-surface-100 text-surface-700 hover:bg-surface-200',
  danger: 'bg-gradient-to-r from-danger-500 to-danger-400 text-white hover:shadow-lg hover:shadow-danger-500/25',
  success: 'bg-gradient-to-r from-success-500 to-success-400 text-white hover:shadow-lg hover:shadow-success-500/25',
  ghost: 'text-surface-600 hover:bg-surface-100',
  outline: 'border-2 border-primary-500 text-primary-600 hover:bg-primary-50'
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base'
};

export default function Button({ children, variant = 'primary', size = 'md', loading, disabled, className = '', ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}
