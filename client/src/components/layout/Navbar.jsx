import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, MapPin, Calendar, User, Wallet, BarChart3, Menu, X, ParkingCircle, CreditCard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = {
    user: [
      { name: 'Find Parking', path: '/search', icon: MapPin },
      { name: 'My Bookings', path: '/bookings', icon: Calendar },
      { name: 'Billing', path: '/billing', icon: CreditCard },
    ],
    owner: [
      { name: 'Dashboard', path: '/owner', icon: BarChart3 },
      { name: 'My Spots', path: '/owner/listings', icon: ParkingCircle },
      { name: 'Earnings', path: '/owner/earnings', icon: Wallet },
    ],
    admin: [
      { name: 'Analytics', path: '/admin', icon: BarChart3 },
      { name: 'Users', path: '/admin/users', icon: User },
      { name: 'Listings', path: '/admin/listings', icon: ParkingCircle },
    ]
  };

  const navLinks = (user && links[user.role]) ? links[user.role] : [];
  const isHomePage = pathname === '/';

  return (
    <nav className="fixed top-0 w-full z-50 px-4 py-4 md:py-6 pointer-events-none">
      <div className={`
        max-w-7xl mx-auto px-4 md:px-6 py-3 rounded-[2rem] transition-all duration-500 pointer-events-auto
        ${scrolled ? 'glass shadow-premium translate-y-0' : `${isHomePage ? 'bg-transparent' : 'glass'} translate-y-1`}
      `}>
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <motion.div 
              whileHover={{ rotate: -10, scale: 1.1 }}
              className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 shadow-lg shadow-primary-500/30 flex items-center justify-center shrink-0"
            >
              <span className="font-display font-bold text-xl text-white">P</span>
            </motion.div>
            <span className={`
              font-display font-black text-2xl tracking-tighter transition-colors duration-300
              ${scrolled || !isHomePage ? 'text-white' : 'text-white'}
            `}>
              Park<span className="text-primary-400 italic">Flow</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            <div className="flex items-center gap-1 bg-surface-100/50 dark:bg-surface-800/30 p-1.5 rounded-2xl border border-surface-200/50 dark:border-surface-700/50">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.path;
                return (
                  <Link 
                    key={link.path} 
                    to={link.path} 
                    className={`
                      relative flex items-center gap-2 px-4 py-2 text-sm font-bold transition-all duration-300 rounded-xl
                      ${isActive ? 'text-primary-600 shadow-sm' : 'text-surface-500 hover:text-surface-900'}
                    `}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="nav-active"
                        className="absolute inset-0 bg-white dark:bg-surface-900 rounded-xl shadow-sm -z-10"
                      />
                    )}
                    <Icon className="w-4 h-4" />
                    {link.name}
                  </Link>
                );
              })}
              
              {!user && !isHomePage && (
                 <Link to="/" className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-surface-500 hover:text-surface-900 transition-colors">
                   Home
                 </Link>
              )}
            </div>
            
            <div className="flex items-center gap-4 ml-4 shrink-0">
              {user ? (
                <div className="flex items-center gap-3 hover:scale-105 transition-transform duration-300">
                  <div className="bg-white/5 border border-white/10 py-1.5 px-4 rounded-2xl flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-[10px] font-black shadow-inner">
                      {user.name[0]}
                    </div>
                    <span className="text-sm font-black text-white capitalize">{user.name}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={logout} 
                    className="w-10 h-10 !p-0 rounded-full text-surface-400 hover:text-danger-500 hover:bg-danger-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link 
                    to="/login" 
                    className="text-sm font-black text-white hover:text-primary-400 transition-colors uppercase tracking-widest"
                  >
                    Sign In
                  </Link>
                  <Button size="sm" onClick={() => (window.location.href = '/register')} className="!rounded-xl shadow-lg shadow-primary-500/20">
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className={`
              lg:hidden p-2.5 rounded-2xl transition-all duration-300
              ${scrolled || !isHomePage ? 'bg-surface-100 text-surface-700' : 'bg-white/10 text-white'}
            `}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="lg:hidden absolute top-full left-4 right-4 mt-2 px-2 py-2 glass rounded-[2.5rem] shadow-2xl overflow-hidden pointer-events-auto"
          >
            <div className="space-y-1 p-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link 
                    key={link.path} 
                    to={link.path} 
                    onClick={() => setIsOpen(false)} 
                    className="flex items-center gap-4 px-6 py-4 rounded-2xl text-surface-700 hover:bg-primary-50 hover:text-primary-600 transition-all font-bold group"
                  >
                    <div className="p-2 rounded-xl bg-surface-100 group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span>{link.name}</span>
                  </Link>
                );
              })}
              
              {user ? (
                <div className="mt-4 pt-4 border-t border-surface-100/50">
                  <div className="flex items-center gap-4 px-6 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-black text-xl shadow-lg">
                      {user.name[0]}
                    </div>
                    <div>
                      <p className="font-black text-lg text-surface-900">{user.name}</p>
                      <p className="text-xs font-bold text-surface-500 uppercase tracking-widest">{user.role}</p>
                    </div>
                  </div>
                  <Button 
                    variant="danger" 
                    className="w-full rounded-[1.5rem] py-4"
                    onClick={() => { logout(); setIsOpen(false); }}
                  >
                    <LogOut className="w-5 h-5" /> Sign Out
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 mt-4">
                  <Link to="/login" onClick={() => setIsOpen(false)} className="block w-full text-center px-6 py-4 rounded-2xl bg-surface-100 text-surface-800 font-bold">Sign In</Link>
                  <Button className="w-full rounded-2xl py-4" onClick={() => (window.location.href = '/register')}>Get Started</Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

