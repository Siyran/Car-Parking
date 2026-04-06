import { motion, useMotionValue, useTransform, useSpring, useScroll } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Target, Shield, MapPin, ParkingCircle, CreditCard, Star, Clock, Info, ShieldCheck, Globe, Cpu, Smartphone, BarChart3, ChevronDown, History } from 'lucide-react';
import HeroCar from '../components/animations/HeroCar';
import Button from '../components/ui/Button';
import { useRef, useMemo } from 'react';

export default function Home() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  
  // 1. Scroll-Based 3D Physics
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.85]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroRotateX = useTransform(scrollYProgress, [0, 0.2], [0, 15]);
  
  // 2. Premium Mouse Tracking (Apple-Style Weight)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Softer spring for that "heavy" hardware feel
  const springConfig = { damping: 40, stiffness: 120, restDelta: 0.001 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothMouseY, [-400, 400], [7, -7]);
  const rotateY = useTransform(smoothMouseX, [-400, 400], [-7, 7]);

  // Dynamic Glare (Specular Highlight)
  const glareX = useTransform(smoothMouseX, [-400, 400], ["-20%", "120%"]);
  const glareY = useTransform(smoothMouseY, [-400, 400], ["-20%", "120%"]);

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(event.clientX - centerX);
    mouseY.set(event.clientY - centerY);
  };

  const floatingIcons = useMemo(() => [
    { Icon: ShieldCheck, top: '20%', left: '10%', delay: 0 },
    { Icon: Globe, top: '65%', left: '8%', delay: 1 },
    { Icon: Cpu, top: '15%', right: '15%', delay: 0.5 },
    { Icon: Smartphone, top: '75%', right: '12%', delay: 1.5 },
  ], []);

  const revealVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div ref={containerRef} className="bg-surface-950 selection:bg-primary-500 relative overflow-hidden flex flex-col" onMouseMove={handleMouseMove}>
      
      {/* Background Layer (Fixed) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '100px 100px' }}></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-600/10 blur-[180px] rounded-full animate-pulse" />
        <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-accent-600/5 blur-[150px] rounded-full" />
      </div>

      {/* 1. HERO SECTION (Apple Product Reveal) */}
      <section className="relative min-h-[100vh] flex flex-col items-center justify-center pt-24 pb-20 px-6 z-20">
        <motion.div 
          style={{ 
            scale: heroScale, 
            opacity: heroOpacity,
            rotateX: heroRotateX,
            perspective: 1200 
          }}
          className="max-w-[1440px] mx-auto w-full grid lg:grid-cols-2 gap-16 items-center"
        >
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-10 relative z-30"
          >
            <div className="inline-flex items-center gap-4 px-6 py-2 rounded-full glass-dark border border-white/10 text-primary-400 text-[10px] font-black tracking-[0.5em] uppercase">
              <span className="w-2 h-2 rounded-full bg-primary-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] animate-pulse" />
              Next-Generation Mobility Hub
            </div>

            <h1 className="text-8xl md:text-[10rem] font-black tracking-tighter leading-[0.75] italic uppercase text-white">
              The <br />
              <span className="gradient-text italic text-glow block mt-4">Future</span>
              <span className="block mt-4">Is Static.</span>
            </h1>

            <p className="text-xl text-surface-400 max-w-lg font-medium leading-relaxed opacity-80">
              India's first modular parking architecture. Experience millisecond precision in slot allocation and decentralized verified security.
            </p>

            <div className="flex flex-wrap gap-8 pt-4">
              <Button size="lg" className="!rounded-[2rem] px-14 py-10 text-lg font-black italic uppercase tracking-[0.2em] shadow-glow transform hover:scale-105 active:scale-95 transition-all group overflow-hidden relative" onClick={() => navigate('/search')}>
                 <span className="relative z-10 flex items-center gap-3">
                   Discover Spots <ArrowRight className="w-6 h-6 group-hover:translate-x-3 transition-transform" />
                 </span>
                 <div className="absolute inset-0 bg-linear-to-r from-primary-400 to-accent-400 opacity-0 group-hover:opacity-20 transition-opacity" />
              </Button>
              <Button variant="outline" size="lg" className="!rounded-[2rem] px-14 py-10 text-lg font-black italic uppercase tracking-[0.2em] border-white/20 hover:bg-white/5 hover:border-primary-500/50 backdrop-blur-sm" onClick={() => navigate('/register?role=owner')}>
                Host Node
              </Button>
            </div>
          </motion.div>

          {/* Core 3D Visual with Physics-Tilt */}
          <motion.div 
            style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
            className="relative h-[600px] flex items-center justify-center group/hero"
          >
            {/* Dynamic Glare Overlay */}
            <motion.div 
              style={{ left: glareX, top: glareY }}
               className="absolute w-[150%] h-[150%] bg-linear-to-br from-white/10 to-transparent blur-[120px] pointer-events-none opacity-0 group-hover/hero:opacity-100 transition-opacity duration-1000 -z-10"
            />
            
            <div className="absolute inset-0 bg-primary-600/10 blur-[150px] pointer-events-none rounded-full animate-pulse" />
            
            <motion.div 
              className="relative z-10 w-full"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            >
              <HeroCar />
            </motion.div>

            {/* Floating Info Snippets */}
            <motion.div 
               style={{ translateZ: 100 }}
               className="absolute top-[10%] right-[10%] glass border border-white/10 p-5 rounded-2xl shadow-2xl backdrop-blur-xl hidden md:block"
            >
              <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-1">Latency</p>
              <p className="text-2xl font-black text-white italic tracking-tighter">&lt; 15ms</p>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div 
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-30"
        >
          <ChevronDown className="w-8 h-8 text-white" />
        </motion.div>
      </section>

      {/* 2. THE INFRASTRUCTURE (Apple Gallery Style) */}
      <section className="py-40 px-6 z-10">
        <div className="max-w-[1440px] mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={revealVariants}
            className="text-center max-w-3xl mx-auto mb-32 space-y-6"
          >
            <h2 className="text-7xl md:text-[8rem] font-black tracking-tighter leading-[0.8] italic uppercase text-white">
              Premium <span className="gradient-text">Hardware</span>. <br />
              Smarter <span className="underline decoration-primary-500/50 decoration-8 underline-offset-8">Software</span>.
            </h2>
            <p className="text-xl text-surface-400 font-medium">A frictionless interface designed for the next century of transport.</p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-10">
            {[
              { icon: Cpu, title: "CORE PROCESSOR", desc: "Our slot-matching algorithm handles 5,000+ requests per second with atomic precision.", accent: "primary" },
              { icon: ShieldCheck, title: "VERIFIED TRUST", desc: "Every spot is physically audited and cryptographically secured in our network.", accent: "emerald" },
              { icon: Zap, title: "UNIFIED SETTLEMENT", desc: "Instant P2P payments via Direct UPI (GPay) with built-in refund intelligence.", accent: "amber" }
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 1 }}
                viewport={{ once: true }}
                className="group relative h-[450px] rounded-[3.5rem] p-12 border border-white/5 glass-dark overflow-hidden transition-all duration-700 hover:border-primary-500/40 hover:-translate-y-2"
              >
                <div className={`absolute top-0 right-0 w-40 h-40 bg-${f.accent}-500/10 blur-[80px] pointer-events-none group-hover:bg-${f.accent}-500/20 transition-colors`} />
                
                <div className="h-full flex flex-col justify-end space-y-6 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-12 duration-500">
                    <f.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase">{f.title}</h3>
                  <p className="text-surface-400 font-medium leading-relaxed max-w-xs">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SCROLL-REVEAL SHOWCASE (Product Storytelling) */}
      <section className="py-40 px-6 bg-linear-to-b from-transparent to-black/20">
        <div className="max-w-[1440px] mx-auto grid lg:grid-cols-2 gap-32 items-center">
           <motion.div 
             initial={{ opacity: 0, x: -50 }}
             whileInView={{ opacity: 1, x: 0 }}
             transition={{ duration: 1 }}
             viewport={{ once: true }}
             className="relative rounded-[3rem] overflow-hidden group shadow-2xl"
           >
              <div className="absolute inset-0 bg-primary-600/20 mix-blend-overlay group-hover:opacity-0 transition-opacity duration-1000" />
              <img 
                src="https://images.unsplash.com/photo-1621929747188-0b4dc284980c?q=80&w=2832&auto=format&fit=crop" 
                alt="Architecture" 
                className="w-full h-[600px] object-cover transition-transform duration-[3s] group-hover:scale-110"
              />
              <div className="absolute inset-0 p-12 flex flex-col justify-end bg-linear-to-t from-black/80 via-black/20 to-transparent">
                  <div className="w-12 h-12 rounded-full glass border border-white/20 flex items-center justify-center mb-6">
                    <History className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-4xl font-black text-white italic uppercase tracking-tighter">Verified Network</h4>
                  <p className="text-surface-300 font-medium mt-2">Connecting 5,000+ slots across India's metros.</p>
              </div>
           </motion.div>

           <div className="space-y-16">
              {[
                { title: "Universal Integration", icon: Globe, desc: "Designed to sync with India's diverse UPI-led payment landscape and urban infrastructure." },
                { title: "Atomic Verification", icon: Cpu, desc: "Real-time verification of space occupancy and user identity across all hub nodes." },
                { title: "Direct Settlement", icon: CreditCard, desc: "Peer-to-Peer settlement to your personal ID ensure zero commission leakage." }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex gap-10 items-start group"
                >
                   <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-primary-500/50 transition-colors">
                     <item.icon className="w-7 h-7 text-primary-400 group-hover:text-primary-300 transition-colors" />
                   </div>
                   <div className="space-y-3 pt-2">
                     <h5 className="text-2xl font-black text-white italic uppercase tracking-tighter">{item.title}</h5>
                     <p className="text-surface-450 font-medium leading-relaxed max-w-sm">{item.desc}</p>
                   </div>
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* Final Call to Hub */}
      <section className="py-60 px-6 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-primary-600/10 blur-[200px] opacity-40 pointer-events-none" />
        
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           className="relative z-10 space-y-12"
        >
          <h2 className="text-8xl md:text-[12rem] font-black tracking-tighter leading-[0.75] italic uppercase text-white">
            Ready To <br />
            <span className="gradient-text italic text-glow">Park?</span>
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <Button size="lg" className="!rounded-[2.5rem] px-20 py-12 text-xl font-black italic uppercase tracking-widest shadow-glow" onClick={() => navigate('/search')}>
              Launch Finder.
            </Button>
            <div className="flex flex-col items-start px-6 border-l border-white/10">
               <div className="flex -space-x-4 mb-3">
                  {[10,11,12].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-4 border-surface-950 bg-surface-900 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i}`} alt="User" />
                    </div>
                  ))}
               </div>
               <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest text-left">
                  Join 5,000+ Users <br />
                  <span className="text-white">Active in 12 Cities</span>
               </p>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
