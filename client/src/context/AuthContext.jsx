import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, bookingAPI } from '../api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('parkflow_token');
    const savedUser = localStorage.getItem('parkflow_user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('parkflow_token', data.token);
    localStorage.setItem('parkflow_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (formData) => {
    const { data } = await authAPI.register(formData);
    localStorage.setItem('parkflow_token', data.token);
    localStorage.setItem('parkflow_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    const toastId = toast.loading('Logging out and securing session...');
    try {
      if (user?.role === 'user') {
        const { data } = await bookingAPI.endActive();
        if (data.booking) {
          toast.success(`Session Ended: ${data.booking.spot?.title || 'Parking Spot'}`, { id: toastId });
        } else {
          toast.success('Logged out successfully', { id: toastId });
        }
      } else {
        toast.success('Logged out successfully', { id: toastId });
      }
    } catch (err) {
      console.error('Failed to auto-end session:', err);
      toast.error('Logout completed with session errors', { id: toastId });
    } finally {
      localStorage.removeItem('parkflow_token');
      localStorage.removeItem('parkflow_user');
      setUser(null);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('parkflow_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
