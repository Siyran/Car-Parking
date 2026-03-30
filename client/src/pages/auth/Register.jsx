import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Mail, Lock, User, Phone, CreditCard, Building, ParkingCircle } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-950 via-surface-900 to-primary-950 px-4 py-8">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/25">
            <ParkingCircle className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-surface-400 mt-1">{step === 1 ? 'Join ParkFlow today' : 'Owner verification details'}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 1 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-surface-700 mb-2">I want to</label>
              <div className="grid grid-cols-2 gap-3">
                {['user', 'owner'].map(role => (
                  <button key={role} type="button" onClick={() => setForm({...form, role})}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${form.role === role ? 'border-primary-500 bg-primary-50 shadow-sm' : 'border-surface-200 hover:border-surface-300'}`}>
                    {role === 'user' ? <User className="w-6 h-6 mx-auto mb-2 text-primary-600" /> : <Building className="w-6 h-6 mx-auto mb-2 text-primary-600" />}
                    <span className={`text-sm font-semibold ${form.role === role ? 'text-primary-600' : 'text-surface-600'}`}>
                      {role === 'user' ? 'Find Parking' : 'List My Space'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 ? (
              <>
                <Input label="Full Name" icon={User} placeholder="John Doe" value={form.name} onChange={set('name')} required />
                <Input label="Email" type="email" icon={Mail} placeholder="you@example.com" value={form.email} onChange={set('email')} required />
                <Input label="Phone Number" icon={Phone} placeholder="9876543210" value={form.phone} onChange={set('phone')} required />
                <Input label="Password" type="password" icon={Lock} placeholder="Min 6 characters" value={form.password} onChange={set('password')} required minLength={6} />
              </>
            ) : (
              <>
                <Input label="Aadhaar Number" icon={CreditCard} placeholder="1234-5678-9012" value={form.aadhaarNumber} onChange={set('aadhaarNumber')} required />
                <Input label="UPI ID" icon={CreditCard} placeholder="yourname@upi" value={form.upiId} onChange={set('upiId')} required />
                <button type="button" onClick={() => setStep(1)} className="text-sm text-primary-600 hover:text-primary-700 font-medium">← Back</button>
              </>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              {step === 1 && form.role === 'owner' ? 'Next: Verification' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-surface-500">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
