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
      
      {/* 1. Dynamic Ambience (Mesh Glow) */}
      <div className="absolute inset-0 z-0 overflow-hidden rounded-[3rem]">
        <div className="absolute inset-0 bg-linear-to-t from-black via-surface-950 to-primary-600/10 opacity-60" />
        <div className="absolute inset-0 map-grid opacity-10" />
        
        {/* Pulsing Core Glow */}
        <motion.div 
           animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.1, 1] }}
           transition={{ duration: 4, repeat: Infinity }}
           className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[120px]"
        />
      </div>

      {/* 2. Automated Smart Barrier */}
      <motion.div 
        style={{ opacity: gateOpacity }}
        className="absolute inset-x-0 top-[35%] z-30 h-1 flex items-center justify-center"
      >
        <div className="w-full max-w-[600px] relative flex items-center">
           <div className="absolute left-[-20px] z-40 w-16 h-16 glass-dark border border-white/10 rounded-2xl flex items-center justify-center shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-black border border-white/5 flex items-center justify-center p-2 relative">
                 <Cpu className="w-full h-full text-primary-500 opacity-60" />
                 <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
              </div>
           </div>

           <div className="w-full h-4 relative ml-8 flex items-center">
              <motion.div 
                style={{ rotate: gateRotate, transformOrigin: 'left center' }}
                className="w-full h-2 bg-linear-to-r from-surface-800 via-primary-500 to-primary-900 rounded-full border border-primary-500/20 relative shadow-2xl"
              >
                  <div className="absolute top-1/2 -translate-y-1/2 right-4 w-1/2 h-[1px] bg-white opacity-20 blur-[1px]" />
              </motion.div>
           </div>
        </div>
      </motion.div>

      {/* 3. The Pro-Logic Vehicle (Redesigned) */}
      <motion.div
        style={{ y: carY, scale: carScale, transformPerspective: 1200 }}
        className="relative z-20 w-[140px] h-[260px] pointer-events-none"
      >
        <div className="w-full h-full relative">
           <div className="absolute inset-0 bg-black/60 blur-3xl rounded-[3.5rem] transform translate-y-8 scale-110" />

           {/* High-Fidelity Car Body */}
           <svg viewBox="0 0 140 260" className="w-full h-full drop-shadow-[0_40px_60px_rgba(0,0,0,0.9)]">
              <defs>
                 <linearGradient id="bodyMesh" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="50%" stopColor="#0f172a" />
                    <stop offset="100%" stopColor="#1e293b" />
                 </linearGradient>
                 <mask id="carMask">
                    <rect width="140" height="260" rx="45" fill="white" />
                 </mask>
              </defs>

              <rect width="140" height="260" rx="45" fill="url(#bodyMesh)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              
              {/* Windshield & Roof */}
              <rect x="25" y="75" width="90" height="110" rx="20" fill="#020617" stroke="rgba(59,130,246,0.2)" strokeWidth="0.5" />
              <path d="M30 80 Q 70 70, 110 80 L110 95 L30 95 Z" fill="rgba(255,255,255,0.03)" />
              
              {/* Headlights (Neon Glow) */}
              <motion.rect 
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 3, repeat: Infinity }}
                x="20" y="10" width="30" height="6" rx="3" fill="#3b82f6" className="shadow-glow" 
              />
              <motion.rect 
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 3, repeat: Infinity }}
                x="90" y="10" width="30" height="6" rx="3" fill="#3b82f6" className="shadow-glow" 
              />

              {/* Taillights */}
              <rect x="25" y="244" width="25" height="6" rx="3" fill="#ef4444" opacity="0.8" />
              <rect x="90" y="244" width="25" height="6" rx="3" fill="#ef4444" opacity="0.8" />
           </svg>

           {/* Interactive Sensing HUD */}
           <motion.div 
             style={{ opacity: scannerOpacity, scale: scannerScale }}
             className="absolute inset-[-60px] border border-primary-500/20 rounded-[5rem] z-50 pointer-events-none flex items-center justify-center backdrop-blur-[1px]"
           >
              <div className="w-full h-[1px] bg-primary-400 absolute top-[20%] animate-scan shadow-[0_0_20px_#3b82f6]" />
           </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
