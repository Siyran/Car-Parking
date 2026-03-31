import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, Shield, Clock, Wallet, Star, Car, ArrowRight, ShieldCheck, Zap, Globe, Sparkles } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }
};

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const yRange = useTransform(scrollYProgress, [0, 1], [0, -100]);

  const handleStart = () => {
    if (!user) navigate('/register');
    else navigate(user.role === 'admin' ? '/admin' : user.role === 'owner' ? '/owner' : '/search');
  };

  return (
    <div className="min-h-screen bg-surface-50 font-sans selection:bg-primary-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative pt-40 pb-24 lg:pt-56 lg:pb-40 overflow-hidden mesh-bg-dark">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, 30, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary-600/20 rounded-full blur-[120px]"
          />
          <motion.div 
             animate={{ 
              scale: [1, 1.3, 1],
              x: [0, -30, 0],
              y: [0, 50, 0]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-accent-600/10 rounded-full blur-[140px]"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full glass-dark border-white/10 text-primary-300 text-sm font-black mb-10 shadow-2xl"
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            LIVE IN 12+ MAJOR CITIES
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-8xl lg:text-9xl font-black text-white mb-10 tracking-tight leading-[0.9] text-balance"
          >
            Find Parking in <br/>
            <span className="gradient-text italic">Seconds</span>, Not Hours.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-2xl text-surface-400 max-w-3xl mx-auto mb-16 font-medium leading-relaxed"
          >
            The world's most advanced parking marketplace. Connect with private space owners and secure your spot instantly.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center gap-6"
          >
            <Button size="lg" onClick={handleStart} className="group min-w-[240px]">
              Find Parking Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="secondary" onClick={() => navigate('/register')} className="min-w-[240px]">
              List Your Space
            </Button>
          </motion.div>
          
          {/* Hero Stats */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto"
          >
            {[
              { label: 'Verified Spots', value: '5K+', icon: ShieldCheck },
              { label: 'Active Users', value: '50K+', icon: Star },
              { label: 'Market Citites', value: '12', icon: Globe },
              { label: 'Uptime', value: '99.9%', icon: Zap }
            ].map((stat, i) => (
              <motion.div 
                key={i} 
                variants={itemVariants}
                className="glass-dark rounded-[2.5rem] p-8 border-white/5 hover:border-white/20 transition-all group cursor-default"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4 group-hover:bg-primary-500/20 group-hover:scale-110 transition-all duration-300">
                  <stat.icon className="w-6 h-6 text-primary-400" />
                </div>
                <div className="text-4xl font-black text-white mb-1 tabular-nums">{stat.value}</div>
                <div className="text-xs font-black text-surface-500 uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <h2 className="text-5xl md:text-7xl font-black text-surface-950 tracking-tighter mb-6">
              Parking, <span className="gradient-text italic">reinvented</span>.
            </h2>
            <p className="text-xl text-surface-500 font-medium max-w-2xl mx-auto">
              We've stripped away the complexity of urban parking to give you a seamless, one-tap experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Main Feature - Map */}
            <motion.div 
               whileHover={{ y: -10 }}
               className="lg:col-span-2 bg-surface-50 rounded-[3rem] p-12 border border-surface-100 relative overflow-hidden group shadow-sm hover:shadow-premium transition-all duration-500"
            >
              <div className="relative z-10 max-w-sm">
                <div className="w-16 h-16 rounded-3xl bg-primary-600 flex items-center justify-center mb-8 shadow-xl shadow-primary-500/20">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-4xl font-black text-surface-900 mb-6 tracking-tight">Real-Time Intelligence</h3>
                <p className="text-lg text-surface-600 font-medium font-description leading-relaxed">Experience zero-latency parking discovery. Our engine syncs with thousands of private sensors for millisecond-accurate staleness detection.</p>
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[url('https://images.unsplash.com/photo-1548345680-f5475ea908ee?q=80&w=2073&auto=format&fit=crop')] bg-cover bg-left opacity-20 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-surface-50 via-surface-50/80 to-transparent" />
            </motion.div>

            {/* Feature - Security */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-surface-900 rounded-[3rem] p-12 border border-white/5 relative overflow-hidden group shadow-2xl transition-all duration-500"
            >
              <Shield className="w-10 h-10 text-emerald-400 mb-8" />
              <h3 className="text-2xl font-black text-white mb-4">Identity Protocol</h3>
              <p className="text-surface-400 font-medium leading-relaxed">Every participant passes biometric KYC. We ensure the human behind the spot is fully verified.</p>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            </motion.div>

             {/* Feature - Pay per min */}
             <motion.div 
               whileHover={{ y: -10 }}
               className="bg-gradient-to-br from-primary-600 to-accent-600 rounded-[3rem] p-12 shadow-xl shadow-primary-500/20 relative overflow-hidden group transition-all duration-500"
            >
              <Clock className="w-10 h-10 text-white/80 mb-8" />
              <h3 className="text-2xl font-black text-white mb-4">Precision Billing</h3>
              <p className="text-white/70 font-medium leading-relaxed">Stop paying for whole hours. We charge per second, ensuring absolute fairness for every session.</p>
            </motion.div>

            {/* Bottom Row */}
            {[
              { icon: Wallet, title: 'Smart Billing', desc: 'Consolidated monthly digital invoices.', color: 'bg-surface-50' },
              { icon: Car, title: 'Any Size', desc: 'From EV bikes to full-size luxury SUVs.', color: 'bg-surface-50' },
              { icon: Star, title: 'Passive Income', desc: 'Earn steady revenue from your driveway.', color: 'bg-surface-50' }
            ].map((f, i) => (
              <motion.div 
                key={i} 
                whileHover={{ y: -5 }}
                className={`md:col-span-4 ${f.color} rounded-[3rem] p-8 border border-surface-100 shadow-sm transition-all duration-500 group`}
              >
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-sm group-hover:shadow-md transition-all">
                  <f.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-bold text-surface-900 mb-1 tracking-tight">{f.title}</h3>
                <p className="text-surface-500 text-sm font-medium leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works - Animated Timeline */}
      <section className="py-40 bg-surface-50 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl md:text-7xl font-black mb-12 tracking-tighter text-surface-950">
                Four steps to <span className="gradient-text italic">freedom</span>.
              </h2>
              <div className="space-y-12">
                {[
                  { title: 'Discover', desc: 'Browse the map for verified spots near you.' },
                  { title: 'Reserve', desc: 'Secure your spot with a single tap.' },
                  { title: 'Drive', desc: 'Native navigation guides you perfectly to the stall.' },
                  { title: 'Done', desc: 'Auto-exit and pay. No gates, no tickets, no hassle.' }
                ].map((step, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-8 group"
                  >
                    <div className="relative">
                      <div className="w-14 h-14 rounded-[1.25rem] bg-white border-2 border-surface-200 flex items-center justify-center font-display font-black text-2xl text-surface-400 group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-500 transition-all duration-500 shadow-sm overflow-hidden">
                        <span className="relative z-10">{i + 1}</span>
                        <div className="absolute inset-0 bg-primary-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                      </div>
                      {i !== 3 && <div className="absolute top-16 bottom-[-3rem] left-1/2 w-[1px] bg-surface-200" />}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-surface-900 mb-2 group-hover:text-primary-600 transition-colors duration-300">{step.title}</h3>
                      <p className="text-lg text-surface-500 font-medium max-w-sm">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
               initial={{ opacity: 0, scale: 0.8 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               style={{ y: yRange }}
               className="relative lg:h-[800px] rounded-[4rem] overflow-hidden border-[16px] border-surface-900 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] mesh-bg-dark ring-4 ring-white shadow-2xl"
            >
               <img src="https://images.unsplash.com/photo-1548345680-f5475ea908ee?q=80&w=2073&auto=format&fit=crop" alt="App interface" className="w-full h-full object-cover opacity-50 mix-blend-screen" />
               <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-surface-950 via-surface-900/60 to-transparent p-12">
                 <motion.div 
                   initial={{ y: 50, opacity: 0 }}
                   whileInView={{ y: 0, opacity: 1 }}
                   className="glass rounded-3xl p-8 flex items-center justify-between border-white/20 shadow-2xl"
                 >
                   <div className="flex items-center gap-6">
                     <div className="w-16 h-16 rounded-[1.5rem] bg-primary-600 flex items-center justify-center shadow-lg">
                       <MapPin className="w-8 h-8 text-white" />
                     </div>
                     <div>
                       <div className="font-black text-2xl text-surface-900">Secure Parking A1</div>
                       <div className="text-base font-bold text-surface-500 uppercase tracking-widest mt-1">Available Now • 4 Slots</div>
                     </div>
                   </div>
                   <div className="text-right">
                     <div className="font-black text-3xl text-primary-600">₹40<span className="text-sm font-bold text-surface-400">/hr</span></div>
                   </div>
                 </motion.div>
               </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-40 overflow-hidden">
        <div className="absolute inset-0 bg-surface-950">
           <div className="absolute inset-0 bg-gradient-to-br from-primary-900/50 to-accent-900/50" />
           <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,var(--color-primary-500)_0%,transparent_70%)] opacity-20 blur-[100px]"
           />
        </div>
        <div className="max-w-5xl mx-auto px-4 relative z-10 text-center text-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-6xl md:text-8xl font-black mb-10 tracking-tighter leading-[0.9]">
              Ready to <span className="gradient-text italic">evolve</span>?
            </h2>
            <p className="text-2xl text-surface-400 mb-16 font-medium max-w-2xl mx-auto leading-relaxed">
              Join the future of urban mobility. More than 50,000 users are already saving hours every week.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Button size="lg" className="min-w-[240px]" onClick={() => navigate('/register')}>Start Parking</Button>
              <Button size="lg" variant="secondary" className="min-w-[240px]" onClick={() => navigate('/register')}>List Your Space</Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-950 border-t border-white/5 py-24 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-12 flex justify-center">
            <Link to="/" className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-[1.5rem] bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center shadow-2xl">
                <span className="font-display font-black text-2xl text-white">P</span>
              </div>
              <span className="font-display font-black text-3xl text-white tracking-tighter">ParkFlow</span>
            </Link>
          </div>
          
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 mb-12">
           {['About', 'Privacy', 'Terms', 'Help', 'Cities', 'Security'].map(link => (
             <a key={link} href="#" className="text-sm font-black text-surface-500 hover:text-white transition-colors uppercase tracking-[0.2em]">{link}</a>
           ))}
          </div>

          <p className="font-bold text-surface-600">© 2026 ParkFlow Technologies. Building the smarter urban future.</p>
        </div>
      </footer>
    </div>
  );
}

