import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
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
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-600 rounded-full blur-[120px]" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white tracking-tight mb-3">Welcome Back</h1>
          <p className="text-surface-500 text-sm">Enter your credentials to access your account</p>
        </div>

        <div className="bg-surface-900/50 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-surface-500 uppercase tracking-widest ml-1">Email Address</label>
              <Input type="email" icon={Mail} placeholder="name@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-semibold text-surface-500 uppercase tracking-widest">Password</label>
                <a href="#" className="text-[10px] font-bold text-primary-400 hover:text-white transition-colors">Forgot password?</a>
              </div>
              <Input type="password" icon={Lock} placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
            </div>

            <Button type="submit" loading={loading} className="w-full py-4 text-sm font-bold gap-2">
              Login <ShieldCheck className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-sm text-surface-500">
              Don't have an account?
              <Link to="/register" className="text-primary-400 hover:text-white ml-2 font-semibold transition-colors">Sign up</Link>
            </p>
          </div>

          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-white/5" />
              <span className="text-[10px] font-bold text-surface-600 uppercase tracking-widest">Quick Access</span>
              <div className="h-px flex-1 bg-white/5" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { email: 'amit@parkflow.com', label: 'Driver' },
                { email: 'rajesh@parkflow.com', label: 'Owner' },
                { email: 'admin@parkflow.com', label: 'Admin' },
              ].map(({ email, label }) => (
                <button key={email} type="button" onClick={() => setForm({ email, password: 'password123' })}
                  className="text-[10px] font-bold py-2 rounded-xl bg-white/5 hover:bg-white/10 text-surface-400 hover:text-white border border-white/5 transition-all">
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
