import { motion, useMotionValue, useTransform, useSpring, useScroll } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Target, Shield, MapPin, ParkingCircle, CreditCard, Star, Clock, Info, ShieldCheck, Globe, Cpu, Smartphone, BarChart3, ChevronDown, History } from 'lucide-react';
import HeroCar from '../components/animations/HeroCar';
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

  // Text Chapter Fades (Opacity & Y)
  const createChapterStyle = (start, end) => {
    const opacity = useTransform(experienceProgress, [start, start + 0.05, end - 0.05, end], [0, 1, 1, 0]);
    const y = useTransform(experienceProgress, [start, start + 0.05, end - 0.05, end], [40, 0, 0, -40]);
    return { opacity, y };
  };

  const ch1 = createChapterStyle(0.05, 0.25);
  const ch2 = createChapterStyle(0.3, 0.5);
  const ch3 = createChapterStyle(0.55, 0.75);
  const ch4 = createChapterStyle(0.8, 0.95);

  const handleMouseMove = (event) => {
    // Keeping a light version of mouse tilt for the static parts
  };

  const revealVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div ref={containerRef} className="bg-surface-950 selection:bg-primary-500 relative flex flex-col">
      
      {/* GLOBAL BACKGROUND INFRASTRUCTURE */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '100px 100px' }}></div>
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary-600/5 blur-[200px] rounded-full" />
        <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-accent-600/5 blur-[180px] rounded-full" />
      </div>

      {/* 1. INITIAL LANDING (High Contrast) */}
      <section className="relative h-[90vh] flex flex-col items-center justify-center px-6 z-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-center space-y-10"
        >
          <div className="inline-flex items-center gap-4 px-6 py-2 rounded-full glass-dark border border-white/5 text-primary-400 text-[10px] font-black tracking-[0.5em] uppercase mx-auto">
             NEXT-GEN MOBILITY TERMINAL
          </div>
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.9] italic uppercase text-white">
            PARKFLOW <br />
            <span className="gradient-text italic text-glow">PRO</span>
          </h1>
          <p className="text-xl text-surface-400 max-w-2xl mx-auto font-medium leading-relaxed opacity-60">
            India's most advanced autonomous parking network. Designed for precision. Engineered for trust.
          </p>
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="pt-10 opacity-30"
          >
            <ChevronDown className="w-8 h-8 text-white mx-auto" />
            <p className="text-[10px] font-black tracking-[0.4em] uppercase mt-2">Scroll To Experience</p>
          </motion.div>
        </motion.div>
      </section>

      {/* 2. THE AIRPODS STYLE STORY (Sticky 3D Experience) */}
      <section ref={experienceRef} className="relative h-[600vh] z-30">
        <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
          
          {/* THE CONTROLLED CAR HUB */}
          <div className="relative w-full max-w-[1440px] px-6 flex items-center justify-center">
             <HeroCar progress={experienceProgress} />
          </div>

          {/* TEXT CHAPTER OVERLAYS (Floating) */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
             <div className="max-w-[1440px] w-full h-full relative">
                
                {/* Chapter 1: The Descent (0.05 - 0.25) */}
                <motion.div style={ch1} className="absolute top-[20%] left-[10%] max-w-md space-y-4">
                   <h2 className="text-6xl font-black text-white italic uppercase tracking-tighter leading-none">THE <br /> DESCENT.</h2>
                   <p className="text-lg text-surface-400 font-medium border-l border-primary-500/30 pl-6 py-2">Our modular dock nodes identify your vehicle identity at 150m, prepping the bay for immediate entry.</p>
                </motion.div>

                {/* Chapter 2: The Scan (0.3 - 0.5) */}
                <motion.div style={ch2} className="absolute bottom-[20%] right-[10%] max-w-md text-right space-y-4">
                   <h2 className="text-6xl font-black text-white italic uppercase tracking-tighter leading-none">NODE <br /> SYNC.</h2>
                   <p className="text-lg text-surface-400 font-medium border-r border-primary-500/30 pr-6 py-2">Every slot is cryptographically verified. Real-time scanning ensures 100% security for your node allocation.</p>
                </motion.div>

                {/* Chapter 3: The Gate (0.55 - 0.75) */}
                <motion.div style={ch3} className="absolute top-[25%] right-[12%] max-w-md text-right space-y-4">
                   <h2 className="text-6xl font-black text-white italic uppercase tracking-tighter leading-none">PRO <br /> ACCESS.</h2>
                   <p className="text-lg text-surface-400 font-medium border-r border-accent-500/30 pr-6 py-2">Automated barriers lift via seamless digital handshake. No cards. No wait times. Just flow.</p>
                </motion.div>

                {/* Chapter 4: The Settlement (0.8 - 0.95) */}
                <motion.div style={ch4} className="absolute bottom-[15%] left-[8%] max-w-md space-y-4">
                   <h2 className="text-6xl font-black text-white italic uppercase tracking-tighter leading-none">P2P <br /> WEALTH.</h2>
                   <p className="text-lg text-surface-400 font-medium border-l border-emerald-500/30 pl-6 py-2">Transactions settle directly to host VPAs. Zero commission leakage. Maximum liquidity via Direct UPI.</p>
                </motion.div>

             </div>
          </div>
        </div>
      </section>

      {/* 3. THE INFRASTRUCTURE (Clean Grid) */}
      <section className="py-48 px-6 bg-surface-950/80 backdrop-blur-3xl z-40 border-t border-white/5">
        <div className="max-w-[1440px] mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={revealVariants}
            className="text-center max-w-4xl mx-auto mb-32 space-y-8"
          >
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.1] italic uppercase text-white">
              Smarter <span className="gradient-text">Nodes</span>. <br />
              Secure <span className="underline decoration-primary-500/30 decoration-8 underline-offset-8">Network</span>.
            </h2>
            <p className="text-xl text-surface-400 font-medium leading-relaxed max-w-3xl mx-auto">Connecting 5,000+ verified slots across India's metros with millisecond precision.</p>
          </motion.div>

          {/* Feature Mesh from Previous Step remains perfect here */}
          <div className="grid lg:grid-cols-3 gap-8">
            {[
              { icon: Cpu, title: "CORE PROCESSOR", desc: "Our proprietary slot-matching algorithm handles thousands of concurrent requests.", accent: "primary" },
              { icon: ShieldCheck, title: "TRUST PROTOCOL", desc: "Every spot is physically audited and cryptographically secured in our network.", accent: "emerald" },
              { icon: Zap, title: "INSTANT SETTLE", desc: "Direct P2P payments to host UPI IDs ensure maximum earning transparency.", accent: "amber" }
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 1 }}
                viewport={{ once: true }}
                className="group relative h-[450px] rounded-[3rem] p-12 border border-white/5 glass-dark overflow-hidden transition-all duration-700 hover:border-primary-500/40 hover:-translate-y-2"
              >
                <div className="h-full flex flex-col justify-end space-y-6 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:-rotate-12 duration-500">
                    <f.icon className="w-7 h-7 text-white opacity-60 group-hover:opacity-100" />
                  </div>
                  <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">{f.title}</h3>
                  <p className="text-surface-450 font-medium leading-[1.6] max-w-xs">{f.desc}</p>
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
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="relative z-10 space-y-12"
        >
          <div className="space-y-6">
             <h2 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.8] italic uppercase text-white">
               READY FOR <br />
               <span className="gradient-text italic text-glow">TAKEOFF?</span>
             </h2>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-12">
            <Button size="lg" className="!rounded-3xl px-16 py-11 text-xl font-black italic uppercase tracking-[0.25em] shadow-glow transform hover:scale-105 active:scale-95 transition-all" onClick={() => navigate('/search')}>
              Launch Explorer.
            </Button>
            
            <div className="flex items-center gap-8 pl-12 border-l border-white/10 group">
               <div className="flex -space-x-4">
                  {[10,11,12].map(i => (
                    <div key={i} className="w-12 h-12 rounded-2xl border-2 border-surface-950 bg-surface-900 overflow-hidden shadow-2xl">
                      <img src={`https://i.pravatar.cc/100?img=${i}`} alt="User" />
                    </div>
                  ))}
               </div>
               <div>
                  <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest text-left mb-1">PRO NETWORK</p>
                  <p className="text-base font-black text-white italic tracking-tighter text-left leading-none uppercase">5,000+ Nodes</p>
               </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
