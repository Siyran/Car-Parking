import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, Shield, Clock, Wallet, Navigation, Star, Car, ArrowRight, CheckCircle2 } from 'lucide-react';
import Button from '../components/ui/Button';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleStart = () => {
    if (!user) navigate('/register');
    else navigate(user.role === 'admin' ? '/admin' : user.role === 'owner' ? '/owner' : '/search');
  };

  return (
    <div className="min-h-screen bg-surface-50 font-sans">
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden mesh-bg">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark border-white/10 text-primary-300 text-sm font-medium mb-8 animate-fade-in shadow-2xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
            </span>
            Live in Bangalore & Mumbai
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tight leading-[1.1] animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Find Parking in <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-accent-300 to-primary-300 animate-shimmer inline-block">Seconds</span>, Not Hours.
          </h1>

          <p className="text-lg md:text-xl text-surface-300 max-w-2xl mx-auto mb-12 font-medium leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
            ParkFlow connects users with private parking spaces. Search, navigate, park, and pay seamlessly — all from your phone.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <button onClick={handleStart} className="px-8 py-4 rounded-full bg-white text-surface-950 font-bold text-lg hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden relative group">
              <span className="relative z-10">Find Parking Now</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-white via-primary-50 to-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
            <button onClick={() => navigate('/register')} className="px-8 py-4 rounded-full glass-dark text-white font-bold text-lg hover:bg-white/10 border-white/20 transition-all duration-300">
              List Your Space
            </button>
          </div>
          
          {/* Hero Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: '0.4s' }}>
            {[
              { label: 'Verified Spots', value: '5K+' },
              { label: 'Happy Users', value: '50K+' },
              { label: 'Cities', value: '12' },
              { label: 'Uptime', value: '99.9%' }
            ].map((stat, i) => (
              <div key={i} className="glass-dark rounded-2xl p-6 border-white/5 hover:border-white/20 transition-colors">
                <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                <div className="text-sm font-medium text-surface-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Floating elements animation */}
        <div className="absolute top-1/4 left-10 w-24 h-24 bg-primary-500/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-accent-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-surface-950 tracking-tight">Why Choose <span className="gradient-text">ParkFlow</span>?</h2>
            <p className="mt-4 text-lg text-surface-500 font-medium">Everything you need for a stress-free parking experience.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: MapPin, 
                title: 'Real-Time Map Search', 
                desc: 'See available spots instantly on our interactive map. Prices clearly marked.',
                color: 'from-blue-500 to-primary-600' },
              { icon: Shield, 
                title: 'Verified Security', 
                desc: 'Every space owner is KYC verified. Read real reviews before you park.',
                color: 'from-emerald-400 to-green-600' },
              { icon: Clock, 
                title: 'Pay Per Minute', 
                desc: 'Start and stop parking sessions with one tap. Only pay for the exact time used.',
                color: 'from-purple-400 to-accent-600' },
              { icon: Wallet, 
                title: 'Monthly Billing', 
                desc: 'No messy daily payments. All charges compile into one clean monthly bill.',
                color: 'from-amber-400 to-orange-500' },
              { icon: Car, 
                title: 'Any Vehicle Size', 
                desc: 'Filter spots by vehicle type - from bikes to full-size SUVs.',
                color: 'from-rose-400 to-red-600' },
              { icon: Star, 
                title: 'Earn Passive Income', 
                desc: 'Have an empty driveway? List it and earn a 60% revenue share instantly.',
                color: 'from-cyan-400 to-blue-500' }
            ].map((feature, i) => (
              <div key={i} className="bg-surface-50 rounded-3xl p-8 border border-surface-100 card-hover-effect group">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-surface-900 mb-3">{feature.title}</h3>
                <p className="text-surface-600 leading-relaxed font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div className="py-24 bg-surface-950 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-900/30 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-black mb-6">Four simple steps to <br/><span className="gradient-text">stress-free</span> parking</h2>
              <div className="space-y-8 mt-12">
                {[
                  { title: 'Search', desc: 'Open the map and find available parking spots near your destination. Filter by price or amenities.' },
                  { title: 'Navigate', desc: 'Get turn-by-turn directions directly to the parking spot using integrated Google Maps.' },
                  { title: 'Park', desc: 'Start your session with one tap when you arrive. A live timer tracks your duration.' },
                  { title: 'Go', desc: 'End session when done. Charges are automatically added to your monthly bill.' }
                ].map((step, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-surface-800 border border-surface-700 flex items-center justify-center font-display font-bold text-xl text-primary-400 group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-500 transition-all duration-300 shadow-xl">
                        0{i + 1}
                      </div>
                      {i !== 3 && <div className="absolute top-12 bottom-[-2rem] left-1/2 w-0.5 bg-gradient-to-b from-surface-700 to-transparent"></div>}
                    </div>
                    <div className="pb-8">
                      <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                      <p className="text-surface-400 font-medium leading-relaxed max-w-sm">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative lg:h-[600px] rounded-[2.5rem] overflow-hidden border-8 border-surface-800 shadow-2xl glass-dark">
               <img src="https://images.unsplash.com/photo-1548345680-f5475ea908ee?q=80&w=2073&auto=format&fit=crop" alt="App interface preview" className="w-full h-full object-cover opacity-80" />
               <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-surface-950 via-surface-900/80 to-transparent p-8">
                 <div className="glass rounded-2xl p-4 flex items-center justify-between border-white/20">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center">
                       <MapPin className="w-6 h-6 text-white" />
                     </div>
                     <div>
                       <div className="font-bold text-surface-900">MG Road Secure Parking</div>
                       <div className="text-sm font-medium text-surface-600">0.5 km away • 7 slots left</div>
                     </div>
                   </div>
                   <div className="text-right">
                     <div className="font-black text-xl text-primary-600">₹40<span className="text-sm font-normal text-surface-500">/hr</span></div>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-accent-600"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center text-white">
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Ready to Park Smarter?</h2>
          <p className="text-xl text-primary-100 mb-10 font-medium max-w-2xl mx-auto">
            Join thousands of users finding parking instantly, and owners earning passive income today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button onClick={() => navigate('/register')} className="px-8 py-4 rounded-full bg-white text-primary-600 font-bold text-lg hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all">
              Start as User
            </button>
            <button onClick={() => navigate('/register')} className="px-8 py-4 rounded-full glass border-white/30 text-white font-bold text-lg hover:bg-white/20 transition-all">
              Become an Owner
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-surface-950 border-t border-surface-800 text-surface-400 py-12 text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg">
            <span className="font-display font-bold text-xl text-white">P</span>
          </div>
        </div>
        <p className="font-medium">© 2026 ParkFlow. All rights reserved.</p>
        <p className="text-sm mt-2 text-surface-600">Built for a smarter urban future.</p>
      </footer>
    </div>
  );
}
