import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, Rocket, Search, MoreHorizontal } from 'lucide-react';
import FloatingAsset from './FloatingAsset';
import Button from '../ui/Button';
import { useRef } from 'react';

const PhoneFrame = ({ children, profileName, subtitle, progress }) => {
  // HOLOGRAPHIC GLASS DEPTH: UI tilts slightly in opposition to chassis
  const hudRotateX = useTransform(progress, [0, 0.5, 1], [-2, -5, -8]);
  const hudRotateY = useTransform(progress, [0, 0.5, 1], [1, 3, 5]);
  const hudZ = useTransform(progress, [0, 0.5, 1], [10, 25, 40]);

  return (
    <div className="relative w-[340px] h-[700px] bg-[#0A0B14] rounded-[4rem] border-[8px] border-[#1A1C2E] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] flex flex-col ring-1 ring-white/10">
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-[#1A1C2E] rounded-b-2xl z-50 flex items-center justify-center gap-1.5 px-4">
        <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
        <div className="w-8 h-1 bg-white/10 rounded-full" />
      </div>

      {/* Header (Holographic Parallax) */}
      <motion.div 
        style={{ rotateX: hudRotateX, rotateY: hudRotateY, z: hudZ }}
        className="pt-12 px-8 flex justify-between items-center relative z-40 drop-shadow-2xl"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-800 border border-white/10 overflow-hidden">
            <img src="https://i.pravatar.cc/100" alt="avatar" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-sm font-black text-white leading-tight italic tracking-tight">{profileName}</p>
            <p className="text-[10px] font-bold text-neon-green uppercase tracking-[0.2em]">{subtitle}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <Search className="w-4 h-4 text-white/40" />
          </div>
          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <MoreHorizontal className="w-4 h-4 text-white/40" />
          </div>
        </div>
      </motion.div>

      {/* Screen Container */}
      <div className="flex-1 m-2.5 rounded-[3.2rem] relative border border-white/5 overflow-hidden">
         {children}
      </div>
    </div>
  );
};

export default function VibeHero() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // AGILE PHYSICS: Higher stiffness and balanced damping for snappier response
  const smoothProgress = useSpring(scrollYProgress, { damping: 40, stiffness: 180, restDelta: 0.001 });
  
  // NON-LINEAR MAPPING: More curves for organic feel
  const rotateX = useTransform(smoothProgress, [0, 0.45, 0.55, 1], [15, 28, 32, 45]);
  const rotateY = useTransform(smoothProgress, [0, 0.45, 0.55, 1], [-10, -18, -22, -35]);
  const scale = useTransform(smoothProgress, [0, 0.5, 1], [1, 1.12, 1.3]);
  const y = useTransform(smoothProgress, [0, 0.5, 1], [0, -20, -50]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  return (
    <div ref={containerRef} className="relative min-h-[300vh] bg-[#05070A] font-sans overflow-x-hidden">
      
      {/* FIXED 3D VIEWPORT LAYER */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-0">
          <motion.div
            style={{ rotateX, rotateY, scale, y, transformStyle: 'preserve-3d' }}
          >
            <PhoneFrame profileName="Abrar" subtitle="Parking Mode" progress={smoothProgress}>
               <FloatingAsset scrollProgress={smoothProgress} />
            </PhoneFrame>
          </motion.div>
      </div>

      {/* OVERLAY CONTENT SECTIONS */}
      {/* SECTION 1: HERO */}
      <section className="relative h-screen flex flex-col justify-center px-6 md:px-20 z-10 pointer-events-none">
        <div className="max-w-[1440px] mx-auto w-full grid lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="space-y-12 pointer-events-auto"
          >
            <div className="space-y-8">
              <motion.h1 
                variants={itemVariants}
                className="text-6xl md:text-8xl font-black text-white italic tracking-tighter leading-[0.9] uppercase"
              >
                FIND PARKING <br />
                <span className="text-primary-vibrant">NEAR YOU</span> <br />
                ANYTIME
              </motion.h1>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: NAVIGATE */}
      <section className="relative h-screen flex flex-col justify-center items-end px-6 md:px-20 z-10 pointer-events-none">
        <div className="max-w-[1440px] mx-auto w-full flex justify-end">
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="space-y-8 text-right pointer-events-auto"
          >
            <h2 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter leading-[0.9] uppercase">
              NAVIGATE IN <br />
              <span className="text-primary-vibrant">REAL TIME</span>
            </h2>
          </motion.div>
        </div>
      </section>

      {/* SECTION 3: LIST */}
      <section className="relative h-screen flex flex-col justify-center px-6 md:px-20 z-10 pointer-events-none">
        <div className="max-w-[1440px] mx-auto w-full">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="space-y-8 pointer-events-auto"
          >
            <h2 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter leading-[0.9] uppercase">
              LIST YOUR SPACE <br />
              <span className="text-primary-vibrant">AND EARN</span>
            </h2>
          </motion.div>
        </div>
      </section>

      {/* BOTTOM INDICATOR */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 pointer-events-auto cursor-pointer">
          <p className="text-[10px] font-black tracking-[0.4em] text-white/30 uppercase mb-4 text-center">Slide to Explore</p>
          <div className="w-[1px] h-10 bg-linear-to-b from-primary-vibrant via-primary-vibrant/30 to-transparent mx-auto" />
      </div>
    </div>
  );
}
