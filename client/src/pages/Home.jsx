import { motion, useMotionValue, useTransform, useSpring, useScroll } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Target, Shield, MapPin, ParkingCircle, CreditCard, Star, Clock, Info, ShieldCheck, Globe, Cpu, Smartphone, BarChart3, ChevronDown, History, Activity, Radio, Cpu as Chip, Lock, Signal } from 'lucide-react';
import HeroCar from '../components/animations/HeroCar';
import MobileInterface from '../components/animations/MobileInterface';
import Button from '../components/ui/Button';
import { useRef, useMemo, useState, useEffect } from 'react';

export default function Home() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const experienceRef = useRef(null);
  const [isBooted, setIsBooted] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsBooted(true), 800);
    return () => clearTimeout(timer);
  }, []);
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

  // Dynamic Background Hue Shift (Blue -> Purple -> Teal -> Orange)
  const bgHue = useTransform(
    experienceProgress,
    [0, 0.25, 0.5, 0.75, 1],
    [
      "radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.1) 0px, transparent 50%)",
      "radial-gradient(at 100% 0%, rgba(139, 92, 246, 0.12) 0px, transparent 50%)",
      "radial-gradient(at 100% 100%, rgba(20, 184, 166, 0.1) 0px, transparent 50%)",
      "radial-gradient(at 0% 100%, rgba(249, 115, 22, 0.1) 0px, transparent 50%)",
      "radial-gradient(at 50% 50%, rgba(59, 130, 246, 0.1) 0px, transparent 50%)"
    ]
  );

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

  const revealVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.3 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, filter: 'blur(10px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div ref={containerRef} className="bg-surface-950 selection:bg-primary-500 relative flex flex-col">
      
      {/* GLOBAL BACKGROUND INFRASTRUCTURE */}
      <motion.div style={{ backgroundImage: bgHue }} className="fixed inset-0 z-0 pointer-events-none transition-colors duration-[1.5s]">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '120px 120px' }}></div>
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary-600/10 blur-[200px] rounded-full" />
        <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-accent-600/10 blur-[180px] rounded-full" />
        
        {/* Dynamic Scanning Line */}
        <motion.div 
           style={{ top: scanY }}
           className="absolute left-0 w-full h-[1px] bg-linear-to-r from-transparent via-primary-500/40 to-transparent z-10 blur-[1px]"
        />
      </motion.div>

      {/* 1. INITIAL LANDING (High-Fidelity Introduction) */}
      <section className="relative h-screen flex flex-col items-center justify-center px-6 z-20 overflow-hidden">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate={isBooted ? "visible" : "hidden"}
          className="text-center space-y-16"
        >
          <div className="space-y-4 flex flex-col items-center">
             <div className="text-mask">
                <motion.h1 
                  variants={itemVariants} 
                  className="text-[12vw] md:text-[8vw] font-black tracking-tighter leading-[0.8] italic uppercase text-white"
                >
                  PARKFLOW
                </motion.h1>
             </div>
             <div className="text-mask">
                <motion.h1 
                  variants={itemVariants} 
                  className="text-[12vw] md:text-[8vw] font-black tracking-tighter leading-[0.8] italic uppercase text-outline"
                >
                  <span className="gradient-text italic text-glow pb-4 inline-block">THE PRO LOGIC.</span>
                </motion.h1>
             </div>
          </div>

          <motion.div variants={itemVariants} className="space-y-8">
            <p className="text-lg md:text-xl text-surface-400 max-w-2xl mx-auto font-medium leading-relaxed opacity-80 uppercase tracking-[0.1em]">
              India's first autonomous parking protocol. <br />
              Precision finding. Instant earning. Zero friction.
            </p>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-4">
              <Button size="lg" className="!rounded-full px-12 py-7 text-sm font-black uppercase tracking-[0.2em] shadow-glow" onClick={() => navigate('/search')}>
                 Launch App
              </Button>
              <Button variant="ghost" className="text-[10px] font-black uppercase tracking-[0.4em] text-surface-500 hover:text-white transition-colors">
                 Explore Network_Report
              </Button>
            </div>
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-20 flex flex-col items-center"
          >
            <p className="text-[9px] font-black tracking-[0.6em] uppercase mb-4 text-white">Initiate_Scroll</p>
            <div className="w-[1px] h-20 bg-linear-to-b from-white to-transparent" />
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

          {/* TEXT CHAPTER OVERLAYS (Floating) */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
             <div className="max-w-[1440px] w-full h-full relative">
                
                {/* Chapter 1: Arrival (0.05 - 0.25) */}
                <motion.div style={{ opacity: ch1Opacity, y: ch1Y }} className="absolute top-[20%] left-[10%] max-w-md space-y-6">
                   <div className="flex items-center gap-4 text-primary-500 mb-2">
                     <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse shadow-glow" />
                     <span className="text-[10px] font-black tracking-widest uppercase">Arrival_Detection</span>
                   </div>
                   <h2 className="text-7xl font-black text-white italic uppercase tracking-tighter leading-[0.9]">SEAMLESS <br /> ARRIVAL.</h2>
                   <p className="text-lg text-surface-400 font-medium border-l border-white/10 pl-8 ml-2 py-2">The system identifies your vehicle identity at 150m, prepping your reserved slot for immediate entry.</p>
                </motion.div>

                {/* Chapter 2: Finding (0.3 - 0.5) */}
                <motion.div style={{ opacity: ch2Opacity, y: ch2Y }} className="absolute bottom-[20%] right-[10%] max-w-md text-right space-y-6">
                   <div className="flex items-center gap-4 text-accent-500 mb-2 justify-end">
                     <span className="text-[10px] font-black tracking-widest uppercase">Verified_Link</span>
                     <div className="w-2 h-2 rounded-full bg-accent-500 shadow-glow-accent" />
                   </div>
                   <h2 className="text-7xl font-black text-white italic uppercase tracking-tighter leading-[0.9]">AUTOMATIC <br /> FINDING.</h2>
                   <p className="text-lg text-surface-400 font-medium border-r border-white/10 pr-8 mr-2 py-2">Real-time GPS nodes guide you to the exact coordinates of your spot. No more circling the block.</p>
                </motion.div>

                {/* Chapter 3: Unlocking (0.55 - 0.75) */}
                <motion.div style={{ opacity: ch3Opacity, y: ch3Y }} className="absolute top-[25%] right-[12%] max-w-md text-right space-y-6">
                   <div className="flex items-center gap-4 text-teal-400 mb-2 justify-end">
                     <span className="text-[10px] font-black tracking-widest uppercase">System_Action</span>
                     <Activity className="w-5 h-5" />
                   </div>
                   <h2 className="text-7xl font-black text-white italic uppercase tracking-tighter leading-[0.9]">SMART <br /> UNLOCKING.</h2>
                   <p className="text-lg text-surface-400 font-medium border-r border-white/10 pr-8 mr-2 py-2">Automated barriers lift via a secure digital handshake. No cards. No wait times. Just flow.</p>
                </motion.div>

                {/* Chapter 4: Earnings (0.8 - 0.95) */}
                <motion.div style={{ opacity: ch4Opacity, y: ch4Y }} className="absolute bottom-[15%] left-[8%] max-w-md space-y-6">
                   <div className="flex items-center gap-4 text-orange-400 mb-2">
                     <Smartphone className="w-5 h-5" />
                     <span className="text-[10px] font-black tracking-widest uppercase">Direct_Settlement</span>
                   </div>
                   <h2 className="text-7xl font-black text-white italic uppercase tracking-tighter leading-[0.9]">DIRECT <br /> EARNINGS.</h2>
                   <p className="text-lg text-surface-400 font-medium border-l border-white/10 pl-8 ml-2 py-2">Payments settle instantly from user to host. Zero commission leakage. Maximum liquidity via Direct UPI.</p>
                </motion.div>

             </div>
          </div>
        </div>
      </section>

      {/* 2. THE MISSION (About Us / Logic) */}
      <section className="py-48 px-6 bg-surface-950 relative z-40">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-32 items-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="relative aspect-square md:aspect-video rounded-[3rem] overflow-hidden border border-white/10 group"
            >
              <img 
                src="https://images.unsplash.com/photo-1573344697920-ca9810842e20?q=80&w=2938&auto=format&fit=crop" 
                alt="Modern Cityscape" 
                className="w-full h-full object-cover grayscale opacity-40 group-hover:scale-110 group-hover:grayscale-0 transition-all duration-[4s]" 
              />
              <div className="absolute inset-0 bg-linear-to-t from-surface-950 via-transparent to-transparent" />
              <div className="absolute bottom-12 left-12 space-y-4">
                 <p className="text-[10px] font-black tracking-[0.4em] uppercase text-primary-400">Our_Core_Mission</p>
                 <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter">REDESIGNING <br /> URBAN FLOW.</h3>
              </div>
            </motion.div>

            <div className="space-y-12">
               <motion.div
                 initial={{ opacity: 0, x: 30 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 className="space-y-6"
               >
                 <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter leading-tight">
                    BUILT FOR THE <br />
                    <span className="gradient-text italic">NEXT DECADE.</span>
                 </h2>
                 <p className="text-xl text-surface-400 font-medium leading-relaxed opacity-70">
                    We didn't just build a parking app. We built an autonomous protocol that turns unused space into a high-yield asset network.
                 </p>
               </motion.div>

               <div className="grid sm:grid-cols-2 gap-10">
                  {[
                    { label: "01", title: "Smart Sourcing", desc: "Finding every hidden space in the city through advanced GPS logic." },
                    { label: "02", title: "Direct Value", desc: "Eliminating middle-man fees so hosts earn 100% of their space's worth." }
                  ].map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="space-y-4">
                       <span className="text-sm font-black text-primary-500 font-mono tracking-widest">{item.label}</span>
                       <h4 className="text-xl font-black text-white italic uppercase tracking-tighter">{item.title}</h4>
                       <p className="text-sm text-surface-500 font-medium leading-relaxed">{item.desc}</p>
                    </motion.div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE APP SHOWCASE (Interface Terminal) */}
      <section className="py-48 px-6 bg-surface-950 relative z-40 overflow-hidden border-t border-white/5">
        <div className="max-w-[1440px] mx-auto grid lg:grid-cols-2 gap-32 items-center">
           
           {/* LEFT: THE INTERFACE */}
           <motion.div 
             initial={{ opacity: 0, x: -60 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 1 }}
             className="flex justify-center"
           >
              <MobileInterface />
           </motion.div>

           {/* RIGHT: THE APP FEATURES */}
           <div className="space-y-16">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                 <h2 className="text-6xl font-black text-white italic uppercase tracking-tighter leading-[0.9]">
                    THE PRO <br />
                    <span className="gradient-text">TERMINAL.</span>
                 </h2>
                 <p className="text-xl text-surface-400 font-medium leading-relaxed max-w-xl opacity-70">
                    A millisecond-precision interface designed for absolute earning transparency and autonomous management.
                 </p>
              </motion.div>

              <div className="grid sm:grid-cols-2 gap-12 pt-8">
                 {[
                   { icon: Lock, title: "BANK SECURITY", desc: "Encrypted handshake protocols for every peer-to-peer session." },
                   { icon: Activity, title: "INSTANT SYNC", desc: "Real-time response across our entire city-wide parking network." },
                   { icon: Radio, title: "UPI SETTLEMENT", desc: "Funds move directly to your account with zero commission leakage." },
                   { icon: Signal, title: "ACCURATE GPS", desc: "Finding your allocated spot with perfect coordinate precision." }
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

      {/* 4. THE INFRASTRUCTURE (Feature Grid) */}
      <section className="py-48 px-6 bg-surface-950/90 backdrop-blur-3xl z-40 border-t border-white/5">
        <div className="max-w-[1440px] mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto mb-24 space-y-8"
          >
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase text-white">
              GLOBAL <span className="gradient-text">COVERAGE</span>. <br />
              VERIFIED <span className="underline decoration-primary-500/30 decoration-8 underline-offset-8">DEMAND</span>.
            </h2>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-10">
            {[
              { 
                icon: Globe, title: "URBAN SCALE", desc: "Our network connects thousands of prime locations in major metro hubs.",
                img: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2940&auto=format&fit=crop"
              },
              { 
                icon: ShieldCheck, title: "IRONCLAD TRUST", desc: "Every spot and vehicle is verified through our proprietary safety logic.",
                img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2940&auto=format&fit=crop"
              },
              { 
                icon: Zap, title: "INSTANT LIQUIDITY", desc: "Earnings are available for withdrawal the moment your session concludes.",
                img: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=2940&auto=format&fit=crop"
              }
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group relative h-[450px] rounded-[3.5rem] overflow-hidden border border-white/5 card-hover-premium"
              >
                <div className="absolute inset-0 z-0">
                  <img src={f.img} alt={f.title} className="w-full h-full object-cover transition-transform duration-[4s] group-hover:scale-110 opacity-20 grayscale" />
                  <div className="absolute inset-0 bg-linear-to-t from-surface-950 via-surface-950/40 to-transparent" />
                </div>

                <div className="h-full flex flex-col justify-end p-12 relative z-10 space-y-6 text-left">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl">
                    <f.icon className="w-6 h-6 text-white opacity-60" />
                  </div>
                  <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">{f.title}</h3>
                  <p className="text-sm text-surface-400 font-medium leading-relaxed opacity-60">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FINAL CALL (Live Network Stats) */}
      <section className="py-60 px-6 text-center relative overflow-hidden bg-black">
        <div className="absolute inset-0 bg-radial-at-center from-primary-600/10 to-transparent opacity-40" />
        
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           className="relative z-10 space-y-16"
        >
          <div className="space-y-8 flex flex-col items-center">
             <h2 className="text-6xl md:text-8xl font-black tracking-tighter italic uppercase text-white">
                READY TO <span className="gradient-text italic">LAUNCH?</span>
             </h2>
             <div className="flex flex-col md:flex-row gap-12 pt-8">
                {[
                  { val: "5K+", label: "Verified Nodes" },
                  { val: "12MS", label: "Network Latency" },
                  { val: "₹0", label: "Entry Fees" }
                ].map((s, i) => (
                  <div key={i} className="text-center">
                     <p className="text-5xl font-black text-white italic tracking-tighter mb-1">{s.val}</p>
                     <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest">{s.label}</p>
                  </div>
                ))}
             </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <Button size="lg" className="!rounded-full px-16 py-8 text-xl font-black italic uppercase tracking-[0.2em] shadow-glow transform hover:scale-105 transition-all" onClick={() => navigate('/search')}>
              Find Your Spot
            </Button>
            <Button variant="ghost" className="text-sm font-black italic uppercase tracking-[0.2em] text-surface-500 hover:text-white" onClick={() => navigate('/register')}>
               Become a Host
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
