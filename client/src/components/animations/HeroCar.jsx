import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Shield, Zap, Search, CheckCircle2, Navigation, Smartphone, MapPin, Star, Activity, Cpu, LocateFixed, Navigation2, ArrowUp } from 'lucide-react';

export default function HeroCar() {
  const [step, setStep] = useState(0); // 0: approach, 1: scanning, 2: gate lifting, 3: parking, 4: session ready

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 1500), // Start scanning
      setTimeout(() => setStep(2), 3500), // Lift gate
      setTimeout(() => setStep(3), 5000), // Drive up
      setTimeout(() => setStep(4), 7000), // Session ready
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="relative w-full max-w-[1200px] h-[750px] flex items-center justify-center overflow-visible bg-surface-950 rounded-[3rem] shadow-2xl border border-white/5">
      
      {/* 1. Inferno Gradient Background (Inspired by User Image) */}
      <div className="absolute inset-0 z-0 overflow-hidden rounded-[3rem]">
        <div className="absolute inset-0 bg-linear-to-t from-black via-surface-950 to-[#ff4d00]/30 opacity-60" />
        <div className="absolute inset-0 map-grid opacity-10" />
        
        {/* Glowing Orange Orbs (Top-Down Ambience) */}
        <motion.div 
           animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
           transition={{ duration: 8, repeat: Infinity }}
           className="absolute -top-1/4 left-1/4 w-[600px] h-[600px] bg-[#ff4d00]/20 rounded-full blur-[120px]"
        />
      </div>

      {/* 2. Top-Down Automated Smart Barrier */}
      <div className="absolute inset-x-0 top-[30%] z-30 h-1 flex items-center justify-center">
        <div className="w-full max-w-[600px] h-3 bg-surface-900 border border-white/10 relative rounded-full flex items-center">
           <motion.div 
             className={`absolute left-0 w-full h-full bg-linear-to-r from-primary-600 to-primary-900 rounded-full border border-primary-500/30 ${step >= 2 ? 'gate-open-top' : ''}`}
             style={{ transformOrigin: 'left center' }}
           >
              <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#fff_10px,#fff_20px)]" />
           </motion.div>
           {/* Terminal Scanning Light */}
           <div className="absolute left-1/2 -translate-x-1/2 -top-6">
              <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center border border-primary-500/30 shadow-glow">
                 <div className="w-4 h-4 rounded-full bg-primary-500 animate-ping" />
              </div>
           </div>
        </div>
      </div>

      {/* 3. iPhone 17 Pro Max: Aerial GPS Sync */}
      <motion.div
        initial={{ opacity: 0, x: 150, rotate: 10, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, rotate: 8, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="absolute right-[-40px] top-[140px] z-[60] w-[260px] drop-shadow-[0_40px_80px_rgba(0,0,0,0.8)]"
      >
        <div className="relative aspect-[9/19.5] w-full glass-dark rounded-[3.5rem] border-[4px] border-surface-800 p-2 shadow-2xl">
           <div className="h-full w-full rounded-[3rem] bg-black overflow-hidden flex flex-col relative px-6 py-12">
              {/* Aerial Map Layer */}
              <div className="absolute inset-0 opacity-20">
                 <svg viewBox="0 0 200 400" className="w-full h-full text-white">
                    <path d="M0 80 L200 80 M0 200 L200 200 M60 0 L60 400 M140 0 L140 400" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
                    <motion.path 
                       animate={{ strokeDashoffset: [0, -100] }}
                       transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                       d="M100 400 L100 100" 
                       stroke="var(--color-primary-500)" strokeWidth="3" fill="none" strokeDasharray="10 5"
                    />
                    <MapPin cx="100" cy="80" className="w-8 h-8 text-primary-500 fill-primary-500/20" x="90" y="60" />
                 </svg>
              </div>

              <div className="relative z-10 flex flex-col h-full pt-4">
                 <div className="flex justify-between items-start mb-10">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                       <Navigation2 className="w-6 h-6 text-primary-400 rotate-45" />
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest leading-none mb-1">Target Dock</p>
                       <h4 className="text-base font-black text-white italic uppercase tracking-tighter">NODE_42</h4>
                    </div>
                 </div>

                 <div className="mt-auto space-y-6">
                    <AnimatePresence>
                       {step >= 1 && (
                         <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                           className="glass-dark border border-white/10 rounded-2xl p-5 space-y-3"
                         >
                            <p className="text-[9px] font-black text-surface-600 uppercase tracking-widest">Docking Sync Protocol</p>
                            <p className="text-sm font-black text-white italic uppercase tracking-widest leading-none">Initialize Approach</p>
                         </motion.div>
                       )}
                    </AnimatePresence>

                    <div className="w-full h-12 rounded-xl bg-primary-600 flex items-center justify-center text-xs font-black text-white uppercase tracking-[0.2em] shadow-glow">
                       Active Session
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </motion.div>

      {/* 4. Top-Down Simple Minimalist Sedan (The Car) */}
      <motion.div
        animate={{ 
          y: step === 0 ? 380 : step === 1 ? 80 : step >= 3 ? -240 : 80,
          scale: step === 3 ? 0.95 : 1
        }}
        transition={{ 
          type: "spring", 
          stiffness: step >= 3 ? 15 : 30, 
          damping: 24,
        }}
        className="relative z-20 w-[140px] h-[260px] pointer-events-none"
      >
        <div className="w-full h-full relative">
           {/* Top-Down Car Shadow */}
           <div className="absolute inset-0 bg-black/40 blur-2xl rounded-[3rem] transform translate-y-4 scale-110" />

           {/* Sleek Top-Down Sedan SVG */}
           <svg viewBox="0 0 140 260" className="w-full h-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]">
              <defs>
                 <linearGradient id="bodyTop" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="50%" stopColor="#334155" />
                    <stop offset="100%" stopColor="#1e293b" />
                 </linearGradient>
              </defs>

              {/* Main Chassis */}
              <rect x="10" y="10" width="120" height="240" rx="40" fill="url(#bodyTop)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              
              {/* Roof & Windshields */}
              <rect x="25" y="70" width="90" height="120" rx="20" fill="#0f172a" stroke="rgba(59,130,246,0.3)" strokeWidth="0.5" />
              <path d="M30 75 Q 70 65, 110 75 L110 90 L30 90 Z" fill="rgba(255,255,255,0.05)" /> {/* Windshield reflect */}
              <path d="M30 185 Q 70 195, 110 185 L110 170 L30 170 Z" fill="rgba(255,255,255,0.05)" /> {/* Rear window reflect */}

              {/* Trunk/Hood Cut-lines */}
              <path d="M10 60 L130 60" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <path d="M10 200 L130 200" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

              {/* Headlights & Tail-lights (Top Edges) */}
              <rect x="25" y="10" width="30" height="5" rx="2" fill="white" className="shadow-glow" />
              <rect x="85" y="10" width="30" height="5" rx="2" fill="white" className="shadow-glow" />
              <rect x="25" y="245" width="25" height="5" rx="2" fill="#ef4444" className="shadow-glow" />
              <rect x="90" y="245" width="25" height="5" rx="2" fill="#ef4444" className="shadow-glow" />

              {/* Side Mirrors */}
              <rect x="-2" y="75" width="12" height="20" rx="4" fill="#1e293b" stroke="rgba(255,255,255,0.1)" />
              <rect x="130" y="75" width="12" height="20" rx="4" fill="#1e293b" stroke="rgba(255,255,255,0.1)" />
           </svg>

           {/* HUD Scanning Reticle (Aerial) */}
           <AnimatePresence>
              {step === 1 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 1.2 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-[-40px] border-2 border-primary-500/30 rounded-[4rem] z-50 pointer-events-none flex items-center justify-center backdrop-blur-[2px]"
                >
                   <div className="w-full h-px bg-primary-500 absolute hud-scan-top shadow-glow" />
                </motion.div>
              )}
           </AnimatePresence>
        </div>
      </motion.div>

      {/* 5. Central Intelligence HUD Label - REMOVED */}

    </div>
  );
}
