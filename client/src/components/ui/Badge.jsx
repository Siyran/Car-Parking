const badgeVariants = {
  success: 'bg-success-500/10 text-success-500 border-success-500/20',
  warning: 'bg-warning-500/10 text-warning-500 border-warning-500/20',
  danger: 'bg-danger-500/10 text-danger-500 border-danger-500/20',
  primary: 'bg-primary-500/10 text-primary-600 border-primary-500/20',
  neutral: 'bg-surface-100 text-surface-600 border-surface-200'
};

export default function Badge({ children, variant = 'neutral', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeVariants[variant]} ${className}`}>
      {children}
    </span>
  );
}
