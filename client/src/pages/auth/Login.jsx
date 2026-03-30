import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Mail, Lock, ParkingCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'admin' ? '/admin' : user.role === 'owner' ? '/owner' : '/search');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-950 via-surface-900 to-primary-950 px-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/25">
            <ParkingCircle className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-surface-400 mt-1">Sign in to your ParkFlow account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Email" type="email" icon={Mail} placeholder="you@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            <Input label="Password" type="password" icon={Lock} placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
            <Button type="submit" loading={loading} className="w-full" size="lg">Sign In</Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-surface-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 font-semibold hover:text-primary-700">Create Account</Link>
            </p>
          </div>

          {/* Quick login hints */}
          <div className="mt-6 pt-6 border-t border-surface-100">
            <p className="text-xs text-surface-400 text-center mb-3">Demo Accounts</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { email: 'amit@parkflow.com', label: 'User' },
                { email: 'rajesh@parkflow.com', label: 'Owner' },
                { email: 'admin@parkflow.com', label: 'Admin' },
              ].map(({ email, label }) => (
                <button key={email} type="button" onClick={() => setForm({ email, password: 'password123' })}
                  className="text-xs px-3 py-2 rounded-lg bg-surface-50 hover:bg-surface-100 text-surface-600 font-medium transition-all">
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
