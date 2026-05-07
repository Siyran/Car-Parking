import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function VibeNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const sectionLinks = [
    { label: 'Product', id: 'how-it-works' },
    { label: 'Pricing', id: 'features' },
    { label: 'About', id: 'stats' },
    { label: 'Contact', id: 'final-cta' },
  ];

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Session Terminated');
    navigate('/login');
  };

  const homeCta = user
    ? (user.role === 'admin' ? '/admin' : user.role === 'owner' ? '/owner' : '/search')
    : '/register';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 px-4 sm:px-6 md:px-10 py-4 ${scrolled ? 'bg-[#05070A]/72 backdrop-blur-2xl border-b border-white/8 shadow-[0_12px_50px_-20px_rgba(0,0,0,0.7)]' : 'bg-transparent'}`}>
      <div className="max-w-[1440px] mx-auto flex items-center justify-between rounded-3xl">
        <Link to="/" className="group flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 via-cyan-400 to-emerald-400 p-[1px] shadow-[0_12px_40px_-18px_rgba(77,124,255,0.9)] transition-transform duration-300 group-hover:scale-105">
            <div className="w-full h-full rounded-2xl bg-[#05070A] flex items-center justify-center text-white font-display font-black text-lg">P</div>
          </div>
          <span className="font-display font-semibold text-xl tracking-tight text-white">ParkFlow</span>
        </Link>

        <div className="hidden md:flex items-center gap-2 rounded-full border border-white/8 bg-white/4 px-2 py-2 backdrop-blur-xl">
          {sectionLinks.map(({ label, id }) => (
            <button
              key={id}
              type="button"
              onClick={() => scrollToSection(id)}
              className="rounded-full px-4 py-2 text-sm font-medium text-white/58 transition-all duration-300 hover:bg-white/6 hover:text-white"
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          {user ? (
            <>
              <button
                type="button"
                onClick={handleLogout}
                className="hidden sm:inline-flex text-sm font-medium text-white/70 hover:text-white transition-colors"
              >
                Sign Out
              </button>
              <Link
                to={homeCta}
                className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-surface-950 transition-all duration-300 hover:-translate-y-0.5 hover:bg-surface-200"
              >
                Open Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="hidden sm:inline-flex text-sm font-medium text-white/70 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to={homeCta}
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-primary-500 via-cyan-400 to-emerald-400 px-5 py-2.5 text-sm font-semibold text-[#05070A] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-12px_rgba(77,124,255,0.7)]"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
