import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Target, Shield, MapPin, ParkingCircle, CreditCard, Star, Clock, Info } from 'lucide-react';
import ThreeCar from '../components/animations/ThreeCar';
import Tilt from 'react-parallax-tilt';
import Button from '../components/ui/Button';

export default function Home() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <div className="pt-32 min-h-screen bg-surface-950 selection:bg-primary-500 relative overflow-hidden flex flex-col perspective-1000" style={{ transformStyle: 'preserve-3d' }}>
      
      {/* Hero Section */}
      <section className="relative min-h-[100vh] flex items-center justify-center pt-40 pb-20 mesh-bg-dark border-b border-white/5">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
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

        <div className="max-w-[1440px] mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-16 items-center relative z-10 transition-all">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-12"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass-dark border border-white/10 text-primary-400 text-xs font-black tracking-[0.2em] uppercase">
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
              Next-Gen Parking Space Network
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-7xl md:text-8xl font-black tracking-tighter leading-[0.85] italic uppercase">
              Find Your <br />
              <span className="gradient-text italic text-glow block mt-4">Spot In</span>
              <span className="block mt-4">Seconds.</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-xl text-surface-400 max-w-lg font-medium leading-relaxed">
              Experience the world's most advanced parking marketplace. Secure verified spots with millisecond precision and real-time biometric verification.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-6 pt-4">
              <Button size="lg" className="!rounded-2xl px-12 py-8 text-lg font-black italic uppercase tracking-widest shadow-glow group overflow-hidden relative" onClick={() => navigate('/search')}>
                 <span className="relative z-10">Get Started</span>
                 <ArrowRight className="w-6 h-6 ml-3 relative z-10 group-hover:translate-x-2 transition-transform" />
                 <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
              </Button>
              <Button variant="outline" size="lg" className="!rounded-2xl px-12 py-8 text-lg font-black italic uppercase tracking-widest border-white/10 hover:bg-white/5" onClick={() => navigate('/register?role=owner')}>
                Join Network
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div variants={itemVariants} className="flex gap-12 pt-8 border-t border-white/5">
              <div className="flex items-center gap-6">
                <div className="flex -space-x-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-surface-950 bg-surface-900 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                    </div>
                  ))}
                  <div className="w-12 h-12 rounded-full border-4 border-surface-950 bg-surface-800 flex items-center justify-center text-[10px] font-black">+5K</div>
                </div>
                <div>
                  <p className="text-xs font-black text-white italic uppercase tracking-wider">Active slots across India</p>
                  <p className="text-[10px] font-bold text-surface-500 uppercase tracking-widest">Trusted by thousands of drivers daily</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            className="relative h-[650px] w-full xl:w-[120%] xl:-ml-[10%] flex items-center justify-center p-8 glass-dark rounded-[3.5rem] border border-white/10 shadow-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-primary-500/5 blur-[120px] pointer-events-none rounded-full" />
            <ThreeCar />
          </motion.div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="section-padding bg-surface-950 relative overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-3 gap-12">
            {[
              { icon: MapPin, title: "PRECISION PINNING", desc: "Our proprietary algorithm locates spots with centimeter-level accuracy using GPS + computer vision.", accent: "primary" },
              { icon: Shield, title: "INFRASTRUCTURE TRUST", desc: "Every spot in our network undergoes rigorous physical and digital security verification before listing.", accent: "accent" },
              { icon: Zap, title: "REAL-TIME SYNC", desc: "Experience zero latency. Find, reserve, and park with instant synchronization across the entire network.", accent: "emerald" }
            ].map((feature, i) => (
              <Tilt
                key={i}
                tiltMaxAngleX={10}
                tiltMaxAngleY={10}
                perspective={1000}
                scale={1.02}
                transitionSpeed={1500}
                className="h-full"
              >
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="h-full glass-dark p-10 rounded-[2.5rem] border border-white/5 hover:border-primary-500/20 group transition-all duration-700 shadow-xl"
                >
                  <div className={`w-16 h-16 rounded-3xl mb-8 flex items-center justify-center transition-transform group-hover:scale-110 duration-500 bg-${feature.accent}-500/10 shadow-inner`}>
                    <feature.icon className={`w-8 h-8 text-${feature.accent}-500`} />
                  </div>
                  <h3 className="text-3xl font-black mb-4 tracking-tighter italic uppercase">{feature.title}</h3>
                  <p className="text-surface-400 font-medium leading-relaxed">{feature.desc}</p>
                </motion.div>
              </Tilt>
            ))}
          </div>
        </div>
      </section>

      {/* Features Detail Section */}
      <section className="section-padding relative">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
           <div className="flex flex-col items-center text-center mb-24 max-w-3xl mx-auto space-y-6">
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="px-6 py-2 rounded-full border border-white/10 text-xs font-black tracking-[0.4em] uppercase text-surface-500"
              >
                Platform Capabilities
              </motion.div>
              <h2 className="text-6xl md:text-7xl font-black tracking-tighter leading-none italic uppercase">
                Designed for the <span className="gradient-text italic">Modern</span> Urbanist.
              </h2>
           </div>

           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: 'Spot Analytics', icon: ParkingCircle, color: 'text-primary-500' },
                { title: 'Secure Payment', icon: CreditCard, color: 'text-accent-500' },
                { title: 'Verified Ratings', icon: Star, color: 'text-amber-500' },
                { title: 'Instant Booking', icon: Clock, color: 'text-emerald-500' },
                { title: 'Targeted Search', icon: Target, color: 'text-blue-500' },
                { title: 'Market Info', icon: Info, color: 'text-purple-500' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-8 rounded-[2rem] glass border border-white/5 flex items-center gap-6 group hover:bg-white/5 transition-all cursor-default"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:rotate-12 transition-transform ${item.color}`}>
                     <item.icon className="w-7 h-7" />
                  </div>
                  <span className="text-xl font-black italic uppercase tracking-tight">{item.title}</span>
                </motion.div>
              ))}
           </div>
        </div>
      </section>
    </div>
  );
}
