import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Mail, Lock, User, Phone, CreditCard, Building, Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') || 'user';

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '',
    role: defaultRole, aadhaarNumber: '', upiId: ''
  });
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1 && form.role === 'owner') {
      setStep(2);
      return;
    }
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Welcome to ParkFlow, ${user.name}!`);
      navigate(user.role === 'owner' ? '/owner' : '/search');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-surface-950 selection:bg-primary-500 overflow-hidden">
      {/* Left Side: Form Wrap */}
      <div className="relative z-10 flex items-center justify-center p-6 md:p-12 mesh-bg-dark">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-10">
            <Link to="/" className="inline-flex items-center gap-3 mb-8 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                <span className="font-display font-black text-xl text-white">P</span>
              </div>
              <span className="font-display font-black text-2xl text-white tracking-tight italic">ParkFlow</span>
            </Link>
            <h1 className="text-4xl font-black text-white mb-3">Create your account</h1>
            <p className="text-surface-400 font-medium">Join the next generation of parking.</p>
          </div>

          <div className="glass-dark rounded-[2.5rem] p-8 md:p-10 border border-white/5 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-6"
                  >
                    {/* Role Selector */}
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { id: 'user', label: 'I want to park', icon: User },
                        { id: 'owner', label: 'I want to host', icon: Building }
                      ].map(role => (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => setForm({...form, role: role.id})}
                          className={`
                            relative group p-4 rounded-2xl border-2 transition-all duration-300 text-center
                            ${form.role === role.id ? 'border-primary-500 bg-primary-500/10' : 'border-surface-800 hover:border-surface-700 bg-white/5'}
                          `}
                        >
                          <role.icon className={`w-6 h-6 mx-auto mb-2 transition-colors ${form.role === role.id ? 'text-primary-400' : 'text-surface-500'}`} />
                          <span className={`text-xs font-black uppercase tracking-tighter ${form.role === role.id ? 'text-white' : 'text-surface-500'}`}>
                            {role.label}
                          </span>
                        </button>
                      ))}
                    </div>

                    <Input label="Name" icon={User} placeholder="John Doe" value={form.name} onChange={set('name')} required className="!bg-white/[0.03]" />
                    <Input label="Email" type="email" icon={Mail} placeholder="you@domain.com" value={form.email} onChange={set('email')} required className="!bg-white/[0.03]" />
                    <Input label="Phone" icon={Phone} placeholder="Primary contact" value={form.phone} onChange={set('phone')} required className="!bg-white/[0.03]" />
                    <Input label="Password" type="password" icon={Lock} placeholder="Secure key" value={form.password} onChange={set('password')} required minLength={6} className="!bg-white/[0.03]" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary-500/20 text-primary-400 text-xs font-bold mb-2">
                       <ShieldCheck className="w-4 h-4" /> OWNER VERIFICATION
                    </div>
                    <Input label="Aadhaar ID" icon={CreditCard} placeholder="12-digit number" value={form.aadhaarNumber} onChange={set('aadhaarNumber')} required className="!bg-white/[0.03]" />
                    <Input label="UPI Address" icon={CreditCard} placeholder="username@bank" value={form.upiId} onChange={set('upiId')} required className="!bg-white/[0.03]" />
                    <button type="button" onClick={() => setStep(1)} className="text-sm font-bold text-surface-500 hover:text-white transition-colors underline underline-offset-4">← Return to basic info</button>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button type="submit" loading={loading} className="w-full !rounded-2xl py-4" size="lg">
                {step === 1 && form.role === 'owner' ? 'Next: Verification' : 'Finalize Account'}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </form>

            <div className="mt-10 pt-8 border-t border-white/5 text-center">
              <p className="text-sm font-bold text-surface-500">
                Member of ParkFlow?{' '}
                <Link to="/login" className="text-primary-400 hover:text-primary-300 ml-1 transition-colors">Sign In Now</Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side: Visual Graphic */}
      <div className="hidden lg:flex relative items-center justify-center overflow-hidden bg-surface-900 border-l border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/40 via-transparent to-accent-900/30"></div>
        
        {/* Floating circles */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-accent-600/10 rounded-full blur-[140px] animate-pulse-glow"></div>

        <div className="relative z-10 max-w-lg text-center px-12">
          <motion.div 
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="mb-12"
          >
            <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 flex items-center justify-center mx-auto shadow-2xl shadow-primary-500/40">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
          </motion.div>
          
          <h2 className="text-5xl font-black text-white mb-6 tracking-tight leading-[0.9]">
            The smarter way <br/>to move in the <span className="gradient-text italic">city</span>.
          </h2>
          
          <div className="space-y-6 mt-12 text-left">
            {[
              "Join 50,000+ active parkers.",
              "Access verified private slots.",
              "Encrypted real-time payments."
            ].map((text, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + (i * 0.1) }}
                className="flex items-center gap-4 group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary-500/20 transition-colors shadow-lg">
                  <CheckCircle2 className="w-6 h-6 text-primary-400" />
                </div>
                <span className="text-xl font-bold text-surface-300">{text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

