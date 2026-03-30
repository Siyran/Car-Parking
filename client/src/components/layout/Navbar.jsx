import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, MapPin, Calendar, User, Wallet, BarChart3, Menu, X, ParkingCircle, CreditCard } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
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

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'glass py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${scrolled || user ? 'bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-500/30' : 'bg-white shadow-lg'}`}>
              <span className={`font-display font-bold text-xl ${scrolled || user ? 'text-white' : 'gradient-text'}`}>P</span>
            </div>
            <span className={`font-display font-bold text-xl tracking-tight transition-colors duration-300 ${scrolled || user ? 'text-surface-900' : 'text-white'}`}>
              Park<span className="text-primary-500">Flow</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.path} to={link.path} className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary-600 ${scrolled || user ? 'text-surface-600' : 'text-white/80 hover:text-white'}`}>
                  <Icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}
            
            <div className="flex items-center gap-4 ml-4 border-l border-surface-200/30 pl-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 bg-surface-100/50 backdrop-blur-md py-1.5 px-3 rounded-full border border-surface-200/50">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-xs font-bold shadow-inner">
                      {user.name[0]}
                    </div>
                    <span className="text-sm font-semibold text-surface-800">{user.name}</span>
                  </div>
                  <button onClick={logout} className="p-2 text-surface-400 hover:text-danger-500 hover:bg-danger-50 rounded-full transition-colors">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-medium text-white/90 hover:text-white transition-colors">Sign In</Link>
                  <Link to="/register" className="px-5 py-2.5 rounded-full bg-white text-surface-900 text-sm font-bold shadow-lg shadow-white/20 hover:shadow-xl hover:scale-105 transition-all">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 rounded-lg text-surface-500 glass">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden glass absolute top-full left-0 w-full border-t border-surface-200/50 mt-2 px-4 py-4 space-y-2 max-h-[80vh] overflow-y-auto shadow-2xl animate-fade-in">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.path} to={link.path} onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-surface-700 hover:bg-primary-50 hover:text-primary-600 transition-colors">
                <Icon className="w-5 h-5" />
                <span className="font-medium">{link.name}</span>
              </Link>
            );
          })}
          {user ? (
            <div className="pt-4 mt-2 border-t border-surface-200">
              <div className="flex items-center gap-3 px-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold">
                  {user.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-surface-900">{user.name}</p>
                  <p className="text-xs text-surface-500 capitalize">{user.role}</p>
                </div>
              </div>
              <button onClick={() => { logout(); setIsOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-danger-600 hover:bg-danger-50 transition-colors font-medium">
                <LogOut className="w-5 h-5" /> Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-4 space-y-3 border-t border-surface-200">
              <Link to="/login" onClick={() => setIsOpen(false)} className="block w-full text-center px-4 py-3 rounded-xl bg-surface-100 text-surface-800 font-medium">Sign In</Link>
              <Link to="/register" onClick={() => setIsOpen(false)} className="block w-full text-center px-4 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 text-white font-bold shadow-lg">Get Started</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
