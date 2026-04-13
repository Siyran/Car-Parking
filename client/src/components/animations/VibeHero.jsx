import { motion, useScroll, useSpring } from 'framer-motion';
import { ArrowRight, Zap, ChevronDown, Rocket } from 'lucide-react';
import FloatingAsset from './FloatingAsset';
import Button from '../ui/Button';
import { useRef } from 'react';

export default function VibeHero() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    damping: 30,
    stiffness: 100,
    mass: 0.5
  });

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
    <section ref={containerRef} className="relative min-h-[150vh] bg-[#05070A] overflow-hidden flex flex-col pt-32 pb-20 px-6 font-sans perspective-container">
      {/* BACKGROUND DECOR */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* CONCENTRIC RADIAL GRID */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vw] h-[200vw] radial-grid opacity-20" />
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-primary-vibrant/5 rounded-full blur-[200px]" />
      </div>

      <div className="max-w-[1440px] mx-auto w-full grid lg:grid-cols-2 gap-20 items-center relative z-10 flex-grow">
        
        {/* LEFT CONTENT */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          <div className="space-y-8">
            <motion.h1 
              variants={itemVariants}
              className="text-6xl md:text-8xl font-black text-white italic tracking-tighter leading-[0.9] uppercase"
            >
              MANAGE YOUR CAR <br />
              <span className="text-primary-vibrant">FROM ANYWHERE</span> <br />
              WITH OUR REMOTE APP
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-xl text-surface-400 font-medium leading-relaxed max-w-lg"
            >
              Our app enables users to control their car via smartphone. Experience the next level of automotive intelligence.
            </motion.p>
          </div>

          <motion.div variants={itemVariants} className="flex items-center gap-6">
            <Button 
               className="!rounded-full px-12 py-7 text-sm font-black italic uppercase tracking-[0.2em] shadow-glow transform hover:scale-105 transition-all bg-primary-vibrant flex items-center gap-4 text-white group"
               onClick={() => (window.location.href = '/register')}
            >
              Get Access <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </motion.div>

        {/* RIGHT VISUALS */}
        <div className="relative">
           <FloatingAsset scrollProgress={smoothProgress} />
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="max-w-[1440px] mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-12 relative z-10 pt-20 border-t border-white/5">
        <div className="flex items-center gap-8">
           <div className="space-y-2">
             <div className="flex items-center gap-4">
                <Rocket className="w-6 h-6 text-primary-vibrant" />
                <span className="text-4xl font-black text-white italic tracking-tighter">7X FASTER</span>
             </div>
             <div className="w-64 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: '70%' }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  viewport={{ once: true }}
                  className="h-full bg-primary-vibrant shadow-glow" 
                />
             </div>
           </div>
           <p className="text-[10px] font-black text-surface-500 uppercase tracking-[0.4em] max-w-[160px]">Optimization Engine Active</p>
        </div>

        {/* SCROLL INDICATOR */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="lg:fixed lg:right-12 lg:bottom-24 flex flex-col items-center gap-6 z-50 py-4 px-2 group cursor-pointer"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <span className="text-[10px] font-black text-white/40 group-hover:text-white uppercase tracking-[0.6em] [writing-mode:vertical-lr] transition-colors">SCROLL DOWN</span>
          <div className="w-[1px] h-20 bg-linear-to-b from-primary-vibrant via-primary-vibrant/30 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
