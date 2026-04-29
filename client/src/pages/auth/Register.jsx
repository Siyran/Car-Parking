import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, User, Car, MapPin, ArrowRight } from 'lucide-react';
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
        toast.success('Account created successfully!');
        navigate(form.role === 'owner' ? '/owner/onboarding' : '/search');
      }
    } catch (err) {
      toast.error('Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent-600 rounded-full blur-[120px]" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white tracking-tight mb-3">Join ParkFlow</h1>
          <p className="text-surface-500 text-sm">Create an account to start managing your parking</p>
        </div>

        <div className="bg-surface-900/50 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5">
              {['user', 'owner'].map(role => (
                <button key={role} type="button" onClick={() => setForm({...form, role})}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${form.role === role ? 'bg-primary-600 text-white shadow-glow' : 'text-surface-500 hover:text-white'}`}>
                  {role === 'user' ? <Car className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                  {role === 'user' ? 'Driver' : 'Owner'}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-surface-500 uppercase tracking-widest ml-1">Full Name</label>
                <Input type="text" icon={User} placeholder="John Doe" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-surface-500 uppercase tracking-widest ml-1">Email Address</label>
                <Input type="email" icon={Mail} placeholder="john@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-surface-500 uppercase tracking-widest ml-1">Password</label>
                <Input type="password" icon={Lock} placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full py-4 text-sm font-bold gap-2">
              Sign Up <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-sm text-surface-500">
              Already have an account?
              <Link to="/login" className="text-primary-400 hover:text-white ml-2 font-semibold transition-colors">Login</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
