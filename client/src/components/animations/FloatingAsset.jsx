import { motion, useTransform } from 'framer-motion';
import { Thermometer, Zap, Wind, Smartphone, BatteryMedium, MapPin, Lock, Unlock, Wind as ClimateIcon, UserCircle } from 'lucide-react';

const CarShadow = () => (
   <motion.div 
      initial={{ scale: 0.8, opacity: 0.3 }}
      animate={{ 
        scale: [0.8, 1.3, 0.8], 
        opacity: [0.3, 0.1, 0.3],
        filter: ["blur(25px)", "blur(45px)", "blur(25px)"]
      }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-[45%] left-[5%] w-[320px] h-[100px] bg-black/60 rounded-[50%] z-0"
    />
);

const RealisticCar = () => (
  <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
    <motion.div
      animate={{ 
        y: [0, -45, 0],
        rotateX: [0, -3, 0],
        rotateZ: [0, 1.5, 0]
      }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="relative z-50"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* SHAPE: SLEEK LOW-PROFILE EV SPORTS CAR */}
      <svg viewBox="0 0 600 300" className="w-[520px] h-auto drop-shadow-[0_50px_80px_rgba(0,0,0,0.6)]">
        <defs>
          <linearGradient id="bodySilver" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <linearGradient id="sideShade" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
          <clipPath id="carSilhouette">
            <path d="M40 220 L180 110 Q300 90, 480 110 L560 180 L560 250 Q300 280, 40 250 Z" />
          </clipPath>
          <filter id="carGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. LOWER CHASSIS/SIDE (Depth Layer) */}
        <path d="M40 225 L180 115 Q300 95, 485 115 L565 185 L565 255 Q300 285, 40 255 Z" fill="#475569" opacity="0.3" />
        
        {/* 2. MAIN BODY SIDE PANEL */}
        <path d="M40 220 L180 110 Q300 90, 480 110 L560 180 L560 250 Q300 280, 40 250 Z" fill="url(#sideShade)" />

        {/* 3. TOP HOOD & ROOF (Bright Surface) */}
        <path d="M180 110 Q300 90, 480 110 L450 180 Q300 170, 180 180 Z" fill="url(#bodySilver)" />
        
        {/* 4. WINDSHIELD (Glossy Black Deep Recess) */}
        <path d="M210 115 Q300 100, 430 115 L410 165 Q300 155, 220 165 Z" fill="#020617" />
        <path d="M230 125 Q300 115, 410 125 L400 135 Q300 125, 240 135 Z" fill="white" opacity="0.1" />
        
        {/* 5. SIDE CHARACTER LINE & ARROWHEAD HEADLIGHTS */}
        <path d="M60 230 Q300 245, 540 225" stroke="white" strokeWidth="0.5" fill="none" opacity="0.4" />
        <path d="M40 220 L70 225 L70 240 L40 235 Z" fill="white" />
        <circle cx="55" cy="228" r="4" fill="#60a5fa" filter="url(#carGlow)" className="animate-pulse" />
        
        {/* 6. CONCAVE PERFORMANCE WHEELS */}
        <ellipse cx="140" cy="255" rx="45" ry="12" fill="#020617" />
        <ellipse cx="490" cy="255" rx="45" ry="12" fill="#020617" />
      </svg>

      {/* GLINT LIGHT SWEEP REFLECTION */}
      <div className="absolute inset-0 pointer-events-none car-glint opacity-30" style={{ clipPath: 'url(#carSilhouette)' }} />
    </motion.div>
  </div>
);

const PhoneFrame = ({ children, shadowElement }) => (
  <div className="relative w-[340px] h-[680px] bg-[#0A0A0B] rounded-[4rem] border-[6px] border-[#1E1E22] shadow-[0_60px_120px_-30px_rgba(0,0,0,0.85)] flex flex-col ring-1 ring-white/15">
    {/* Physical Buttons Integration */}
    <div className="absolute -left-[6px] top-36 w-[6px] h-14 bg-[#1E1E22] rounded-l-md border-r border-white/5" />
    <div className="absolute -left-[6px] top-56 w-[6px] h-14 bg-[#1E1E22] rounded-l-md border-r border-white/5" />
    <div className="absolute -right-[6px] top-48 w-[6px] h-24 bg-[#1E1E22] rounded-r-md border-l border-white/5" />

    {/* Screen Container */}
    <div className="flex-1 m-2 rounded-[3.5rem] bg-[#05070A] relative border border-white/5">
       {/* UI Header */}
       <div className="pt-10 px-10 flex justify-between items-center relative z-20">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-surface-800 flex items-center justify-center text-white border border-white/10 overflow-hidden shadow-inner">
                <UserCircle className="w-full h-full opacity-20 transform scale-125 translate-y-2" />
             </div>
             <div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Vehicle Hub</p>
                <p className="text-base font-black text-white italic tracking-tighter">Andrew Walker</p>
             </div>
          </div>
          <motion.div 
            whileHover={{ rotate: 90 }}
            className="w-12 h-12 rounded-2xl bg-primary-vibrant/20 border border-primary-vibrant/40 flex items-center justify-center cursor-pointer transition-all hover:bg-primary-vibrant/40"
          >
             <span className="text-white text-lg font-black">+</span>
          </motion.div>
       </div>

       {/* Screen Reflection Overlay */}
       <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/[0.03] to-white/[0.08] pointer-events-none rounded-[3.5rem] z-10" />
       
       {/* Grounding Shadow for the Car */}
       {shadowElement}
       
       {/* Screen UI Elements */}
       <div className="absolute inset-0 overflow-hidden rounded-[3.5rem] pointer-events-none">
          {children}
       </div>

       {/* Bottom Controls */}
       <div className="absolute bottom-12 left-0 right-0 px-10 flex justify-between items-center z-40 gap-6">
          <motion.div 
            whileTap={{ scale: 0.95 }}
            className="flex-1 h-16 rounded-[1.5rem] bg-white/[0.03] border border-white/10 flex items-center justify-center gap-4 backdrop-blur-3xl"
          >
             <Lock className="w-6 h-6 text-white/40" />
             <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">System.Locked</span>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.1, rotate: -5 }}
            whileTap={{ scale: 0.9 }}
            className="w-20 h-20 rounded-[2rem] bg-white shadow-[0_0_50px_rgba(255,255,255,0.2)] flex items-center justify-center cursor-pointer group shadow-white/20 active:bg-surface-200"
          >
             <Unlock className="w-10 h-10 text-black group-hover:rotate-12 transition-transform" />
          </motion.div>
       </div>
    </div>
  </div>
);

export default function FloatingAsset({ scrollProgress }) {
  // EXTREME SCROLL-DRIVEN PERSPECTIVE
  const rotateX = useTransform(scrollProgress, [0, 0.5, 1], [30, 48, 62]);
  const rotateY = useTransform(scrollProgress, [0, 0.5, 1], [0, -18, -32]);
  const rotateZ = useTransform(scrollProgress, [0, 0.5, 1], [0, 12, 22]);
  const scale = useTransform(scrollProgress, [0, 0.5, 1], [0.85, 1, 1.25]);
  const y = useTransform(scrollProgress, [0, 0.5, 1], [0, -40, -90]);

  return (
    <div className="relative w-full h-[900px] flex items-center justify-center perspective-container py-24">
      
      {/* GLOBAL 3D CONTAINER */}
      <motion.div
        style={{ 
          rotateX, 
          rotateY, 
          rotateZ, 
          scale,
          y,
          transformStyle: 'preserve-3d' 
        }}
        className="relative z-20"
      >
        {/* 1. THE PHONE FRAME (WITH NESTED SHADOW) */}
        <PhoneFrame shadowElement={<CarShadow />}>
            {/* SCREEN UI INTERFACE */}
            <div className="absolute top-[20%] left-12 space-y-8 z-10 p-4">
                 <motion.div 
                    whileHover={{ scale: 1.1, x: 5 }}
                    className="w-14 h-14 rounded-3xl bg-white/[0.03] backdrop-blur-4xl border border-white/10 flex items-center justify-center shadow-2xl cursor-pointer hover:border-primary-vibrant/50 transition-all group"
                 >
                    <ClimateIcon className="w-7 h-7 text-white/20 group-hover:text-primary-vibrant transition-colors" />
                 </motion.div>
                 <motion.div 
                    whileHover={{ scale: 1.1, x: 5 }}
                    className="w-14 h-14 rounded-3xl bg-white/[0.03] backdrop-blur-4xl border border-white/10 flex items-center justify-center shadow-2xl cursor-pointer hover:border-neon-green/50 transition-all group"
                 >
                    <Zap className="w-7 h-7 text-white/20 group-hover:text-neon-green transition-colors" />
                 </motion.div>
                 <div className="pt-8">
                    <motion.p 
                      animate={{ opacity: [0.3, 0.8, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="text-6xl font-black text-white italic tracking-tighter"
                    >100%</motion.p>
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-2">Energy.Link_Active</p>
                 </div>
            </div>
        </PhoneFrame>

        {/* 2. THE CAR BODY (EXTERNALLY POSITIONED FOR ZERO CLIPPING) */}
        <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center" style={{ transformStyle: 'preserve-3d', transform: 'translateZ(180px) translateY(-60px) translateX(25px)' }}>
            <RealisticCar />
        </div>
      </motion.div>

      {/* AMBIENT CONTEXT */}
      <motion.div
        style={{ opacity: useTransform(scrollProgress, [0, 0.3], [1, 0]) }}
        className="absolute inset-0 z-10 pointer-events-none"
      >
        <div className="absolute top-0 left-[-20%] glass-dark px-8 py-4 rounded-[2rem] flex items-center gap-6 anti-gravity border border-white/[0.05] backdrop-blur-3xl">
           <div className="w-14 h-14 rounded-2xl bg-primary-vibrant/10 flex items-center justify-center border border-primary-vibrant/20">
              <Wind className="w-7 h-7 text-primary-vibrant opacity-60" />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-surface-500 mb-1 opacity-40">System.Env</p>
              <p className="text-2xl font-black text-white italic tracking-tighter leading-none">OPTIMAL_18°C</p>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
