import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, User, Sparkles, ArrowRight, ShieldCheck, Car, KeyRound, MapPin, Globe, Zap, Cpu } from 'lucide-react';
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
    <div className="min-h-screen bg-surface-950 selection:bg-primary-500 overflow-hidden relative flex items-center justify-center py-20">
      {/* Immersive Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 mesh-bg-dark opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-transparent to-surface-950" />
        
        {/* Technical Coordinate Overlay */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        
        {/* Pulsing Energy Gradients */}
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary-600 rounded-full blur-[140px]"
        />
        <motion.div 
          animate={{ x: [-20, 20, -20], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent-600 rounded-full blur-[120px]"
        />
      </div>

      <div className="relative z-10 w-full max-w-[1240px] px-6 grid lg:grid-cols-2 gap-20 items-center">
        {/* Left Side: Onboarding Narrative */}
        <motion.div 
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:flex flex-col space-y-12"
        >
          <div className="space-y-6">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100px" }}
              className="h-1.5 bg-accent-500 rounded-full shadow-glow"
            />
            <h1 className="text-7xl font-black text-white italic uppercase tracking-tighter leading-[0.85]">
              Network <br />
              <span className="gradient-text italic text-glow py-2 inline-block">Enrollment</span>
              <br /> Protocol.
            </h1>
          </div>

          <p className="text-xl text-surface-400 font-medium leading-relaxed max-w-lg">
            Join the elite urban mobility network. Deploy your identity to secure slots and manage infrastructure with unprecedented precision.
          </p>

          <div className="grid grid-cols-2 gap-8 pt-10 border-t border-white/5">
             <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                   <ShieldCheck className="w-6 h-6 text-emerald-400 shadow-glow" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">AES-256 Vault</p>
                   <p className="text-[10px] font-medium text-surface-500 uppercase tracking-widest leading-relaxed">Your data is stored in air-gapped security nodes.</p>
                </div>
             </div>
             <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                   <Zap className="w-6 h-6 text-primary-400 shadow-glow" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Instant Sync</p>
                   <p className="text-[10px] font-medium text-surface-500 uppercase tracking-widest leading-relaxed">Real-time availability across the entire grid.</p>
                </div>
             </div>
          </div>
        </motion.div>

        {/* Right Side: Optimized Registration Terminal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="glass-dark rounded-[3rem] p-10 border border-white/10 shadow-2xl relative overflow-hidden group hover:border-accent-500/20 transition-all duration-700">
             {/* Technical HUD Trim */}
             <div className="absolute top-0 right-0 w-36 h-36 bg-accent-500/5 blur-3xl pointer-events-none group-hover:bg-accent-500/15 transition-all" />
             <div className="absolute -top-1 -right-1 w-24 h-24 border-t-2 border-r-2 border-accent-500/20 rounded-tr-3xl" />
             <div className="absolute -bottom-1 -left-1 w-24 h-24 border-b-2 border-l-2 border-primary-500/20 rounded-bl-3xl" />

             <div className="mb-10 text-center lg:text-left">
                <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-accent-500/10 border border-accent-500/20 text-xs font-black text-accent-400 uppercase tracking-widest mb-6">
                   <Cpu className="w-3.5 h-3.5" />
                   New Node Registration
                </div>
                <h3 className="text-4xl font-black text-white italic uppercase tracking-tight leading-none mb-4">Initialize <span className="gradient-text italic">Account</span></h3>
                <p className="text-sm font-medium text-surface-500 italic">Select your operational role to begin session.</p>
             </div>

             <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                <div className="flex p-1.5 glass-dark rounded-2xl border border-white/5">
                  {['user', 'owner'].map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setForm({...form, role})}
                      className={`flex-1 flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${form.role === role ? 'bg-primary-600 text-white shadow-glow' : 'text-surface-500 hover:text-white'}`}
                    >
                      {role === 'user' ? <Car className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                      {role}
                    </button>
                  ))}
                </div>

                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-surface-500 uppercase tracking-[0.3em] ml-2">Operator Name</label>
                      <Input type="text" icon={User} placeholder="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="!bg-white/[0.03] !border-white/10 !rounded-2xl h-14" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-surface-500 uppercase tracking-[0.3em] ml-2">Network Endpoint</label>
                      <Input type="email" icon={Mail} placeholder="name@domain.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required className="!bg-white/[0.03] !border-white/10 !rounded-2xl h-14" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-surface-500 uppercase tracking-[0.3em] ml-2">Access Key Override</label>
                      <Input type="password" icon={Lock} placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required className="!bg-white/[0.03] !border-white/10 !rounded-2xl h-14" />
                   </div>
                </div>

                <Button type="submit" loading={loading} className="w-full !rounded-2xl py-6 text-sm font-black uppercase tracking-widest shadow-glow group overflow-hidden relative group" size="lg">
                   <span className="relative z-10 flex items-center justify-center gap-3">
                      {loading ? 'Initializing Core...' : 'Authorize Registration'}
                      {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                   </span>
                   <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
                </Button>
             </form>

             <div className="mt-10 pt-8 border-t border-white/5 text-center">
                <p className="text-xs font-bold text-surface-500">
                   Already In Grid?
                   <Link to="/login" className="text-primary-400 hover:text-white ml-2 transition-colors">Resume Session</Link>
                </p>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
