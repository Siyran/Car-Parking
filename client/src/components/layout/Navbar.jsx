import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, MapPin, Calendar, User, Wallet, BarChart3, Menu, X, ParkingCircle, CreditCard, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Session Terminated');
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
    <nav className="fixed top-0 w-full z-50 px-6 py-4 pointer-events-none">
      <div className={`
        max-w-7xl mx-auto px-6 py-3 rounded-2xl transition-all duration-500 pointer-events-auto
        ${scrolled ? 'glass-dark border-white/10 shadow-xl' : 'bg-transparent border-transparent'}
      `}>
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white font-display font-bold text-xl"
            >
              P
            </motion.div>
            <span className="font-display font-bold text-xl tracking-tight text-white">
              Park<span className="text-primary-500">Flow</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.path;
                return (
                  <Link 
                    key={link.path} 
                    to={link.path} 
                    className={`
                      relative flex items-center gap-2 px-4 py-2 text-xs font-medium transition-all duration-300 rounded-lg
                      ${isActive ? 'text-white' : 'text-surface-400 hover:text-white'}
                    `}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="nav-active"
                        className="absolute inset-0 bg-white/10 rounded-lg -z-10"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <Icon className="w-4 h-4" />
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {user && (
              <div className="flex items-center gap-4">
                <div className="h-6 w-[1px] bg-white/10 mx-2" />
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-semibold text-white">{user.name}</span>
                    <span className="text-[10px] text-surface-500 uppercase tracking-wider">{user.role}</span>
                  </div>
                  <button onClick={handleLogout} className="p-2 rounded-lg bg-white/5 hover:bg-danger-500/10 text-surface-400 hover:text-danger-500 transition-all">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 text-white">
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden absolute top-full left-6 right-6 mt-2 p-2 glass-dark rounded-2xl border border-white/10 shadow-2xl pointer-events-auto"
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  onClick={() => setIsOpen(false)} 
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-surface-400 hover:bg-white/5 hover:text-white transition-all"
                >
                  <link.icon className="w-5 h-5" />
                  <span className="font-medium">{link.name}</span>
                </Link>
              ))}
              <div className="h-[1px] bg-white/5 my-2" />
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-danger-400 hover:bg-danger-500/10 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
