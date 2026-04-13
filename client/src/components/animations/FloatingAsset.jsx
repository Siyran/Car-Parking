import React, { useState, useMemo } from 'react';
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

  // AGILE SPRING TUNING: Higher stiffness for faster follow
  const springConfig = { damping: 40, stiffness: 180, mass: 0.5 };

  // 2.5D STAGGERED PARALLAX
  const mapY = useTransform(scrollProgress, [0, 1], [0, -500]);
  const spotsY = useTransform(scrollProgress, [0, 1], [0, -480]); // Slightly closer to viewer
  const carYShift = useTransform(scrollProgress, [0, 1], [0, 250]); // Car floats opposite to map

  // Smoothers with high-inertia damping
  const smoothMapY = useSpring(mapY, springConfig);
  const smoothSpotsY = useSpring(spotsY, springConfig);
  const smoothCarShift = useSpring(carYShift, springConfig);

  const handlePark = () => {
    setIsParking(true);
    setCarPos({ x: -40, y: -160 });
    setTimeout(() => setIsParking(false), 3000);
  };

  return (
    <div className="absolute inset-0 bg-[#05070A] overflow-hidden rounded-[3.2rem]">
      
      {/* LAYER 1: DEEP MAP (PARALLAX) */}
      <motion.div 
        style={{ y: smoothMapY }}
        className="absolute inset-x-0 top-0 h-[250%] opacity-40 grayscale contrast-125"
      >
        <div 
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1596483560662-f24bd3df0ef5?q=80&w=2671&auto=format&fit=crop")' }}
        />
        {/* Tech Grid Overlay */}
        <div className="absolute inset-0 opacity-20" 
             style={{ backgroundImage: 'radial-gradient(#1e90ff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </motion.div>

      {/* LAYER 2: INTERACTIVE SPOTS */}
      <motion.div style={{ y: smoothSpotsY }} className="absolute inset-0 z-10">
        {SPOT_POSITIONS.map((spot) => (
          <div
            key={spot.id}
            style={{ top: spot.top, left: spot.left }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
          >
             <div className={`w-6 h-6 rounded-full border-2 ${
               spot.status === 'available' 
                 ? 'border-neon-green shadow-[0_0_20px_rgba(0,255,163,0.6)]' 
                 : 'border-red-500 opacity-20'
             }`}>
               {spot.status === 'available' && (
                 <motion.div 
                   animate={{ scale: [1, 2], opacity: [0.6, 0] }}
                   transition={{ duration: 2, repeat: Infinity }}
                   className="absolute inset-0 bg-neon-green rounded-full"
                 />
               )}
             </div>
          </div>
        ))}
      </motion.div>

      {/* LAYER 3: THE HERO CAR (2.5D PROJECTION) */}
      <motion.div
        animate={isParking ? { x: carPos.x, y: carPos.y } : { y: smoothCarShift }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30"
      >
        <div className="relative group">
          {/* Signal Pulse */}
          {isParking && (
            <motion.div 
              animate={{ scale: [1, 4], opacity: [0.4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 bg-primary-vibrant rounded-full blur-xl"
            />
          )}

          {/* THE CAR (High-Res Sprite with dynamic shadow) */}
          <div className="relative">
             {/* Realistic Car Shadow (Reactive orientation) */}
             <motion.div 
                 style={{ skewX: useTransform(scrollProgress, [0, 1], [12, -12]) }}
                 className="absolute top-[110%] left-1/2 -translate-x-1/2 w-full h-[30%] bg-black/70 blur-xl rounded-[50%] scale-x-[1.3] origin-top" 
             />
             
             {/* The Car Image */}
             <div className="relative z-10 w-28 h-auto">
                <img 
                  src="https://res.cloudinary.com/df9v7as6k/image/upload/v1642103507/top-down-car.png" 
                  alt="Luxury Car"
                  className="w-full h-auto drop-shadow-[0_25px_30px_rgba(0,0,0,0.9)]"
                  onError={(e) => { e.target.src = "https://cdn-icons-png.flaticon.com/512/744/744465.png"; }}
                />
                {/* Subtle sheen highlight */}
                <motion.div 
                    animate={{ x: [-100, 200], opacity: [0, 0.3, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                    className="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent skew-x-12 pointer-events-none"
                />
             </div>
          </div>
        </div>
      </motion.div>

      {/* UI OVERLAYS (SHARP HTML) */}
      <div className="absolute inset-x-0 bottom-8 px-6 z-40 pointer-events-auto">
          <motion.button
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePark}
            className="w-full h-16 rounded-2xl bg-primary-vibrant text-white font-black text-sm uppercase tracking-[0.2em] shadow-[0_25px_50px_rgba(30,144,255,0.4)] flex items-center justify-center gap-3 active:brightness-110 transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            <Navigation className="w-5 h-5 fill-current" />
            Find Parking
          </motion.button>
          
          <div className="mt-5 flex justify-between gap-3 px-1">
             <div className="flex-1 h-12 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest tracking-tighter">System_Online</span>
             </div>
             <div className="w-12 h-12 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center">
                <Info className="w-4 h-4 text-white/30" />
             </div>
          </div>
      </div>

      {/* Navigation HUD */}
      <div className="absolute top-24 inset-x-6 z-40">
          <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="p-4 rounded-3xl bg-white/5 backdrop-blur-3xl border border-white/10 flex items-center gap-4 transition-all hover:bg-white/10"
          >
             <div className="p-2.5 rounded-xl bg-primary-vibrant/20 border border-primary-vibrant/40 shadow-[0_0_20px_rgba(30,144,255,0.3)]">
                <MapPin className="w-5 h-5 text-primary-vibrant shadow-white" />
             </div>
             <div>
                <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.5em] mb-1 leading-none">Primary_Link</p>
                <p className="text-[11px] font-black text-white italic tracking-tighter uppercase leading-none">Sector 7-G Hub</p>
             </div>
          </motion.div>
      </div>
    </div>
  );
}
