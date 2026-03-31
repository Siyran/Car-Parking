import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Mail, Lock, Sparkles, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';
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
    <div className="min-h-screen grid lg:grid-cols-2 bg-surface-950 selection:bg-primary-500 overflow-hidden">
       {/* Left Side: Visual Graphic */}
       <div className="hidden lg:flex relative items-center justify-center overflow-hidden bg-surface-900 border-r border-white/5 order-last lg:order-first">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-900/40 via-transparent to-primary-900/30"></div>
        
        {/* Animated Orbs */}
        <motion.div 
          animate={{ x: [0, 30, 0], y: [0, -40, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-1/3 left-1/4 w-80 h-80 bg-primary-600/10 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ x: [0, -50, 0], y: [0, 20, 0] }}
          transition={{ duration: 18, repeat: Infinity }}
          className="absolute bottom-1/3 right-1/4 w-[450px] h-[450px] bg-accent-600/10 rounded-full blur-[120px]"
        />

        <div className="relative z-10 max-w-lg text-center px-12">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="mb-12 inline-block"
          >
            <div className="w-24 h-24 rounded-[2.5rem] bg-surface-800 border border-white/10 flex items-center justify-center shadow-2xl">
              <KeyRound className="w-12 h-12 text-primary-400" />
            </div>
          </motion.div>
          
          <h2 className="text-5xl font-black text-white mb-6 tracking-tight leading-[0.9]">
            Secure your <br/><span className="gradient-text italic">session</span>.
          </h2>
          <p className="text-xl text-surface-400 font-medium leading-relaxed">
            Enter your credentials to manage your spots and bookings with total peace of mind.
          </p>
        </div>
      </div>

      {/* Right Side: Form Wrap */}
      <div className="relative z-10 flex items-center justify-center p-6 md:p-12 mesh-bg-dark">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-10 lg:text-right">
            <Link to="/" className="inline-flex items-center gap-3 mb-8 group lg:flex-row-reverse">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                <span className="font-display font-black text-xl text-white">P</span>
              </div>
              <span className="font-display font-black text-2xl text-white tracking-tight italic">ParkFlow</span>
            </Link>
            <h1 className="text-4xl font-black text-white mb-3">Welcome Back</h1>
            <p className="text-surface-400 font-medium">Continue your journey with us.</p>
          </div>

          <div className="glass-dark rounded-[2.5rem] p-8 md:p-10 border border-white/5 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input label="Email Address" type="email" icon={Mail} placeholder="name@company.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required className="!bg-white/[0.03]" />
              <Input label="Access Password" type="password" icon={Lock} placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required className="!bg-white/[0.03]" />
              
              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary-500 focus:ring-primary-500/20" />
                  <span className="text-sm font-bold text-surface-500 group-hover:text-surface-300 transition-colors">Stay Signed In</span>
                </label>
                <a href="#" className="text-sm font-bold text-primary-400 hover:text-primary-300 transition-colors">Forgot Password?</a>
              </div>

              <Button type="submit" loading={loading} className="w-full !rounded-2xl py-4" size="lg">
                Authenticate
                <ShieldCheck className="w-5 h-5 ml-2" />
              </Button>
            </form>

            <div className="mt-10 pt-8 border-t border-white/5 text-center">
              <p className="text-sm font-bold text-surface-500">
                New to the platform?{' '}
                <Link to="/register" className="text-primary-400 hover:text-primary-300 ml-1 transition-colors">Create Account</Link>
              </p>
            </div>

            {/* Demo Accounts */}
            <div className="mt-8 p-6 rounded-3xl bg-white/[0.02] border border-white/5">
              <p className="text-[10px] font-black text-surface-600 uppercase tracking-widest text-center mb-4">Quick Access Demo</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { email: 'amit@parkflow.com', label: 'USER' },
                  { email: 'rajesh@parkflow.com', label: 'OWNER' },
                  { email: 'admin@parkflow.com', label: 'ADMIN' },
                ].map(({ email, label }) => (
                  <button key={email} type="button" onClick={() => setForm({ email, password: 'password123' })}
                    className="text-[10px] font-black py-2 rounded-xl bg-white/5 hover:bg-primary-500/10 text-surface-400 hover:text-primary-400 border border-white/5 hover:border-primary-500/20 transition-all">
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

