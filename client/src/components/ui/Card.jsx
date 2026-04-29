import { motion } from 'framer-motion';

export default function Card({ children, className = '', hover = false, variant = 'default', ...props }) {
  const Component = hover ? motion.div : 'div';
  
  const variants = {
    default: 'bg-white dark:bg-surface-900 border-surface-100 dark:border-surface-800',
    glass: 'glass-dark',
    premium: 'glass-premium'
  };

  return (
    <Component
      whileHover={hover ? { y: -4, scale: 1.005 } : {}}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`
        rounded-2xl border transition-all duration-300
        ${variants[variant]}
        ${hover ? 'cursor-pointer hover:shadow-premium hover:border-primary-500/30' : 'shadow-sm'} 
        ${className}
      `}
      {...props}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`px-6 py-4 border-b border-surface-100 dark:border-white/5 ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '' }) {
  return <div className={`px-6 py-5 ${className}`}>{children}</div>;
}
