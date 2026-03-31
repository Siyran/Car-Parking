import { motion } from 'framer-motion';

export default function Card({ children, className = '', hover = false, ...props }) {
  const Component = hover ? motion.div : 'div';
  const hoverProps = hover ? {
    whileHover: { y: -5, scale: 1.01 },
    transition: { duration: 0.3, ease: 'easeOut' }
  } : {};

  return (
    <Component
      className={`
        bg-white dark:bg-surface-900 rounded-[2rem] border border-surface-100 dark:border-surface-800 
        shadow-sm hover:shadow-premium transition-shadow duration-300
        ${hover ? 'cursor-pointer hover:border-primary-500/20' : ''} 
        ${className}
      `}
      {...hoverProps}
      {...props}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`px-8 py-6 border-b border-surface-50 dark:border-surface-800/50 ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '' }) {
  return <div className={`px-8 py-6 ${className}`}>{children}</div>;
}
