import { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  const refreshTimerRef = useRef(null);

  const decodeJwtPayload = (token) => {
    try {
      const payload = token.split('.')[1];
      if (!payload) return null;
      return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    } catch {
      return null;
    }
  };

  const scheduleSilentRefresh = (token) => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    const payload = decodeJwtPayload(token);
    if (!payload?.exp) return;

    const refreshAt = Math.max((payload.exp * 1000) - Date.now() - 60_000, 10_000);
    refreshTimerRef.current = setTimeout(async () => {
      try {
        const refresh = localStorage.getItem('parkflow_refresh');
        if (!refresh) return;
        const { data } = await authAPI.refresh({ refresh });
        localStorage.setItem('parkflow_token', data.token);
        scheduleSilentRefresh(data.token);
      } catch (err) {
        if (import.meta.env.DEV) console.warn('Silent refresh failed:', err);
      }
    }, refreshAt);
  };

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      const token = localStorage.getItem('parkflow_token');
      const savedUser = localStorage.getItem('parkflow_user');
      const refresh = localStorage.getItem('parkflow_refresh');

      if (!token) {
        setLoading(false);
        return;
      }

      scheduleSilentRefresh(token);

      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          // ignore malformed cache, we'll try the server below
        }
      }

      try {
        const { data } = await authAPI.getMe();
        if (!active) return;
        setUser(data.user);
        localStorage.setItem('parkflow_user', JSON.stringify(data.user));
      } catch (err) {
        if (refresh) {
          try {
            const refreshed = await authAPI.refresh({ refresh });
            localStorage.setItem('parkflow_token', refreshed.data.token);
            scheduleSilentRefresh(refreshed.data.token);
            const { data } = await authAPI.getMe();
            if (!active) return;
            setUser(data.user);
            localStorage.setItem('parkflow_user', JSON.stringify(data.user));
          } catch (refreshErr) {
            if (import.meta.env.DEV) console.warn('Session restore failed:', refreshErr);
            localStorage.removeItem('parkflow_token');
            localStorage.removeItem('parkflow_user');
            localStorage.removeItem('parkflow_refresh');
            setUser(null);
          }
        } else {
          localStorage.removeItem('parkflow_token');
          localStorage.removeItem('parkflow_user');
          setUser(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    bootstrap();

    return () => {
      active = false;
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, []);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('parkflow_token', data.token);
    if (data.refresh) localStorage.setItem('parkflow_refresh', data.refresh);
    localStorage.setItem('parkflow_user', JSON.stringify(data.user));
    setUser(data.user);
    scheduleSilentRefresh(data.token);
    return data.user;
  };

  const register = async (formData) => {
    const { data } = await authAPI.register(formData);
    localStorage.setItem('parkflow_token', data.token);
    if (data.refresh) localStorage.setItem('parkflow_refresh', data.refresh);
    localStorage.setItem('parkflow_user', JSON.stringify(data.user));
    setUser(data.user);
    scheduleSilentRefresh(data.token);
    return data.user;
  };

  const logout = async () => {
    const toastId = toast.loading('Logging out and securing session...');
    try {
      const refresh = localStorage.getItem('parkflow_refresh');
      try {
        await authAPI.logout({ refresh });
      } catch (err) {
        if (import.meta.env.DEV) console.warn('Logout API failed:', err);
      }
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
      // Log in dev only
      if (import.meta.env.DEV) console.warn('Failed to auto-end session:', err);
      toast.error('Logout completed with session errors', { id: toastId });
    } finally {
      localStorage.removeItem('parkflow_token');
      localStorage.removeItem('parkflow_user');
      localStorage.removeItem('parkflow_refresh');
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
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
