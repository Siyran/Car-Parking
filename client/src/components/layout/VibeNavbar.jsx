import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function VibeNavbar() {
  return (
    <nav className="fixed top-0 w-full z-50 px-12 py-10 flex items-center justify-between font-sans">
      {/* LEFT LINKS */}
      <div className="flex items-center gap-10">
        {['HOME', 'ABOUT US', 'PRICING', 'PRODUCT'].map(link => (
          <Link 
            key={link} 
            to="/" 
            className="text-[11px] font-bold text-white hover:text-blue-400 transition-colors tracking-widest"
          >
            {link}
          </Link>
        ))}
      </div>

      {/* CENTER LOGO (SERIF) */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <span className="font-serif text-3xl font-black italic text-white tracking-widest uppercase">
          REMOTE
        </span>
      </div>

      {/* RIGHT SIGN IN */}
      <div className="flex items-center gap-6">
        <Link 
          to="/login" 
          className="text-[11px] font-bold text-white hover:text-blue-400 transition-colors tracking-widest"
        >
          SIGN IN
        </Link>
      </div>
    </nav>
  );
}
