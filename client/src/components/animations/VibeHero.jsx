import { motion, useScroll, useSpring } from 'framer-motion';
import { ArrowRight, Rocket } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import IPhoneProMax from './IPhoneProMax';
import Button from '../ui/Button';
import { useRef, Suspense } from 'react';

export default function VibeHero() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // AGILE PHYSICS: Balanced response for the 3D canvas
  const smoothProgress = useSpring(scrollYProgress, { damping: 40, stiffness: 150, restDelta: 0.001 });

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
      
      {/* FIXED 3D VIEWPORT LAYER (REACT THREE FIBER) */}
      <div className="fixed inset-0 pointer-events-none z-0">
          <Suspense fallback={null}>
            <Canvas 
              shadows 
              dpr={[1, 2]} 
              camera={{ position: [0, 0, 10], fov: 45 }}
              gl={{ antialias: true, stencil: false, depth: true }}
            >
              <IPhoneProMax scrollProgress={smoothProgress} />
            </Canvas>
          </Suspense>
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
              
              <motion.p 
                variants={itemVariants}
                className="text-xl text-surface-400 font-medium leading-relaxed max-w-lg"
              >
                Experience the world's most intelligent autonomous parking network. Re-engineered for the iPhone 17 Pro Max.
              </motion.p>
            </div>

            <motion.div variants={itemVariants} className="flex items-center gap-6">
              <Button 
                 className="!rounded-full px-12 py-7 text-sm font-black italic uppercase tracking-[0.2em] shadow-glow transform hover:scale-105 transition-all bg-primary-vibrant flex items-center gap-4 text-white group"
              >
                Get Access <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
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
            <p className="text-xl text-surface-400 font-medium leading-relaxed max-w-md ml-auto">
              Real-time telemetry and centimeter-accurate GPS tracking using the Pro Max's spatial compute.
            </p>
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
            <div className="pt-10 flex items-center gap-8">
               <div className="space-y-2">
                 <div className="flex items-center gap-4">
                    <Rocket className="w-6 h-6 text-primary-vibrant" />
                    <span className="text-4xl font-black text-white italic tracking-tighter">NODE_ACTIVE</span>
                 </div>
                 <div className="w-64 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: '100%' }}
                      transition={{ duration: 2, ease: "easeOut" }}
                      className="h-full bg-primary-vibrant shadow-glow" 
                    />
                 </div>
               </div>
            </div>
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
