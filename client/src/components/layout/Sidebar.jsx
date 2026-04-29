import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  MapPin, 
  Calendar, 
  Wallet, 
  BarChart3, 
  ParkingCircle, 
  User, 
  CreditCard,
  Settings,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

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

  if (!user) return null;

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 bg-surface-950 border-r border-white/5 z-40">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-display font-bold text-lg">
            P
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-white">
            Park<span className="text-primary-500">Flow</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-4 flex flex-col gap-1">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.path;
          return (
            <Link 
              key={link.path} 
              to={link.path} 
              className={`
                group flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive ? 'bg-primary-500/10 text-primary-400' : 'text-surface-400 hover:bg-white/5 hover:text-white'}
              `}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-primary-400' : 'group-hover:text-white'}`} />
                <span>{link.name}</span>
              </div>
              {isActive && <motion.div layoutId="sidebar-active" className="w-1 h-4 bg-primary-500 rounded-full" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-primary-600/20 border border-primary-500/30 flex items-center justify-center text-primary-400 font-bold text-sm">
              {user.name[0]}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-semibold text-white truncate">{user.name}</span>
              <span className="text-[10px] text-surface-500 uppercase tracking-widest">{user.role}</span>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-surface-500 hover:bg-danger-500/10 hover:text-danger-400 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
