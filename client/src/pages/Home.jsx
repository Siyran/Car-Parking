import { motion, useMotionValue, useTransform, useSpring, useScroll } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Target, Shield, MapPin, ParkingCircle, CreditCard, Star, Clock, Info, ShieldCheck, Globe, Cpu, Smartphone, BarChart3, ChevronDown, History, Activity, Radio, Cpu as Chip, Lock, Signal } from 'lucide-react';
import HeroCar from '../components/animations/HeroCar';
import MobileInterface from '../components/animations/MobileInterface';
import Button from '../components/ui/Button';
import { useRef, useMemo } from 'react';

export default function Home() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const experienceRef = useRef(null);
  
  // 1. GLOBAL SCROLL PHYSICS
  const { scrollYProgress: globalScroll } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // 2. STICKY EXPERIENCE PHYSICS (AirPods Style)
  const { scrollYProgress: experienceProgress } = useScroll({
    target: experienceRef,
    offset: ["start start", "end end"]
  });

  // 3. OPTIMIZED BACKGROUND LAYERS (Replacing expensive string interpolation)
  const bgOpacity1 = useTransform(experienceProgress, [0, 0.25], [1, 0]);
  const bgOpacity2 = useTransform(experienceProgress, [0.15, 0.25, 0.5], [0, 1, 0]);
  const bgOpacity3 = useTransform(experienceProgress, [0.4, 0.5, 0.75], [0, 1, 0]);
  const bgOpacity4 = useTransform(experienceProgress, [0.65, 0.75, 1], [0, 1, 0.5]);
  const bgOpacity5 = useTransform(experienceProgress, [0.85, 1], [0, 1]);

  // Scanning Line Position
  const scanY = useTransform(experienceProgress, [0, 1], ["0%", "100%"]);

  // Text Chapter Fades (Opacity & Y) - FIXED: Hooks must be at top-level
  const ch1Opacity = useTransform(experienceProgress, [0.05, 0.1, 0.2, 0.25], [0, 1, 1, 0]);
  const ch1Y = useTransform(experienceProgress, [0.05, 0.1, 0.2, 0.25], [60, 0, 0, -60]);

  const ch2Opacity = useTransform(experienceProgress, [0.3, 0.35, 0.45, 0.5], [0, 1, 1, 0]);
  const ch2Y = useTransform(experienceProgress, [0.3, 0.35, 0.45, 0.5], [60, 0, 0, -60]);

  const ch3Opacity = useTransform(experienceProgress, [0.55, 0.6, 0.7, 0.75], [0, 1, 1, 0]);
  const ch3Y = useTransform(experienceProgress, [0.55, 0.6, 0.7, 0.75], [60, 0, 0, -60]);

  const ch4Opacity = useTransform(experienceProgress, [0.8, 0.85, 0.9, 0.95], [0, 1, 1, 0]);
  const ch4Y = useTransform(experienceProgress, [0.8, 0.85, 0.9, 0.95], [60, 0, 0, -60]);

  const revealVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  }), []);
 
  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.3 } }
  }), []);
 
  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 40, filter: 'blur(10px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
  }), []);

  return (
    <div ref={containerRef} className="bg-surface-950 selection:bg-primary-500 relative flex flex-col">
      
      {/* GLOBAL BACKGROUND INFRASTRUCTURE - Optimized with layers */}
      <div className="fixed inset-0 z-0 pointer-events-none transition-colors duration-[1.5s]">
         <motion.div style={{ opacity: bgOpacity1 }} className="absolute inset-0 bg-[radial-gradient(at_0%_0%,rgba(59,130,246,0.1)_0px,transparent_50%)]" />
         <motion.div style={{ opacity: bgOpacity2 }} className="absolute inset-0 bg-[radial-gradient(at_100%_0%,rgba(139,92,246,0.12)_0px,transparent_50%)]" />
         <motion.div style={{ opacity: bgOpacity3 }} className="absolute inset-0 bg-[radial-gradient(at_100%_100%,rgba(20,184,166,0.1)_0px,transparent_50%)]" />
         <motion.div style={{ opacity: bgOpacity4 }} className="absolute inset-0 bg-[radial-gradient(at_0%_100%,rgba(249,115,22,0.1)_0px,transparent_50%)]" />
         <motion.div style={{ opacity: bgOpacity5 }} className="absolute inset-0 bg-[radial-gradient(at_50%_50%,rgba(59,130,246,0.1)_0px,transparent_50%)]" />
 
         <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '100px 100px' }}></div>
         <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary-600/5 blur-[200px] rounded-full" />
         <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-accent-600/5 blur-[180px] rounded-full" />
         
         {/* Dynamic Scanning Line */}
         <motion.div 
            style={{ top: scanY, willChange: 'top' }}
            className="absolute left-0 w-full h-[2px] bg-linear-to-r from-transparent via-primary-500/20 to-transparent z-10 blur-[1px]"
         />
      </div>

      {/* 1. INITIAL LANDING (System Boot Style) */}
      <section className="relative h-[95vh] flex flex-col items-center justify-center px-6 z-20 overflow-hidden">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center space-y-12"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-4 px-6 py-2 rounded-full glass-dark border border-white/5 text-primary-400 text-[10px] font-black tracking-[0.5em] uppercase mx-auto relative group">
             <span className="absolute inset-x-0 -bottom-px h-px bg-linear-to-r from-transparent via-primary-500 to-transparent opacity-40 group-hover:opacity-100 transition-opacity" />
             NODE_INITIALIZED :: SYSTEM_ACTIVE
          </motion.div>
          
          <div className="space-y-4 flex flex-col items-center">
             <motion.h1 variants={itemVariants} className="text-6xl md:text-7xl font-black tracking-tighter leading-[0.85] italic uppercase text-white drop-shadow-2xl">
               PARKFLOW
             </motion.h1>
             <motion.h1 variants={itemVariants} className="text-6xl md:text-7xl font-black tracking-tighter leading-[0.85] italic uppercase">
               <span className="gradient-text italic text-glow pr-8 pb-4 inline-block">PRO</span>
             </motion.h1>
          </div>

          <motion.p variants={itemVariants} className="text-xl text-surface-400 max-w-3xl mx-auto font-medium leading-[1.6] opacity-60">
            India's most advanced autonomous parking network. <br className="hidden md:block" />
            Designed for precision. Engineered for trust.
          </motion.p>
          
          <motion.div 
            variants={itemVariants}
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="pt-12 opacity-30 flex flex-col items-center"
          >
            <div className="w-px h-16 bg-linear-to-b from-primary-500/50 to-transparent" />
            <p className="text-[10px] font-black tracking-[0.4em] uppercase mt-4 text-primary-400">Scroll To Engage</p>
          </motion.div>
        </motion.div>
      </section>

      {/* 2. THE AIRPODS STYLE STORY (Sticky 3D Experience) */}
      <section ref={experienceRef} className="relative h-[650vh] z-30">
        <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
          
          {/* THE CONTROLLED CAR HUB */}
          <div className="relative w-full max-w-[1440px] px-6 flex items-center justify-center">
             <HeroCar progress={experienceProgress} />
          </div>

          {/* TEXT CHAPTER OVERLAYS (Floating HUD Interface) */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-[100]">
             <div className="max-w-[1440px] w-full h-full relative">
                
                {/* Chapter 1: The Descent (Top-Left HUD) */}
                <motion.div style={{ opacity: ch1Opacity, y: ch1Y }} className="absolute top-[10%] left-8 max-w-[280px] space-y-6 glass-dark p-6 rounded-[2rem] border border-white/10 shadow-2xl backdrop-blur-2xl">
                   <div className="flex items-center gap-4 text-primary-500 mb-2">
                     <Radio className="w-4 h-4 animate-pulse" />
                     <span className="text-[10px] font-black tracking-widest uppercase">Detection Active</span>
                   </div>
                   <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">THE <br /> DESCENT.</h2>
                   <p className="text-sm text-surface-400 font-medium border-l-2 border-primary-500/40 pl-4 ml-1 py-1">Our modular dock nodes identify your vehicle identity at 150m, prepping the bay.</p>
                </motion.div>

                {/* Chapter 2: The Scan (Bottom-Right HUD) */}
                <motion.div style={{ opacity: ch2Opacity, y: ch2Y }} className="absolute bottom-[10%] right-8 max-w-[280px] text-right space-y-6 glass-dark p-6 rounded-[2rem] border border-white/10 shadow-2xl backdrop-blur-2xl">
                   <div className="flex items-center gap-4 text-accent-500 mb-2 justify-end">
                     <span className="text-[10px] font-black tracking-widest uppercase">Identity Verified</span>
                     <Chip className="w-4 h-4 " />
                   </div>
                   <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">NODE <br /> SYNC.</h2>
                   <p className="text-sm text-surface-400 font-medium border-r-2 border-accent-500/40 pr-4 mr-1 py-1">Every slot is cryptographically verified. Real-time scanning ensures 100% security.</p>
                </motion.div>

                {/* Chapter 3: The Gate (Top-Right HUD) */}
                <motion.div style={{ opacity: ch3Opacity, y: ch3Y }} className="absolute top-[10%] right-8 max-w-[280px] text-right space-y-6 glass-dark p-6 rounded-[2rem] border border-white/10 shadow-2xl backdrop-blur-2xl">
                   <div className="flex items-center gap-4 text-teal-400 mb-2 justify-end">
                     <span className="text-[10px] font-black tracking-widest uppercase">System Unlocked</span>
                     <Activity className="w-4 h-4" />
                   </div>
                   <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">PRO <br /> ACCESS.</h2>
                   <p className="text-sm text-surface-400 font-medium border-r-2 border-teal-500/40 pr-4 mr-1 py-1">Automated barriers lift via seamless digital handshake. Just flow.</p>
                </motion.div>

                {/* Chapter 4: The Settlement (Bottom-Left HUD) */}
                <motion.div style={{ opacity: ch4Opacity, y: ch4Y }} className="absolute bottom-[10%] left-8 max-w-[280px] space-y-6 glass-dark p-6 rounded-[2rem] border border-white/10 shadow-2xl backdrop-blur-2xl">
                   <div className="flex items-center gap-4 text-orange-400 mb-2">
                     <Smartphone className="w-4 h-4" />
                     <span className="text-[10px] font-black tracking-widest uppercase">Trust Secured</span>
                   </div>
                   <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">P2P <br /> WEALTH.</h2>
                   <p className="text-sm text-surface-400 font-medium border-l-2 border-orange-500/40 pl-4 ml-1 py-1">Transactions settle directly to host VPAs. Zero commission leakage.</p>
                </motion.div>

             </div>
          </div>
        </div>
      </section>

      {/* NEW: THE INTELLIGENT TERMINAL SHOWCASE */}
      <section className="py-48 px-6 bg-surface-950 relative z-40 overflow-hidden">
        <div className="max-w-[1440px] mx-auto grid lg:grid-cols-2 gap-32 items-center">
           
           {/* LEFT: THE INTERFACE */}
           <motion.div 
             initial={{ opacity: 0, x: -60 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 1, ease: "easeOut" }}
             className="flex justify-center"
           >
              <MobileInterface />
           </motion.div>

           {/* RIGHT: THE INTELLIGENCE SPECS */}
           <div className="space-y-16">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                 <div className="inline-flex items-center gap-4 px-6 py-2 rounded-full glass-dark border border-white/5 text-primary-400 text-[10px] font-black tracking-[0.4em] uppercase">
                    Digital Infrastructure_v7.4
                 </div>
                 <h2 className="text-6xl font-black text-white italic uppercase tracking-tighter leading-[0.9]">
                    THE UNIVERSAL <br />
                    <span className="gradient-text">TERMINAL.</span>
                 </h2>
                 <p className="text-xl text-surface-400 font-medium leading-relaxed max-w-xl opacity-70">
                    A millisecond-precision interface designed for absolute earning transparency and autonomous node management.
                 </p>
              </motion.div>

              <div className="grid sm:grid-cols-2 gap-12 pt-8">
                 {[
                   { icon: Lock, title: "AES-256 SYNC", desc: "Military-grade encryption for every P2P handshake protocol." },
                   { icon: Activity, title: "12MS LATENCY", desc: "Ultra-low response time across our entire nationwide node network." },
                   { icon: Radio, title: "P2P LEDGER", desc: "Real-time settlement directly to host UPI IDs with zero commission leakage." },
                   { icon: Signal, title: "99.9% INTEGRITY", desc: "Advanced detection nodes verify vehicle presence with extreme precision." }
                 ].map((spec, i) => (
                   <motion.div
                     key={i}
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     transition={{ delay: i * 0.1, duration: 0.8 }}
                     viewport={{ once: true }}
                     className="space-y-4 group"
                   >
                     <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-500 group-hover:border-primary-500/40 group-hover:bg-primary-500/5">
                       <spec.icon className="w-6 h-6 text-white opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                     </div>
                     <h4 className="text-lg font-black text-white italic uppercase tracking-tighter leading-none">{spec.title}</h4>
                     <p className="text-sm text-surface-500 font-medium leading-relaxed">{spec.desc}</p>
                   </motion.div>
                 ))}
              </div>
           </div>
        </div>
      </section>

      {/* 3. THE INFRASTRUCTURE (Image Glass Grid) */}
      <section className="py-48 px-6 bg-surface-950/90 backdrop-blur-3xl z-40 border-t border-white/5">
        <div className="max-w-[1440px] mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={revealVariants}
            className="text-center max-w-4xl mx-auto mb-24 space-y-8"
          >
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1] italic uppercase text-white">
              Intelligent <span className="gradient-text">Hardware</span>. <br />
              Verified <span className="underline decoration-primary-500/30 decoration-8 underline-offset-8">Trust</span>.
            </h2>
            <p className="text-lg text-surface-400 font-medium leading-relaxed max-w-2xl mx-auto opacity-70">Powering India's smartest parking network with autonomous node distribution.</p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-10">
            {[
              { 
                icon: Chip, title: "CORE PROCESSOR", accent: "primary", 
                img: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2940&auto=format&fit=crop",
                stats: "99.9% Uptime", meta: "LATENCY: 12ms"
              },
              { 
                icon: ShieldCheck, title: "SECURE NODES", accent: "teal", 
                img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2940&auto=format&fit=crop",
                stats: "Hardware Auth", meta: "SECURITY: AES-256"
              },
              { 
                icon: Zap, title: "P2P SETTLE", accent: "orange", 
                img: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=2940&auto=format&fit=crop",
                stats: "Instant Credit", meta: "FEE: 0%"
              }
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.15, duration: 1 }}
                viewport={{ once: true }}
                className="group relative h-[500px] rounded-[3.5rem] overflow-hidden border border-white/5 transition-all duration-700 hover:border-primary-500/40 hover:-translate-y-2"
              >
                {/* Background Image Layer */}
                <div className="absolute inset-0 z-0">
                  <img src={f.img} alt={f.title} className="w-full h-full object-cover transition-transform duration-[4s] group-hover:scale-110 opacity-30 grayscale hover:grayscale-0 transition-all" />
                  <div className="absolute inset-0 bg-surface-950/80 backdrop-blur-sm group-hover:backdrop-blur-none transition-all duration-700" />
                  <div className="absolute inset-0 bg-linear-to-t from-surface-950 via-surface-950/20 to-transparent" />
                </div>

                {/* Content Layer */}
                <div className="h-full flex flex-col justify-end p-12 relative z-10 space-y-6">
                  <div className="flex justify-between items-start mb-auto">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:-rotate-12 duration-500 backdrop-blur-xl">
                      <f.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest">{f.meta}</p>
                       <p className="text-xs font-black text-white italic uppercase tracking-tighter">{f.stats}</p>
                    </div>
                  </div>
                  <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">{f.title}</h3>
                  <div className="w-full h-px bg-white/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-700" />
                  <Button variant="ghost" className="w-fit !p-0 text-primary-400 text-[10px] font-black uppercase tracking-[0.4em] hover:text-white transition-colors">
                    View Network_Report
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CALL (Structured Closing) */}
      <section className="py-60 px-6 text-center relative overflow-hidden bg-black">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-primary-600/5 blur-[200px] opacity-40 pointer-events-none" />
        
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           className="relative z-10 space-y-16"
        >
          <div className="space-y-12 flex flex-col items-center">
             <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight italic uppercase text-white max-w-4xl mx-auto">
               READY FOR <span className="gradient-text italic text-glow pb-4 inline-block pr-4">DEPARTURE?</span>
             </h2>
             <p className="text-xl text-surface-400 max-w-2xl mx-auto font-medium leading-relaxed opacity-60">Join 5,000+ nodes already active in the network.</p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-14">
            <Button size="lg" className="!rounded-full px-12 py-6 text-lg font-black italic uppercase tracking-[0.25em] shadow-glow transform hover:scale-105 active:scale-95 transition-all" onClick={() => navigate('/search')}>
              Launch Finder.
            </Button>
            
            <div className="flex items-center gap-8 pl-14 border-l border-white/10 group">
               <div className="flex -space-x-4">
                  {[10,11,12].map(i => (
                    <div key={i} className="w-14 h-14 rounded-2xl border-2 border-surface-950 bg-surface-900 overflow-hidden shadow-2xl">
                      <img src={`https://i.pravatar.cc/100?img=${i}`} alt="User" />
                    </div>
                  ))}
               </div>
               <div className="text-left">
                  <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest mb-1">PRO NETWORK ACTIVE</p>
                  <p className="text-xl font-black text-white italic tracking-tighter leading-none uppercase">5,000+ Verified Nodes</p>
               </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
