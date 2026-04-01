import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, Shield, Clock, Wallet, Star, Car, ArrowRight, ShieldCheck, Zap, Globe, Sparkles, Navigation } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Button from '../components/ui/Button';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const yRange = useTransform(scrollYProgress, [0, 1], [0, -120]);

  const handleStart = () => {
    if (!user) navigate('/register');
    else navigate(user.role === 'admin' ? '/admin' : user.role === 'owner' ? '/owner' : '/search');
  };

  return (
    <div className="min-h-screen bg-surface-950 font-sans selection:bg-primary-500 selection:text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-20 pb-20 mesh-bg-dark border-b border-white/5">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 15, repeat: Infinity }}
            className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] bg-primary-600/20 rounded-full blur-[140px]"
          />
          <motion.div 
            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute -bottom-[20%] -left-[10%] w-[80%] h-[80%] bg-accent-600/10 rounded-full blur-[160px]"
          />
        </div>

        <div className="container mx-auto px-10 relative z-10 text-center flex flex-col items-center gap-20">
          <div className="flex flex-col items-center gap-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass-dark border-white/10 text-primary-400 text-xs font-black tracking-[0.2em] shadow-glow"
            >
              <div className="w-2 h-2 rounded-full bg-primary-500 animate-ping" />
              LIVE IN 12+ CITIES
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white tracking-tighter leading-[1.2] max-w-5xl mx-auto"
            >
              Find Parking in <br/>
              <span className="gradient-text italic text-glow py-2 inline-block">Seconds</span>, Not Hours.
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-surface-400 max-w-2xl mx-auto font-medium leading-relaxed"
            >
              The world's most advanced parking infrastructure. Connect with verified owners and secure your spot with real-time intelligence.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center gap-6"
            >
              <Button size="lg" onClick={handleStart} className="group px-10 shadow-glow hover:shadow-primary-500/40 min-w-[240px]">
                Find Parking Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="secondary" onClick={() => navigate('/register')} className="px-10 border-white/10 hover:bg-white/5 min-w-[240px]">
                List Your Space
              </Button>
            </motion.div>
          </div>
          
          {/* Hero Stats */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="w-full stable-grid max-w-6xl mx-auto pt-20 border-t border-white/5"
          >
            {[
              { label: 'Verified Spots', value: '5K+', icon: ShieldCheck, color: 'text-emerald-400' },
              { label: 'Active Users', value: '50K+', icon: Star, color: 'text-amber-400' },
              { label: 'Cities Covered', value: '12', icon: Globe, color: 'text-primary-400' },
              { label: 'Platform Uptime', value: '99.9%', icon: Zap, color: 'text-accent-400' }
            ].map((stat, i) => (
              <motion.div 
                key={i} 
                variants={itemVariants}
                className="glass-dark rounded-[2.5rem] p-10 border border-white/5 group hover:border-primary-500/30 transition-all duration-500"
              >
                <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                  <stat.icon className={`w-7 h-7 ${stat.color}`} />
                </div>
                <div className="text-5xl font-black text-white mb-2 tabular-nums tracking-tighter">{stat.value}</div>
                <div className="text-xs font-black text-surface-500 uppercase tracking-[0.2em]">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="section-padding bg-surface-950 relative">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mb-24"
          >
            <h2 className="text-white mb-6 tracking-tighter">
              Parking, <span className="gradient-text italic text-glow">reinvented</span> for the elite.
            </h2>
            <p className="text-xl text-surface-400 font-medium leading-relaxed">
              We've engineered a zero-friction marketplace to solve urban congestion through biometric security and real-time sensor fusion.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Featured Feature */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="lg:col-span-8 h-[500px] rounded-[3rem] p-12 border border-white/5 relative overflow-hidden group mesh-bg-dark"
            >
              <div className="relative z-20 h-full flex flex-col justify-between">
                <div className="w-20 h-20 rounded-3xl bg-primary-600 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                  <Navigation className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-5xl font-black text-white mb-6 tracking-tighter">Real-Time Sensor Fusion</h3>
                  <p className="text-xl text-surface-400 font-medium max-w-xl leading-relaxed">Our engine connects with city infrastructure to provide millisecond-accurate availability data directly to your dashboard.</p>
                </div>
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-full lg:w-2/3 bg-[url('https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80')] bg-cover opacity-20 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700 mix-blend-overlay" />
              <div className="absolute inset-0 bg-gradient-to-r from-surface-950 via-surface-950/60 to-transparent z-10" />
            </motion.div>

            {/* Side Feature */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="lg:col-span-4 h-[500px] rounded-[3rem] p-12 border border-white/5 relative overflow-hidden group bg-surface-900 shadow-2xl"
            >
              <div className="relative z-20 h-full flex flex-col justify-between">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                  <ShieldCheck className="w-9 h-9 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white mb-4 tracking-tighter">Biometric Security</h3>
                  <p className="text-lg text-surface-500 font-medium leading-relaxed">Identity verification at every step. Total peace of mind for both owners and users.</p>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-700" />
            </motion.div>

            {/* Row Feature 1 */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="lg:col-span-4 rounded-[3rem] p-10 border border-white/5 bg-surface-900 group"
            >
              <Clock className="w-10 h-10 text-primary-400 mb-8" />
              <h3 className="text-2xl font-black text-white mb-4 tracking-tighter">Precision Billing</h3>
              <p className="text-lg text-surface-500 font-medium leading-relaxed">No more hourly rounding. We charge per second for absolute fairness in every transaction.</p>
            </motion.div>

            {/* Row Feature 2 */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="lg:col-span-4 rounded-[3rem] p-10 border border-white/10 bg-primary-600 group shadow-glow"
            >
              <Zap className="w-10 h-10 text-white mb-8" />
              <h3 className="text-2xl font-black text-white mb-4 tracking-tighter">Instant Reservation</h3>
              <p className="text-lg text-white/80 font-medium leading-relaxed">Tap and go. Your spot is held instantly with zero delay or manual confirmation needed.</p>
            </motion.div>

            {/* Row Feature 3 */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="lg:col-span-4 rounded-[3rem] p-10 border border-white/5 bg-surface-900 group"
            >
              <Wallet className="w-10 h-10 text-accent-400 mb-8" />
              <h3 className="text-2xl font-black text-white mb-4 tracking-tighter">Direct Payouts</h3>
              <p className="text-lg text-surface-500 font-medium leading-relaxed">Owners receive revenue instantly via automated escrow protocols. No weekly waits.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="section-padding bg-surface-900 border-y border-white/5 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-white mb-16 tracking-tighter">
                Designed for the <span className="italic gradient-text text-glow-accent">modern</span> commute.
              </h2>
              <div className="space-y-16">
                {[
                  { title: 'Search', desc: 'Interactive high-fidelity map of verified slots.' },
                  { title: 'Secure', desc: 'Digital handshake between owner and user.' },
                  { title: 'Navigate', desc: 'Turn-by-turn guidance to the exact stall.' }
                ].map((step, i) => (
                  <div key={i} className="flex gap-10 group">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-3xl text-surface-600 group-hover:border-primary-500 transition-all duration-500">
                        {i + 1}
                      </div>
                      {i !== 2 && <div className="absolute top-20 bottom-[-4rem] left-1/2 w-[1px] bg-white/10" />}
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-white mb-3 group-hover:text-primary-400 transition-colors">{step.title}</h3>
                      <p className="text-xl text-surface-500 font-medium">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               style={{ y: yRange }}
               className="relative lg:h-[700px] rounded-[4rem] overflow-hidden border-[12px] border-surface-950 shadow-2xl glass-dark"
            >
               <img src="https://images.unsplash.com/photo-1548345680-f5475ea908ee?auto=format&fit=crop&q=80" alt="Interface" className="w-full h-full object-cover opacity-50 mix-blend-screen" />
               <div className="absolute inset-0 bg-gradient-to-tr from-primary-900/40 via-transparent to-accent-900/20" />
               <div className="absolute bottom-12 inset-x-12">
                 <div className="glass p-8 rounded-3xl border-white/20 shadow-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center">
                          <MapPin className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <p className="text-surface-900 font-black text-2xl">Verified Slot A4</p>
                          <p className="text-surface-500 font-bold uppercase tracking-widest text-xs mt-1 italic">Active Reservation</p>
                        </div>
                      </div>
                    </div>
                 </div>
               </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-48 overflow-hidden bg-surface-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-primary-900)_0%,transparent_100%)] opacity-30" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-white mb-10 tracking-tighter leading-none">
              The future of <span className="gradient-text italic text-glow">mobility</span> starts here.
            </h2>
            <p className="text-2xl text-surface-400 mb-16 font-medium max-w-3xl mx-auto italic">
              "Finally, a parking app that feels like it was built in 2026." — Tech Insider
            </p>
            <div className="flex flex-wrap justify-center gap-8">
              <Button size="lg" className="px-12 shadow-glow" onClick={() => navigate('/register')}>Join ParkFlow</Button>
              <Button size="lg" variant="secondary" className="px-12 border-white/10 hover:bg-white/5" onClick={() => navigate('/register')}>Explore Spaces</Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-950 border-t border-white/5 py-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <Link to="/" className="flex items-center gap-4 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                <span className="font-display font-black text-2xl text-white">P</span>
              </div>
              <span className="font-display font-black text-3xl text-white tracking-tighter italic">ParkFlow</span>
            </Link>
            
            <div className="flex flex-wrap justify-center gap-10">
              {['Contact', 'Security', 'Legal', 'Privacy'].map(link => (
                <a key={link} href="#" className="text-xs font-black text-surface-600 hover:text-white transition-colors uppercase tracking-[0.3em]">{link}</a>
              ))}
            </div>
          </div>
          <div className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm font-bold text-surface-600">© 2026 ParkFlow Technologies.</p>
            <div className="flex items-center gap-8 text-surface-600 text-xs font-black tracking-widest">
              <span>ISO 27001</span>
              <span>PCI-DSS</span>
              <span>GDPR</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}


