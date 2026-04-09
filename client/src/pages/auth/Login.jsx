import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Sparkles, ArrowRight, ShieldCheck, KeyRound, Globe, Zap, Cpu } from 'lucide-react';
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
    <div className="min-h-screen bg-surface-950 selection:bg-primary-500 overflow-hidden relative flex items-center justify-center">
      {/* Immersive Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 mesh-bg-dark opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-transparent to-surface-950" />
        
        {/* Technical Grid Overlay */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        {/* Pulsing Energy Cores */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-600 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.05, 0.15, 0.05] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-accent-600 rounded-full blur-[140px]"
        />
      </div>

      <div className="relative z-10 w-full max-w-[1240px] px-6 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left Side: Brand Narrative */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:flex flex-col space-y-10"
        >
          <div className="space-y-4">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "80px" }}
              className="h-1 bg-primary-500 rounded-full"
            />
            <h2 className="text-7xl font-black text-white italic uppercase tracking-tighter leading-[0.85]">
              Core <br />
              <span className="gradient-text italic text-glow">Infrastructure</span>
              <br /> Access.
            </h2>
          </div>

          <p className="text-xl text-surface-400 font-medium leading-relaxed max-w-md">
            Enter the ParkFlow terminal to manage your mobility assets and secure slots with millimeter precision.
          </p>

          <div className="grid grid-cols-2 gap-6 pt-10 border-t border-white/5">
             <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                   <Globe className="w-5 h-5 text-primary-400" />
                </div>
                <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest leading-none">Global Network</p>
                <p className="text-xs font-bold text-white uppercase tracking-wider">Node Sync: ACTIVE</p>
             </div>
             <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                   <Cpu className="w-5 h-5 text-accent-400" />
                </div>
                <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest leading-none">Biometric Auth</p>
                <p className="text-xs font-bold text-white uppercase tracking-wider">Security: SECURE</p>
             </div>
          </div>
        </motion.div>

        {/* Right Side: High-Contrast Terminal Form */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="glass-dark rounded-[2.5rem] p-10 border border-white/10 shadow-2xl relative overflow-hidden group hover:border-primary-500/20 transition-all duration-700">
             {/* Decorative HUD Elements */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 blur-3xl pointer-events-none group-hover:bg-primary-500/20 transition-all" />
             <div className="absolute -top-1 -right-1 w-20 h-20 border-t-2 border-r-2 border-primary-500/20 rounded-tr-3xl" />
             <div className="absolute -bottom-1 -left-1 w-20 h-20 border-b-2 border-l-2 border-accent-500/20 rounded-bl-3xl" />

             <div className="mb-12 text-center lg:text-left">
                <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-xs font-black text-primary-400 uppercase tracking-widest mb-6">
                   <KeyRound className="w-3.5 h-3.5" />
                   Session Protocol
                </div>
                <h3 className="text-4xl font-black text-white italic uppercase tracking-tight leading-none mb-4">Initialize <span className="gradient-text">Identity</span></h3>
                <p className="text-sm font-medium text-surface-500">Provide encrypted credentials to begin.</p>
             </div>

             <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-surface-500 uppercase tracking-[0.2em] ml-2">Email</label>
                      <Input type="email" icon={Mail} placeholder="name@domain.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required className="!bg-white/[0.03] !border-white/10 !rounded-2xl h-14" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-surface-500 uppercase tracking-[0.2em] ml-2">Password</label>
                      <Input type="password" icon={Lock} placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required className="!bg-white/[0.03] !border-white/10 !rounded-2xl h-14" />
                   </div>
                </div>

                <div className="flex items-center justify-between px-2">
                   <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary-500 focus:ring-primary-500/20" />
                      <span className="text-xs font-bold text-surface-500 group-hover:text-surface-300 transition-colors">Keep Logged In</span>
                   </label>
                   <a href="#" className="text-xs font-bold text-primary-400 hover:text-primary-300 transition-colors">Recover Keys?</a>
                </div>

                <Button type="submit" loading={loading} className="w-full !rounded-2xl py-6 text-sm font-black uppercase tracking-widest shadow-glow group overflow-hidden relative" size="lg">
                   <span className="relative z-10 flex items-center justify-center gap-3">
                      Login
                      <ShieldCheck className="w-5 h-5" />
                   </span>
                   <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
                </Button>
             </form>

             <div className="mt-10 pt-8 border-t border-white/5 flex flex-col items-center gap-6">
                <p className="text-xs font-bold text-surface-500">
                   New User?
                   <Link to="/register" className="text-primary-400 hover:text-primary-300 ml-2 transition-colors">Sign up</Link>
                </p>

                {/* Quick Access Demo (Visibility Optimized) */}
                <div className="w-full space-y-4">
                   <div className="flex items-center gap-4">
                      <div className="h-px flex-1 bg-white/5" />
                      <span className="text-[9px] font-black text-surface-600 uppercase tracking-widest">Demo Sandbox</span>
                      <div className="h-px flex-1 bg-white/5" />
                   </div>
                   <div className="grid grid-cols-3 gap-2">
                      {[
                        { email: 'amit@parkflow.com', label: 'DRIVE' },
                        { email: 'rajesh@parkflow.com', label: 'OWN' },
                        { email: 'admin@parkflow.com', label: 'ADMIN' },
                      ].map(({ email, label }) => (
                        <button key={email} type="button" onClick={() => setForm({ email, password: 'password123' })}
                          className="text-[9px] font-black py-2.5 rounded-xl bg-white/5 hover:bg-primary-500/10 text-surface-500 hover:text-primary-400 border border-white/10 hover:border-primary-500/30 transition-all">
                          {label}
                        </button>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
