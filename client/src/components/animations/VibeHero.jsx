import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, MapPin, Navigation, Locate } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';

/* ─── PURE CSS 3D PHONE MOCKUP ─── */
function PhoneMockup({ mouseX, mouseY }) {
  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [12, -12]), { stiffness: 150, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-12, 12]), { stiffness: 150, damping: 30 });

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      className="relative w-[320px] h-[660px] [perspective:1200px]"
    >
      {/* Phone chassis */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2a2a2e] to-[#1a1a1e] rounded-[3.5rem] border border-white/10 shadow-[0_60px_120px_-30px_rgba(0,0,0,0.8),0_0_60px_-10px_rgba(77,124,255,0.15)] overflow-hidden">

        {/* Notch / Dynamic Island */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-50 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-[#1a1a1e] border border-white/5" />
        </div>

        {/* Screen bezel */}
        <div className="absolute inset-[6px] rounded-[3.2rem] overflow-hidden bg-black">
          <PhoneScreen />
        </div>

        {/* Glass reflection sweep */}
        <motion.div
          animate={{ x: [-400, 400] }}
          transition={{ duration: 4, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
          className="absolute inset-0 w-32 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent skew-x-[-20deg] pointer-events-none z-40"
        />
      </div>

      {/* Side button (right) */}
      <div className="absolute -right-[3px] top-[180px] w-[3px] h-[60px] bg-gradient-to-b from-[#3a3a3e] to-[#2a2a2e] rounded-r-sm" />
      {/* Volume buttons (left) */}
      <div className="absolute -left-[3px] top-[150px] w-[3px] h-[30px] bg-gradient-to-b from-[#3a3a3e] to-[#2a2a2e] rounded-l-sm" />
      <div className="absolute -left-[3px] top-[190px] w-[3px] h-[55px] bg-gradient-to-b from-[#3a3a3e] to-[#2a2a2e] rounded-l-sm" />
    </motion.div>
  );
}

/* ─── ANIMATED PHONE SCREEN CONTENT ─── */
function PhoneScreen() {
  const [carProgress, setCarProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCarProgress(prev => (prev >= 1 ? 0 : prev + 0.005));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Car path: simple curve from bottom-left to parking spot
  const pathX = 40 + carProgress * 220;
  const pathY = 280 - carProgress * 200 + Math.sin(carProgress * Math.PI * 2) * 20;

  const spots = [
    { x: 200, y: 100, available: true },
    { x: 260, y: 80, available: true },
    { x: 140, y: 130, available: false },
    { x: 100, y: 70, available: true },
    { x: 220, y: 170, available: true },
  ];

  return (
    <div className="relative w-full h-full bg-[#0a0e1a] overflow-hidden">
      {/* Dark map background with grid */}
      <div className="absolute inset-0">
        {/* Road grid */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 660">
          {/* Horizontal roads */}
          <line x1="0" y1="120" x2="320" y2="120" stroke="rgba(255,255,255,0.06)" strokeWidth="20" />
          <line x1="0" y1="240" x2="320" y2="240" stroke="rgba(255,255,255,0.06)" strokeWidth="20" />
          <line x1="0" y1="380" x2="320" y2="380" stroke="rgba(255,255,255,0.06)" strokeWidth="16" />
          {/* Vertical roads */}
          <line x1="80" y1="0" x2="80" y2="660" stroke="rgba(255,255,255,0.06)" strokeWidth="18" />
          <line x1="200" y1="0" x2="200" y2="660" stroke="rgba(255,255,255,0.06)" strokeWidth="18" />
          {/* Road markings (dashed center lines) */}
          <line x1="0" y1="120" x2="320" y2="120" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="8 12" />
          <line x1="0" y1="240" x2="320" y2="240" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="8 12" />
          <line x1="80" y1="0" x2="80" y2="660" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="8 12" />
          <line x1="200" y1="0" x2="200" y2="660" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="8 12" />

          {/* Car navigation path (dotted blue line) */}
          <motion.path
            d="M40,280 Q130,200 200,100"
            stroke="rgba(77,124,255,0.4)"
            strokeWidth="2"
            strokeDasharray="6 6"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </svg>

        {/* Parking spots with pulse */}
        {spots.map((spot, i) => (
          <div key={i} className="absolute" style={{ left: spot.x, top: spot.y }}>
            {spot.available && (
              <motion.div
                animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                className="absolute inset-0 w-6 h-6 -translate-x-3 -translate-y-3 rounded-full bg-emerald-400"
              />
            )}
            <div className={`w-6 h-6 -translate-x-3 -translate-y-3 rounded-full border-2 flex items-center justify-center ${
              spot.available
                ? 'border-emerald-400 bg-emerald-400/20 shadow-[0_0_15px_rgba(52,211,153,0.5)]'
                : 'border-red-400/40 bg-red-400/10'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${spot.available ? 'bg-emerald-400' : 'bg-red-400/40'}`} />
            </div>
          </div>
        ))}

        {/* Animated car */}
        <motion.div
          className="absolute z-20"
          style={{ left: pathX, top: pathY }}
        >
          <div className="relative -translate-x-4 -translate-y-4">
            {/* Car glow */}
            <div className="absolute inset-0 w-8 h-8 bg-blue-500/30 rounded-full blur-xl" />
            {/* Car dot */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white/30 shadow-[0_0_20px_rgba(59,130,246,0.6)] flex items-center justify-center">
              <Navigation className="w-3.5 h-3.5 text-white fill-white" style={{ transform: `rotate(${-45 + carProgress * 90}deg)` }} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Top status bar */}
      <div className="absolute top-14 left-6 right-6 z-30">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Navigating to</p>
            <p className="text-[11px] font-bold text-white">Sector 7 Parking Hub</p>
          </div>
          <div className="ml-auto text-[10px] font-bold text-emerald-400">2 min</div>
        </motion.div>
      </div>

      {/* Bottom action panel */}
      <div className="absolute bottom-8 left-5 right-5 z-30 space-y-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Available Spot</p>
              <p className="text-sm font-bold text-white">A-12 • Ground Floor</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-white">₹40<span className="text-xs text-white/40">/hr</span></p>
            </div>
          </div>
          <div className="w-full h-10 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center gap-2 shadow-[0_8px_30px_rgba(59,130,246,0.4)]">
            <Locate className="w-4 h-4 text-white" />
            <span className="text-[11px] font-black text-white uppercase tracking-widest">Navigate Here</span>
          </div>
        </motion.div>
      </div>

      {/* Home indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/20 rounded-full" />
    </div>
  );
}

/* ─── MAIN HERO EXPORT ─── */
export default function VibeHero() {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#05070A] px-6 py-20"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{
            background: [
              'radial-gradient(600px circle at 30% 40%, rgba(77,124,255,0.12), transparent 60%)',
              'radial-gradient(600px circle at 70% 60%, rgba(139,92,246,0.12), transparent 60%)',
              'radial-gradient(600px circle at 50% 30%, rgba(6,182,212,0.10), transparent 60%)',
              'radial-gradient(600px circle at 30% 40%, rgba(77,124,255,0.12), transparent 60%)',
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0"
        />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Content grid */}
      <div className="relative z-10 max-w-[1440px] mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">
        {/* Left: Copy */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-10"
        >
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Live • 5,000+ spots</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight leading-[0.95]"
            >
              Find Parking
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Near You</span>
              <br />
              Anytime
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-lg text-white/50 font-medium leading-relaxed max-w-lg"
            >
              Discover private parking spaces near you, navigate in real-time, and pay by the hour. Smart parking for smart cities.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row items-start gap-4"
          >
            <button
              onClick={() => navigate('/search')}
              className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-sm uppercase tracking-wider shadow-[0_20px_40px_-10px_rgba(59,130,246,0.5)] hover:shadow-[0_25px_50px_-10px_rgba(59,130,246,0.6)] hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <MapPin className="w-5 h-5" />
              Find Parking
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/register')}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:border-white/20 font-bold text-sm uppercase tracking-wider hover:scale-105 active:scale-95 transition-all duration-300 backdrop-blur-sm"
            >
              List Your Space
            </button>
          </motion.div>
        </motion.div>

        {/* Right: 3D Phone */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center lg:justify-end [perspective:1200px]"
        >
          <PhoneMockup mouseX={mouseX} mouseY={mouseY} />
          {/* Ambient glow behind phone */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">Scroll</span>
          <div className="w-5 h-8 rounded-full border border-white/20 flex justify-center pt-1.5">
            <motion.div
              animate={{ y: [0, 10, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-2 rounded-full bg-white/40"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
