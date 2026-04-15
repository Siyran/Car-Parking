import React, { useState } from 'react';
import { motion, useTransform, useSpring } from 'framer-motion';
import { MapPin, Navigation, Info } from 'lucide-react';

const SPOT_POSITIONS = [
  { id: 1, top: '25%', left: '30%', status: 'available' },
  { id: 2, top: '45%', left: '75%', status: 'full' },
  { id: 3, top: '65%', left: '40%', status: 'available' },
  { id: 4, top: '15%', left: '65%', status: 'available' },
  { id: 5, top: '80%', left: '15%', status: 'available' },
];

export default function FloatingAsset({ scrollProgress }) {
  const [carPos, setCarPos] = useState({ x: 0, y: 0 });
  const [isParking, setIsParking] = useState(false);

  // PREMIUM AGILE PHYSICS
  const springConfig = { damping: 45, stiffness: 180, mass: 0.5 };

  const mapY = useTransform(scrollProgress, [0, 1], [0, -600]);
  const spotsY = useTransform(scrollProgress, [0, 1], [0, -580]);
  const carYShift = useTransform(scrollProgress, [0, 1], [0, 300]);

  const smoothMapY = useSpring(mapY, springConfig);
  const smoothSpotsY = useSpring(spotsY, springConfig);
  const smoothCarShift = useSpring(carYShift, springConfig);

  const handlePark = () => {
    setIsParking(true);
    setCarPos({ x: -40, y: -180 });
    setTimeout(() => setIsParking(false), 3000);
  };

  return (
    <div className="absolute inset-0 bg-[#05070A] overflow-hidden rounded-[3.8rem]">
      
      {/* LAYER 1: DEEP NOCTURNAL CITY MAP */}
      <motion.div 
        style={{ y: smoothMapY }}
        className="absolute inset-x-0 top-0 h-[280%] opacity-50 grayscale contrast-150 saturate-50"
      >
        <div 
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1596483560662-f24bd3df0ef5?q=80&w=2671&auto=format&fit=crop")' }}
        />
        {/* Neon Tech Grid */}
        <div className="absolute inset-0 opacity-20" 
             style={{ backgroundImage: 'radial-gradient(#4d7cff 1.5px, transparent 1.5px)', backgroundSize: '50px 50px' }} />
      </motion.div>

      {/* LAYER 2: INTERACTIVE NEON NODES */}
      <motion.div style={{ y: smoothSpotsY }} className="absolute inset-0 z-10">
        {SPOT_POSITIONS.map((spot) => (
          <div
            key={spot.id}
            style={{ top: spot.top, left: spot.left }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
          >
             <div className={`w-8 h-8 rounded-full border-[3px] ${
               spot.status === 'available' 
                 ? 'border-neon-green shadow-[0_0_30px_rgba(0,255,163,0.8)]' 
                 : 'border-red-500/40 opacity-20'
             }`}>
               {spot.status === 'available' && (
                 <motion.div 
                   animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
                   transition={{ duration: 2.5, repeat: Infinity }}
                   className="absolute inset-0 bg-neon-green rounded-full blur-sm"
                 />
               )}
             </div>
          </div>
        ))}
      </motion.div>

      {/* LAYER 3: PRO-LOGIC VEHICLE (HIGH-RES WHITE SPORTS CAR) */}
      <motion.div
        animate={isParking ? { x: carPos.x, y: carPos.y } : { y: smoothCarShift }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30"
      >
        <div className="relative group">
          {/* Signal Echo */}
          {isParking && (
            <motion.div 
              animate={{ scale: [1, 5], opacity: [0.3, 0] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="absolute inset-0 bg-primary-vibrant rounded-full blur-2xl"
            />
          )}

          {/* HIGH-RES VEHICLE PROJECTION */}
          <div className="relative pt-4">
             {/* Realistic Shadow */}
             <motion.div 
                 style={{ skewX: useTransform(scrollProgress, [0, 1], [15, -15]) }}
                 className="absolute top-[115%] left-1/2 -translate-x-1/2 w-[120%] h-[40%] bg-black/80 blur-2xl rounded-[50%] scale-x-[1.4] origin-top" 
             />
             
             {/* The Car Asset (Top-Down Pro Render) */}
             <div className="relative z-10 w-32 h-auto">
                <img 
                  src="https://res.cloudinary.com/df9v7as6k/image/upload/v1642103507/top-down-car.png" 
                  alt="Luxury White Sports Car"
                  className="w-full h-auto drop-shadow-[0_40px_45px_rgba(0,0,0,1)]"
                  onError={(e) => { e.target.src = "https://cdn-icons-png.flaticon.com/512/744/744465.png"; }}
                />
                
                {/* Dynamic Surface Sheen */}
                <motion.div 
                    animate={{ x: [-150, 250], opacity: [0, 0.4, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent skew-x-[25deg] pointer-events-none mix-blend-overlay"
                />
             </div>

             {/* Functional Glowing Headlights */}
             <div className="absolute top-[-5px] left-1/2 -translate-x-1/2 w-full flex justify-between px-6">
                <div className="w-3 h-3 bg-white rounded-full blur-[6px] shadow-[0_0_20px_#fff]" />
                <div className="w-3 h-3 bg-white rounded-full blur-[6px] shadow-[0_0_20px_#fff]" />
             </div>
          </div>
        </div>
      </motion.div>

      {/* STATE-OF-THE-ART HUD OVERLAYS */}
      <div className="absolute inset-x-0 bottom-10 px-8 z-40 pointer-events-auto">
          <motion.button
            whileHover={{ scale: 1.05, y: -6, boxShadow: '0 30px 60px rgba(30,144,255,0.6)' }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePark}
            className="w-full h-20 rounded-3xl bg-primary-vibrant text-white font-black text-xs uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(30,144,255,0.4)] flex items-center justify-center gap-4 active:brightness-125 transition-all overflow-hidden border border-white/20"
          >
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            <Navigation className="w-6 h-6 fill-current" />
            Launch_Parking
          </motion.button>
          
          <div className="mt-6 flex justify-between gap-4 px-1">
             <div className="flex-1 h-14 rounded-2xl bg-white/5 backdrop-blur-3xl border border-white/10 flex items-center justify-center gap-3">
                <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse shadow-[0_0_10px_#00ffa3]" />
                <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em]">Core_Sync</span>
             </div>
             <div className="w-14 h-14 rounded-2xl bg-white/5 backdrop-blur-3xl border border-white/10 flex items-center justify-center group active:bg-white/10">
                <Info className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
             </div>
          </div>
      </div>

      {/* Navigation HUD Hub */}
      <div className="absolute top-28 inset-x-8 z-40">
          <motion.div 
             initial={{ opacity: 0, x: -30 }}
             animate={{ opacity: 1, x: 0 }}
             className="p-5 rounded-[2.5rem] bg-white/5 backdrop-blur-3xl border border-white/10 flex items-center gap-5 shadow-2xl"
          >
             <div className="p-3.5 rounded-2xl bg-primary-vibrant/20 border border-primary-vibrant/40 shadow-[0_0_25px_rgba(30,144,255,0.4)]">
                <MapPin className="w-6 h-6 text-primary-vibrant" />
             </div>
             <div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.6em] mb-2 leading-none">PRIMARY_NODE</p>
                <p className="text-[13px] font-black text-white italic tracking-tighter uppercase leading-none">Sector 7HG Hub</p>
             </div>
          </motion.div>
      </div>
    </div>
  );
}
