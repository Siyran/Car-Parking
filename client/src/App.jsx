import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';

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
      
      {/* Public */}
      <Route path="/search" element={<Search />} />
      <Route path="/spots/:id" element={<SpotDetail />} />

      {/* User (formerly Driver) */}
      <Route path="/bookings" element={<ProtectedRoute roles={['user']}><MyBookings /></ProtectedRoute>} />
      <Route path="/wallet" element={<ProtectedRoute roles={['user']}><Wallet /></ProtectedRoute>} />
      <Route path="/billing" element={<ProtectedRoute roles={['user']}><Billing /></ProtectedRoute>} />

      {/* Owner */}
      <Route path="/owner" element={<ProtectedRoute roles={['owner']}><OwnerDashboard /></ProtectedRoute>} />
      <Route path="/owner/add-spot" element={<ProtectedRoute roles={['owner']}><AddSpot /></ProtectedRoute>} />
      <Route path="/owner/listings" element={<ProtectedRoute roles={['owner']}><MyListings /></ProtectedRoute>} />
      <Route path="/owner/earnings" element={<ProtectedRoute roles={['owner']}><Earnings /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminAnalytics /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/listings" element={<ProtectedRoute roles={['admin']}><AdminListings /></ProtectedRoute>} />
      <Route path="/admin/transactions" element={<ProtectedRoute roles={['admin']}><AdminTransactions /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{
          style: { borderRadius: '12px', background: '#1e293b', color: '#f1f5f9', fontSize: '14px' },
          duration: 3000
        }} />
      </Router>
    </AuthProvider>
  );
}
