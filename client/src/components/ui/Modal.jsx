import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const overlayRef = useRef();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === overlayRef.current && onClose()}>
      <div className="fixed inset-0 bg-surface-900/60 backdrop-blur-sm" />
      <div className={`relative glass-dark border border-white/10 rounded-[2.5rem] shadow-2xl w-full ${sizes[size]} max-h-[85vh] overflow-y-auto animate-slide-up`}>
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 sticky top-0 bg-surface-900/80 backdrop-blur-lg rounded-t-[2.5rem] z-10">
          <h2 className="text-xl font-black text-white italic tracking-tight uppercase">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-xl text-surface-500 hover:text-white hover:bg-white/5 transition-all outline-none">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}
