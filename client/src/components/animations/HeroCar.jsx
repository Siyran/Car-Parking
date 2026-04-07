import { motion, AnimatePresence, useTransform, useSpring } from 'framer-motion';
import { Shield, Zap, Search, CheckCircle2, Navigation, Smartphone, MapPin, Star, Activity, Cpu, LocateFixed, Navigation2, ArrowUp, Circle } from 'lucide-react';

export default function HeroCar({ progress = 0 }) {
  // Smooth out the incoming raw progress - optimized parameters for better performance
  const smoothProgress = useSpring(progress, { damping: 50, stiffness: 90, restDelta: 0.001 });

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
 
  // 5. Barrier Indicator Logic (STOP vs ENTRY)
  const stopLightOpacity = useTransform(smoothProgress, [0.4, 0.45], [1, 0]);
  const entryLightOpacity = useTransform(smoothProgress, [0.4, 0.45], [0, 1]);
  const stopLightColor = useTransform(smoothProgress, [0, 0.45], ['#ef4444', '#1e293b']);
  const entryLightColor = useTransform(smoothProgress, [0, 0.45], ['#1e293b', '#10b981']);

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

      {/* 2. Intelligent Architectural Entry Portal & Environment */}
      <motion.div 
        style={{ opacity: gateOpacity }}
        className="absolute inset-0 z-30 pointer-events-none"
      >
        {/* Road Infrastructure & Lane Markings */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* Lane Separator / Yellow Markings */}
            <div className="absolute top-[30%] -translate-y-1/2 w-[800px] h-[6px] flex justify-between px-12">
               <div className="w-[120px] h-full bg-yellow-500/30 rounded-full blur-[1px]" />
               <div className="w-[120px] h-full bg-yellow-500/30 rounded-full blur-[1px]" />
            </div>
            
            {/* Architectural Entry Gantry - Shrunk from 800px to 700px for HUD clearance */}
            <div className="relative w-full max-w-[700px] flex flex-col items-center">
               
               {/* Overhead Beam (The Gantry) - Adjusted padding */}
               <div className="w-full h-12 bg-linear-to-b from-surface-800 to-surface-950 border-x border-t border-white/10 rounded-t-xl shadow-2xl flex items-center justify-between px-10 relative overflow-hidden">
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                  
                   {/* Digital Signage Removed for Realism */}
                   <div className="flex flex-col items-start" />

                   {/* Lane Status Indicators - Dynamic STOP/ENTRY */}
                   <div className="flex gap-12 items-center">
                      <motion.div 
                        style={{ opacity: useTransform(smoothProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]) }}
                        className="flex flex-col items-center gap-1"
                      >
                         <motion.div 
                            style={{ 
                               borderColor: useTransform(smoothProgress, [0.4, 0.45], ['rgba(16,185,129,0.1)', 'rgba(16,185,129,0.5)']),
                               backgroundColor: useTransform(smoothProgress, [0.4, 0.45], ['#000', '#064e3b']),
                               boxShadow: useTransform(smoothProgress, [0.4, 0.45], ['none', '0 0 15px rgba(16,185,129,0.3)'])
                            }}
                            className="w-6 h-6 rounded-lg bg-black border border-emerald-500/30 flex items-center justify-center"
                         >
                            <motion.div style={{ opacity: entryLightOpacity }}>
                               <ArrowUp className="w-4 h-4 text-emerald-500" />
                            </motion.div>
                         </motion.div>
                         <motion.span style={{ color: entryLightColor }} className="text-[8px] font-bold uppercase transition-colors">Entry</motion.span>
                      </motion.div>

                      <motion.div 
                        style={{ opacity: useTransform(smoothProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]) }}
                        className="flex flex-col items-center gap-1"
                      >
                         <motion.div 
                            style={{ 
                               borderColor: useTransform(smoothProgress, [0.4, 0.45], ['rgba(239,68,68,0.5)', 'rgba(239,68,68,0.1)']),
                               backgroundColor: useTransform(smoothProgress, [0.4, 0.45], ['#450a0a', '#000']),
                               boxShadow: useTransform(smoothProgress, [0.4, 0.45], ['0 0 15px rgba(239,68,68,0.3)', 'none'])
                            }}
                            className="w-6 h-6 rounded-lg bg-black border flex items-center justify-center"
                         >
                            <motion.div style={{ opacity: stopLightOpacity }}>
                               <Circle className="w-3 h-3 fill-red-500 text-red-500" />
                            </motion.div>
                         </motion.div>
                         <motion.span style={{ color: stopLightColor }} className="text-[8px] font-bold uppercase transition-colors">Stop</motion.span>
                      </motion.div>
                   </div>
               </div>

               {/* The Vertical Supporting Column & Pivot Base */}
               <div className="w-full flex items-center justify-start relative h-4 top-[-2px]">
                  
                  {/* Heavy Duty Pillar */}
                  <div className="absolute left-[80px] z-40 w-16 h-32 bg-linear-to-b from-surface-700 via-surface-900 to-black border border-white/10 rounded-lg shadow-[20px_0_40px_rgba(0,0,0,0.5)] flex flex-col items-center pt-2">
                     {/* Pivot Cap */}
                     <div className="w-12 h-12 rounded-full bg-linear-to-br from-surface-600 to-surface-950 border border-white/5 shadow-inner flex items-center justify-center mb-4">
                        <div className="w-6 h-6 rounded-full bg-black border border-primary-500/40 animate-pulse-slow" />
                     </div>

                     {/* Status OLED */}
                     <div className="w-10 h-6 bg-black border border-white/5 rounded-sm flex items-center justify-center p-1">
                        <div className="w-full h-1 bg-primary-500/20 rounded-full overflow-hidden">
                           <motion.div 
                              style={{ width: useTransform(smoothProgress, [0, 0.4, 0.6, 1], ['0%', '100%', '100%', '0%']) }}
                              className="h-full bg-primary-500 shadow-[0_0_10px_#3b82f6]"
                           />
                        </div>
                     </div>

                     {/* Support Leg Shadow */}
                     <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[120%] h-[110%] bg-black/40 blur-xl -z-10 rounded-full rotate-12" />
                  </div>

                  {/* THE ROTATING BARRIER ARM */}
                  <div className="w-[340px] h-6 bg-transparent relative ml-[130px] flex items-center z-50">
                     <motion.div 
                       style={{ 
                         rotate: gateRotate,
                         transformOrigin: 'left center',
                         willChange: 'transform'
                       }}
                       className="w-full h-full bg-linear-to-r from-surface-800 via-primary-500 to-primary-800 rounded-r-full border border-primary-400/40 relative shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center"
                     >
                        {/* High-Reflective Warning Pattern (More visible) */}
                        <div className="absolute inset-0 opacity-40 bg-[repeating-linear-gradient(45deg,transparent,transparent_15px,#fff_15px,#fff_30px)]" />
                        
                        {/* Integrated LED Safety Strip (Thicker) */}
                        <motion.div 
                           style={{ 
                              backgroundColor: useTransform(smoothProgress, [0, 0.42, 0.48], ['#ef4444', '#ef4444', '#10b981']),
                              boxShadow: useTransform(smoothProgress, [0, 0.42, 0.48], ['0 0 20px #ef4444', '0 0 20px #ef4444', '0 0 20px #10b981']),
                           }}
                           className="absolute left-10 top-1/2 -translate-y-1/2 w-4/5 h-[4px] rounded-full z-10"
                        />
                        
                        {/* Mechanical Connection Cap */}
                        <div className="absolute left-0 inset-y-0 w-10 bg-black border-r border-white/20 shadow-xl" />
                     </motion.div>
                  </div>
               </div>
            </div>
        </div>
      </motion.div>

      {/* 4. Top-Down Car (The Controller Car) */}
      <motion.div
        style={{ 
          y: carY,
          scale: carScale,
          transformPerspective: 1000,
          willChange: 'transform'
        }}
        className="relative z-20 w-[140px] h-[260px] pointer-events-none"
      >
        <div className="w-full h-full relative">
           {/* Shadow */}
           <div className="absolute inset-0 bg-black/40 blur-2xl rounded-[3rem] transform translate-y-4 scale-110" />

            {/* Sleek Intelligent Sedan (Upgraded) */}
            <svg viewBox="0 0 140 260" className="w-full h-full drop-shadow-[0_30px_60px_rgba(0,0,0,0.9)] scale-110">
               <defs>
                  {/* Body Paint Gradient */}
                  <linearGradient id="bodyTop" x1="0%" y1="0%" x2="100%" y2="0%">
                     <stop offset="0%" stopColor="#0f172a" />
                     <stop offset="50%" stopColor="#334155" />
                     <stop offset="100%" stopColor="#0f172a" />
                  </linearGradient>

                  {/* Windshield Reflection */}
                  <linearGradient id="glassReflect" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(59,130,246,0.1)" />
                    <stop offset="50%" stopColor="rgba(59,130,246,0.02)" />
                    <stop offset="100%" stopColor="rgba(59,130,246,0.05)" />
                  </linearGradient>
                  
                  {/* Optimized Glow Filter */}
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
               </defs>

               {/* Main Body Chassis */}
               <rect x="5" y="5" width="130" height="250" rx="45" fill="#020617" />
               <rect x="8" y="8" width="124" height="244" rx="42" fill="url(#bodyTop)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
               
               {/* Roof & Pillars */}
               <rect x="22" y="65" width="96" height="130" rx="24" fill="#020617" stroke="rgba(59,130,246,0.2)" strokeWidth="0.5" />
               <rect x="25" y="68" width="90" height="124" rx="22" fill="url(#glassReflect)" />

               {/* Character Lines & Panels */}
               <path d="M10 60 Q 70 55, 130 60" stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="none" />
               <path d="M10 200 Q 70 205, 130 200" stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="none" />
               <rect x="68" y="15" width="4" height="20" rx="2" fill="rgba(255,255,255,0.1)" />

               {/* ACTIVE INTELLIGENT HEADLIGHTS */}
               <g filter="url(#glow)">
                  <motion.rect 
                    style={{ opacity: useTransform(smoothProgress, [0, 0.4, 0.6], [1, 0.6, 1]) }}
                    x="22" y="10" width="32" height="8" rx="4" fill="#fff" 
                  />
                  <motion.rect 
                    style={{ opacity: useTransform(smoothProgress, [0, 0.4, 0.6], [1, 0.6, 1]) }}
                    x="86" y="10" width="32" height="8" rx="4" fill="#fff" 
                  />
               </g>

               {/* ADAPTIVE REAR LIGHTS */}
               <rect x="25" y="242" width="28" height="6" rx="3" fill="#991b1b" />
               <rect x="87" y="242" width="28" height="6" rx="3" fill="#991b1b" />
               
               {/* Active Braking Glow */}
               <motion.rect 
                style={{ opacity: useTransform(smoothProgress, [0.15, 0.25, 0.55, 0.65], [0, 1, 1, 0]) }}
                x="25" y="242" width="28" height="6" rx="3" fill="#ef4444" filter="url(#glow)" 
               />
               <motion.rect 
                style={{ opacity: useTransform(smoothProgress, [0.15, 0.25, 0.55, 0.65], [0, 1, 1, 0]) }}
                x="87" y="242" width="28" height="6" rx="3" fill="#ef4444" filter="url(#glow)" 
               />

               {/* Side Mirrors */}
               <rect x="-4" y="80" width="14" height="24" rx="6" fill="#020617" stroke="rgba(255,255,255,0.1)" />
               <rect x="130" y="80" width="14" height="24" rx="6" fill="#020617" stroke="rgba(255,255,255,0.1)" />
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
