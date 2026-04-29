import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/layout/Navbar';
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Search from './pages/user/Search';
import SpotDetail from './pages/user/SpotDetail';
import MyBookings from './pages/user/MyBookings';
import Billing from './pages/user/Billing';
import Wallet from './pages/user/Wallet';
import OwnerDashboard from './pages/owner/Dashboard';
import AddSpot from './pages/owner/AddSpot';
import MyListings from './pages/owner/MyListings';
import Earnings from './pages/owner/Earnings';
import AdminAnalytics from './pages/admin/Analytics';
import AdminUsers from './pages/admin/Users';
import AdminListings from './pages/admin/Listings';
import AdminTransactions from './pages/admin/Transactions';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" style={{ animation: 'spin 1s linear infinite' }} /></div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'owner' ? '/owner' : '/search'} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
      
      {/* Public / Search (Show Navbar) */}
      <Route path="/search" element={<><Navbar /><Search /></>} />
      <Route path="/spots/:id" element={<><Navbar /><SpotDetail /></>} />

      {/* User (formerly Driver) - Dashboard Pages */}
      <Route path="/bookings" element={<ProtectedRoute roles={['user']}><DashboardLayout><MyBookings /></DashboardLayout></ProtectedRoute>} />
      <Route path="/wallet" element={<ProtectedRoute roles={['user']}><DashboardLayout><Wallet /></DashboardLayout></ProtectedRoute>} />
      <Route path="/billing" element={<ProtectedRoute roles={['user']}><DashboardLayout><Billing /></DashboardLayout></ProtectedRoute>} />

      {/* Owner - Dashboard Pages */}
      <Route path="/owner" element={<ProtectedRoute roles={['owner']}><DashboardLayout><OwnerDashboard /></DashboardLayout></ProtectedRoute>} />
      <Route path="/owner/add-spot" element={<ProtectedRoute roles={['owner']}><DashboardLayout><AddSpot /></DashboardLayout></ProtectedRoute>} />
      <Route path="/owner/listings" element={<ProtectedRoute roles={['owner']}><DashboardLayout><MyListings /></DashboardLayout></ProtectedRoute>} />
      <Route path="/owner/earnings" element={<ProtectedRoute roles={['owner']}><DashboardLayout><Earnings /></DashboardLayout></ProtectedRoute>} />

      {/* Admin - Dashboard Pages */}
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><DashboardLayout><AdminAnalytics /></DashboardLayout></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><DashboardLayout><AdminUsers /></DashboardLayout></ProtectedRoute>} />
      <Route path="/admin/listings" element={<ProtectedRoute roles={['admin']}><DashboardLayout><AdminListings /></DashboardLayout></ProtectedRoute>} />
      <Route path="/admin/transactions" element={<ProtectedRoute roles={['admin']}><DashboardLayout><AdminTransactions /></DashboardLayout></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <AppRoutes />
          <Toaster position="top-right" toastOptions={{
            style: { borderRadius: '12px', background: '#0c0c0e', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.1)', fontSize: '14px' },
            duration: 3000
          }} />
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}
