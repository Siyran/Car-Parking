import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, MapPin, Calendar, User, Wallet, BarChart3, Menu, X, ParkingCircle, CreditCard, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Session Terminated. Redirecting...');
    navigate('/login');
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = {
    user: [
      { name: 'Find Parking', path: '/search', icon: MapPin },
      { name: 'My Bookings', path: '/bookings', icon: Calendar },
      { name: 'Wallet', path: '/wallet', icon: Wallet },
      { name: 'Billing', path: '/billing', icon: CreditCard },
    ],
    owner: [
      { name: 'Dashboard', path: '/owner', icon: BarChart3 },
      { name: 'My Listings', path: '/owner/listings', icon: ParkingCircle },
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

  if (isHomePage && !user) return null;

  return (
    <nav className="fixed top-0 w-full z-50 px-6 py-4 md:py-6 pointer-events-none">
      <div className={`
        max-w-[1440px] mx-auto px-6 md:px-10 py-4 rounded-[2rem] transition-all duration-700 pointer-events-auto
        ${scrolled ? 'glass-dark shadow-glow translate-y-0 border-white/10' : `${isHomePage ? 'bg-transparent border-transparent' : 'glass-dark border-white/5'} translate-y-1`}
      `}>
        <div className="flex justify-between items-center">

          <Link to="/" className="flex items-center gap-4 group shrink-0">
            <motion.div 
              whileHover={{ rotate: -10, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="w-12 h-12 rounded-[1.25rem] bg-linear-to-br from-primary-600 to-accent-500 shadow-lg shadow-primary-500/20 flex items-center justify-center shrink-0 border border-white/20"
            >
              <span className="font-display font-black text-2xl text-white italic">P</span>
            </motion.div>
            <div className="flex flex-col -gap-1">
              <span className="font-display font-black text-2xl tracking-tighter text-white italic leading-none">
                Park<span className="text-primary-400">Flow</span>
              </span>
              <span className="text-[8px] font-black uppercase tracking-[0.4em] text-surface-500 ml-0.5">Mobility Hub</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-1 glass-dark p-1 rounded-[1.5rem] border border-white/5 shadow-2xl">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.path;
                return (
                  <Link 
                    key={link.path} 
                    to={link.path} 
                    className={`
                      relative flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-all duration-500 rounded-[1.15rem]
                      ${isActive ? 'text-white' : 'text-surface-500 hover:text-white'}
                    `}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="nav-active"
                        className="absolute inset-0 bg-primary-600 rounded-[1.15rem] shadow-glow -z-10"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-surface-500'}`} />
                    {link.name}
                  </Link>
                );
              })}
              {/* Unauthenticated Nav links removed as per instructions */}
            </div>

            <div className="flex items-center gap-8 ml-6 shrink-0 h-10">
              <div className="w-[1px] h-full bg-white/5 mx-2" />
              {user ? (
                <div className="flex items-center gap-5 group">
                  <Link to={user.role === 'owner' ? '/owner' : '/search'} className="glass-dark hover:bg-white/5 py-2 pl-4 pr-3 rounded-[1.25rem] flex items-center gap-4 border border-white/5 group-hover:border-primary-500/30 transition-all duration-500">
                    <div className="flex flex-col items-end">
                       <span className="text-xs font-black text-white italic tracking-tight uppercase">{user.name}</span>
                       <span className="text-[8px] font-bold text-surface-600 uppercase tracking-widest">{user.role}</span>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-linear-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-black shadow-glow group-hover:scale-105 transition-transform">
                      {user.name[0]}
                    </div>
                  </Link>
                  <button 
                    onClick={handleLogout} 
                    className="h-10 px-4 rounded-xl glass-dark hover:bg-danger-500/10 text-surface-500 hover:text-danger-500 transition-all duration-500 border border-white/5 flex items-center gap-2 group/logout"
                  >
                    <LogOut className="w-4 h-4 transition-transform group-hover/logout:-translate-x-1" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-6">
                  <Link 
                    to="/login" 
                    className="text-[10px] font-black text-white hover:text-primary-400 transition-all uppercase tracking-[0.3em]"
                  >
                    Sign In
                  </Link>
                  <Button size="sm" onClick={() => (window.location.href = '/register')} className="!rounded-xl px-10 h-11 text-xs uppercase tracking-widest font-black shadow-glow">
                     Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>


          {/* Mobile menu button */}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className={`
              lg:hidden p-3 rounded-2xl transition-all duration-500 border border-white/5
              ${scrolled || !isHomePage ? 'glass-dark text-white' : 'bg-white/5 text-white'}
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
            className="lg:hidden absolute top-full left-6 right-6 mt-4 p-2 glass-dark rounded-[2.5rem] shadow-2xl overflow-hidden pointer-events-auto border border-white/10"
          >
            <div className="p-4 flex flex-col gap-2">
              {navLinks.length > 0 && (
                navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link 
                      key={link.path} 
                      to={link.path} 
                      onClick={() => setIsOpen(false)} 
                      className="flex items-center justify-between px-8 py-5 rounded-[1.75rem] text-surface-400 hover:bg-primary-600 hover:text-white transition-all duration-500 group border border-transparent hover:border-white/10"
                    >
                      <div className="flex items-center gap-5">
                        <Icon className="w-5 h-5 opacity-50 group-hover:opacity-100" />
                        <span className="font-black italic uppercase tracking-wider text-lg">{link.name}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </Link>
                  );
                })
              )}
              
              <div className="h-[1px] bg-white/5 mx-6 my-2" />
              
              {user ? (
                <div className="p-4 pt-2">
                  <div className="flex items-center gap-5 px-4 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-black text-2xl shadow-glow">
                      {user.name[0]}
                    </div>
                    <div>
                      <p className="font-black text-xl text-white italic leading-tight">{user.name}</p>
                      <p className="text-[10px] font-black text-surface-600 uppercase tracking-[0.3em] mt-1">{user.role}</p>
                    </div>
                  </div>
                  <Button 
                    variant="danger" 
                    className="w-full rounded-[1.75rem] py-6 text-lg font-black uppercase tracking-widest italic flex items-center justify-center gap-3"
                    onClick={() => { handleLogout(); setIsOpen(false); }}
                  >
                    <LogOut className="w-6 h-6" /> Exit Hub
                  </Button>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  <Link to="/login" onClick={() => setIsOpen(false)} className="block w-full text-center py-6 rounded-[1.75rem] glass-dark text-white font-black italic uppercase tracking-[0.2em] text-lg border border-white/5">Sign In</Link>
                  <Button className="w-full rounded-[1.75rem] py-6 text-lg font-black italic uppercase tracking-[0.2em]" onClick={() => (window.location.href = '/register')}>Sign Up</Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
