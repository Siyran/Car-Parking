import { motion, AnimatePresence, useTransform, useSpring } from 'framer-motion';
import { Shield, Zap, Search, CheckCircle2, Navigation, Smartphone, MapPin, Star, Activity, Cpu, LocateFixed, Navigation2, ArrowUp } from 'lucide-react';

export default function HeroCar({ progress = 0 }) {
  // Smooth out the incoming raw progress for high-fidelity 'weighted' transitions
  const smoothProgress = useSpring(progress, { damping: 40, stiffness: 100 });

  // 1. Car Movement (Y mapping)
  // Progress 0 -> 0.2: Drive to Gate
  // Progress 0.2 -> 0.6: Wait at Gate
  // Progress 0.6 -> 1.0: Drive to Slot
  const carY = useTransform(smoothProgress, [0, 0.2, 0.6, 1], [380, 80, 80, -240]);
  const carScale = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [1, 1, 1, 0.95]);

  // 2. Gate Opening (Progress 0.4 -> 0.6)
  const gateRotate = useTransform(smoothProgress, [0.4, 0.55], [0, -95]);
  const gateOpacity = useTransform(smoothProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);

  // 3. Scanner Visibility (Progress 0.2 -> 0.4)
  const scannerOpacity = useTransform(smoothProgress, [0.2, 0.25, 0.35, 0.4], [0, 1, 1, 0]);
  const scannerScale = useTransform(smoothProgress, [0.2, 0.4], [1.2, 0.9]);

  // 4. iPhone Interface (Progress 0.1 -> 0.9)
  const iphoneX = useTransform(smoothProgress, [0, 0.15, 0.85, 1], [150, 0, 0, 150]);
  const iphoneOpacity = useTransform(smoothProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
  const iphoneRotate = useTransform(smoothProgress, [0.1, 0.9], [10, 5]);

  return (
    <div className="relative w-full max-w-[1200px] h-[750px] flex items-center justify-center overflow-visible bg-surface-950 rounded-[3rem] shadow-2xl border border-white/5">
      
      {/* 1. Inferno Gradient Background (Inspired by User Image) */}
      <div className="absolute inset-0 z-0 overflow-hidden rounded-[3rem]">
        <div className="absolute inset-0 bg-linear-to-t from-black via-surface-950 to-[#ff4d00]/30 opacity-60" />
        <div className="absolute inset-0 map-grid opacity-10" />
        
        {/* Glowing Orange Orbs (Top-Down Ambience) */}
        <motion.div 
           style={{ opacity: useTransform(smoothProgress, [0, 0.5, 1], [0.3, 0.5, 0.3]) }}
           className="absolute -top-1/4 left-1/4 w-[600px] h-[600px] bg-[#ff4d00]/20 rounded-full blur-[120px]"
        />
      </div>

      {/* 2. Top-Down Automated Smart Barrier Assembly */}
      <motion.div 
        style={{ opacity: gateOpacity }}
        className="absolute inset-x-0 top-[30%] z-30 h-1 flex items-center justify-center"
      >
        <div className="w-full max-w-[600px] relative flex items-center">
           {/* THE PILLAR (Grounded Terminal) */}
           <div className="absolute left-[-20px] z-40 w-16 h-16 bg-surface-900 border border-white/10 rounded-2xl flex items-center justify-center shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-black border border-white/5 flex items-center justify-center p-2 relative group overflow-hidden">
                 <div className="absolute inset-0 bg-primary-500/5 animate-pulse" />
                 <Cpu className="w-full h-full text-primary-500 opacity-60" />
                 
                 {/* Internal Status Indicator */}
                 <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
              </div>

              {/* External Terminal Scanning Light (Attached to Pillar) */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center border border-primary-500/20 shadow-glow relative">
                   <div className="w-3 h-3 rounded-full bg-primary-500 animate-ping" />
                   <div className="absolute inset-0 w-full h-full border border-primary-500/30 rounded-full animate-pulse" />
                </div>
              </div>
           </div>

           {/* THE ROTATING BARRIER ARM */}
           <div className="w-full h-4 bg-transparent relative ml-8 flex items-center">
              <motion.div 
                style={{ 
                  rotate: gateRotate,
                  transformOrigin: 'left center' 
                }}
                className="w-full h-3 bg-linear-to-r from-surface-800 via-primary-600 to-primary-900 rounded-full border border-primary-500/30 relative shadow-2xl overflow-hidden"
              >
                 {/* Industrial Warning Tape Pattern */}
                 <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#fff_10px,#fff_20px)]" />
                 
                 {/* LED Strip along the Arm */}
                 <div className="absolute top-1/2 -translate-y-1/2 right-4 w-1/2 h-[1px] bg-primary-400 opacity-40 blur-[1px]" />
                 
                 {/* Mechanical Pivot Joint */}
                 <div className="absolute left-[-2px] inset-y-0 w-4 bg-surface-950 border-r border-white/10" />
              </motion.div>
           </div>
        </div>
      </motion.div>

      {/* 4. Top-Down Car (The Controller Car) */}
      <motion.div
        style={{ 
          y: carY,
          scale: carScale,
          transformPerspective: 1000
        }}
        className="relative z-20 w-[140px] h-[260px] pointer-events-none"
      >
        <div className="w-full h-full relative">
           {/* Shadow */}
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

              <rect x="10" y="10" width="120" height="240" rx="40" fill="url(#bodyTop)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              <rect x="25" y="70" width="90" height="120" rx="20" fill="#0f172a" stroke="rgba(59,130,246,0.3)" strokeWidth="0.5" />
              <path d="M30 75 Q 70 65, 110 75 L110 90 L30 90 Z" fill="rgba(255,255,255,0.05)" />
              <path d="M30 185 Q 70 195, 110 185 L110 170 L30 170 Z" fill="rgba(255,255,255,0.05)" />

              <path d="M10 60 L130 60" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <path d="M10 200 L130 200" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

              <rect x="25" y="10" width="30" height="5" rx="2" fill="white" />
              <rect x="85" y="10" width="30" height="5" rx="2" fill="white" />
              <rect x="25" y="245" width="25" height="5" rx="2" fill="#ef4444" />
              <rect x="90" y="245" width="25" height="5" rx="2" fill="#ef4444" />

              <rect x="-2" y="75" width="12" height="20" rx="4" fill="#1e293b" stroke="rgba(255,255,255,0.1)" />
              <rect x="130" y="75" width="12" height="20" rx="4" fill="#1e293b" stroke="rgba(255,255,255,0.1)" />
           </svg>

           {/* HUD Scanning Reticle (Aerial) */}
           <motion.div 
             style={{ 
               opacity: scannerOpacity, 
               scale: scannerScale 
             }}
             className="absolute inset-[-40px] border-2 border-primary-500/30 rounded-[4rem] z-50 pointer-events-none flex items-center justify-center backdrop-blur-[2px]"
           >
              <div className="w-full h-px bg-primary-500 absolute hud-scan-top shadow-glow" />
           </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
