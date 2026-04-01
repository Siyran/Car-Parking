import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, User, Sparkles, ArrowRight, ShieldCheck, Car, KeyRound, MapPin } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const success = await register(form);
      if (success) {
        toast.success('Account initialized successfully!');
        navigate(form.role === 'owner' ? '/owner/onboarding' : '/search');
      }
    } catch (err) {
      toast.error('Initialization failed. Access denied.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-surface-950 selection:bg-primary-500 overflow-hidden">
      {/* Left Side - Visual Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-16 mesh-bg-dark border-r border-white/5">
        <div className="absolute inset-0 bg-primary-600/5 blur-[120px] animate-pulse-glow" />
        
        <Link to="/" className="flex items-center gap-4 relative z-10 group">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center shadow-glow group-hover:rotate-12 transition-transform">
            <span className="font-display font-black text-2xl text-white">P</span>
          </div>
          <span className="font-display font-black text-3xl text-white tracking-tighter italic">ParkFlow</span>
        </Link>

        <div className="relative z-10 max-w-lg">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-dark border-white/10 text-primary-400 text-xs font-black mb-8 tracking-widest"
          >
            <Sparkles className="w-4 h-4" />
            VANTAGE PASS 2026
          </motion.div>
          <h1 className="text-6xl font-black text-white mb-8 tracking-tighter leading-tight">
            Secure your <span className="gradient-text italic text-glow">future</span> in urban mobility.
          </h1>
          <p className="text-xl text-surface-400 font-medium leading-relaxed italic">
            Join the elite network of smart parkers and homeowners. Precision, security, and absolute freedom.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-8 text-surface-500 text-xs font-black tracking-[0.3em] uppercase">
          <div className="flex items-center gap-2 italic"><ShieldCheck className="w-4 h-4 text-emerald-500" /> AES-256</div>
          <div className="flex items-center gap-2 italic"><KeyRound className="w-4 h-4 text-primary-500" /> Biometric Ready</div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-surface-950 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,var(--color-primary-900)_0%,transparent_100%)] opacity-20 blur-[100px]" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="mb-32 space-y-8 pt-10">
            <h2 className="text-6xl font-black text-white tracking-tighter leading-tight">Initialize <br/><span className="gradient-text italic text-glow py-2 inline-block">Account</span></h2>
            <p className="text-surface-400 font-medium italic text-2xl">Enter your credentials to begin your journey.</p>
          </div>

          <div className="glass-dark rounded-[2.5rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 blur-3xl pointer-events-none" />
            
            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              <div className="flex p-1.5 glass-morphism rounded-2xl mb-4">
                {['user', 'owner'].map(role => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setForm({...form, role})}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${form.role === role ? 'bg-primary-600 text-white shadow-glow' : 'text-surface-500 hover:text-white'}`}
                  >
                    {role === 'user' ? <Car className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                    {role}
                  </button>
                ))}
              </div>

              <div className="space-y-6">
                <Input label="Full Identity" type="text" icon={User} placeholder="John Doe" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="!bg-white/[0.03]" />
                <Input label="Digital Endpoint" type="email" icon={Mail} placeholder="name@domain.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required className="!bg-white/[0.03]" />
                <Input label="Access Protocol" type="password" icon={Lock} placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required className="!bg-white/[0.03]" />
              </div>

              <Button size="lg" className="w-full shadow-glow group" disabled={loading}>
                {loading ? 'Initializing Interface...' : 'Create Account'}
                {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </Button>

              <p className="text-center text-sm font-bold text-surface-500 italic">
                Active member? <Link to="/login" className="text-primary-400 hover:text-white transition-colors">Resume Session</Link>
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
