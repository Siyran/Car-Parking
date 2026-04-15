import { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, MapPin, Navigation, Locate, Clock, Star, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════════════════
   PHONE SCREEN — The Animated Parking Journey
   Driven by `progress` (0 → 1) from GSAP ScrollTrigger
   ═══════════════════════════════════════════════════════════════════ */
function PhoneScreen({ progress }) {
  // Car position along a curved path based on scroll progress
  const p = Math.min(1, Math.max(0, progress));

  // Bezier curve: start bottom-left → curve through center → arrive top-right parking spot
  const t = p;
  const startX = 50, startY = 520;
  const cp1X = 100, cp1Y = 350;
  const cp2X = 220, cp2Y = 250;
  const endX = 230, endY = 140;

  const carX = (1-t)**3*startX + 3*(1-t)**2*t*cp1X + 3*(1-t)*t**2*cp2X + t**3*endX;
  const carY = (1-t)**3*startY + 3*(1-t)**2*t*cp1Y + 3*(1-t)*t**2*cp2Y + t**3*endY;

  // Car rotation based on path tangent
  const dt = 0.01;
  const t2 = Math.min(1, t + dt);
  const nextX = (1-t2)**3*startX + 3*(1-t2)**2*t2*cp1X + 3*(1-t2)*t2**2*cp2X + t2**3*endX;
  const nextY = (1-t2)**3*startY + 3*(1-t2)**2*t2*cp1Y + 3*(1-t2)*t2**2*cp2Y + t2**3*endY;
  const angle = Math.atan2(nextY - carY, nextX - carX) * (180 / Math.PI);

  // Map parallax offset
  const mapOffset = p * -180;

  // Parking nodes
  const spots = [
    { x: 230, y: 140, name: 'Sector 7 Hub', price: 40, available: true },
    { x: 260, y: 210, name: 'Mall Zone A', price: 60, available: true },
    { x: 100, y: 180, name: 'Block C', price: 25, available: false },
    { x: 170, y: 320, name: 'Central Lot', price: 35, available: true },
    { x: 80, y: 100, name: 'Park Gate', price: 50, available: true },
  ];

  // Proximity glow: how close car is to destination (spot 0)
  const distToDest = Math.sqrt((carX - spots[0].x)**2 + (carY - spots[0].y)**2);
  const destGlow = Math.max(0, 1 - distToDest / 200);

  // Bottom card visibility: shows when car is near destination (p > 0.75)
  const showCard = p > 0.75;

  // Route draw progress (matches car progress)
  const routePath = `M${startX},${startY} C${cp1X},${cp1Y} ${cp2X},${cp2Y} ${endX},${endY}`;

  return (
    <div className="relative w-full h-full bg-[#080c18] overflow-hidden rounded-[3.2rem]">

      {/* ── LAYER 1: PARALLAX MAP ── */}
      <div
        className="absolute inset-x-0 top-0 w-full transition-transform duration-100 ease-out"
        style={{ height: '180%', transform: `translateY(${mapOffset}px)` }}
      >
        {/* Dark city grid */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 1100" preserveAspectRatio="none">
          {/* Building blocks */}
          {[
            [20, 50, 60, 80], [120, 30, 70, 100], [220, 70, 80, 90],
            [40, 200, 90, 60], [180, 180, 100, 70],
            [30, 370, 80, 50], [150, 350, 100, 80], [260, 340, 40, 60],
            [60, 500, 100, 70], [200, 480, 80, 90],
            [20, 650, 70, 80], [140, 630, 90, 60], [250, 660, 50, 40],
            [80, 800, 60, 50], [180, 780, 100, 70],
          ].map(([x, y, w, h], i) => (
            <rect key={i} x={x} y={y} width={w} height={h} rx="4"
              fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          ))}

          {/* Roads (horizontal + vertical) */}
          {[150, 300, 460, 620, 780].map((y, i) => (
            <g key={`h${i}`}>
              <line x1="0" y1={y} x2="320" y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="22" />
              <line x1="0" y1={y} x2="320" y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" strokeDasharray="6 10" />
            </g>
          ))}
          {[100, 200, 280].map((x, i) => (
            <g key={`v${i}`}>
              <line x1={x} y1="0" x2={x} y2="1100" stroke="rgba(255,255,255,0.06)" strokeWidth="20" />
              <line x1={x} y1="0" x2={x} y2="1100" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" strokeDasharray="6 10" />
            </g>
          ))}
        </svg>

        {/* Tech dot grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(rgba(77,124,255,0.8) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />
      </div>

      {/* ── LAYER 2: ROUTE PATH (stroke-animated) ── */}
      <svg className="absolute inset-0 w-full h-full z-10" viewBox="0 0 320 660" style={{ transform: `translateY(${mapOffset * 0.3}px)` }}>
        {/* Route shadow */}
        <path d={routePath} fill="none" stroke="rgba(59,130,246,0.15)" strokeWidth="8"
          strokeDasharray="1000" strokeDashoffset={1000 - p * 1000} strokeLinecap="round" />
        {/* Route line */}
        <path d={routePath} fill="none" stroke="rgba(59,130,246,0.6)" strokeWidth="3"
          strokeDasharray="1000" strokeDashoffset={1000 - p * 1000} strokeLinecap="round" />
        {/* Route dots */}
        <path d={routePath} fill="none" stroke="rgba(59,130,246,0.3)" strokeWidth="1"
          strokeDasharray="4 8" strokeDashoffset={1000 - p * 1000} strokeLinecap="round" />
      </svg>

      {/* ── LAYER 3: PARKING NODES ── */}
      <div className="absolute inset-0 z-20" style={{ transform: `translateY(${mapOffset * 0.15}px)` }}>
        {spots.map((spot, i) => {
          const dist = Math.sqrt((carX - spot.x)**2 + (carY - spot.y)**2);
          const proximity = Math.max(0, 1 - dist / 150);
          const pulseSize = spot.available ? (12 + proximity * 16) : 8;
          const glowOpacity = spot.available ? (0.15 + proximity * 0.5) : 0.05;

          return (
            <div key={i} className="absolute" style={{ left: spot.x, top: spot.y, transform: 'translate(-50%, -50%)' }}>
              {/* Outer pulse */}
              {spot.available && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="rounded-full animate-ping"
                    style={{
                      width: pulseSize * 2.5,
                      height: pulseSize * 2.5,
                      backgroundColor: i === 0 ? `rgba(59,130,246,${glowOpacity})` : `rgba(52,211,153,${glowOpacity})`,
                      animationDuration: `${2 - proximity}s`,
                    }}
                  />
                </div>
              )}
              {/* Marker */}
              <div
                className="relative rounded-full border-2 flex items-center justify-center transition-all duration-300"
                style={{
                  width: pulseSize,
                  height: pulseSize,
                  borderColor: !spot.available ? 'rgba(239,68,68,0.3)' : i === 0 ? `rgba(59,130,246,${0.5 + proximity * 0.5})` : `rgba(52,211,153,${0.4 + proximity * 0.4})`,
                  backgroundColor: !spot.available ? 'rgba(239,68,68,0.1)' : i === 0 ? `rgba(59,130,246,${0.1 + proximity * 0.2})` : `rgba(52,211,153,${0.08 + proximity * 0.15})`,
                  boxShadow: spot.available ? `0 0 ${10 + proximity * 25}px ${i === 0 ? `rgba(59,130,246,${0.2 + proximity * 0.4})` : `rgba(52,211,153,${0.15 + proximity * 0.3})`}` : 'none',
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{
                  backgroundColor: !spot.available ? 'rgba(239,68,68,0.4)' : i === 0 ? '#3b82f6' : '#34d399',
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── LAYER 4: THE CAR ── */}
      <div
        className="absolute z-30 transition-none"
        style={{
          left: carX,
          top: carY + mapOffset * 0.15,
          transform: `translate(-50%, -50%) rotate(${angle - 90}deg)`,
        }}
      >
        {/* Navigation glow */}
        <div className="absolute inset-0 w-12 h-12 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 bg-blue-500/20 rounded-full blur-xl" />
        {/* Car body */}
        <div className="relative">
          <svg width="28" height="44" viewBox="0 0 28 44" fill="none">
            {/* Car shape */}
            <rect x="3" y="6" width="22" height="32" rx="6" fill="url(#carGrad)" />
            <rect x="5" y="10" width="18" height="8" rx="3" fill="rgba(120,180,255,0.15)" /> {/* windshield */}
            <rect x="5" y="26" width="18" height="6" rx="2" fill="rgba(120,180,255,0.1)" /> {/* rear window */}
            {/* Headlights */}
            <circle cx="8" cy="7" r="2" fill="#fff" opacity="0.9">
              <animate attributeName="opacity" values="0.9;0.5;0.9" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="20" cy="7" r="2" fill="#fff" opacity="0.9">
              <animate attributeName="opacity" values="0.9;0.5;0.9" dur="1.5s" repeatCount="indefinite" />
            </circle>
            {/* Headlight beams */}
            <path d="M6,5 L2,0 L14,0 L10,5" fill="rgba(255,255,255,0.06)" />
            <path d="M18,5 L14,0 L26,0 L22,5" fill="rgba(255,255,255,0.06)" />
            {/* Taillights */}
            <circle cx="8" cy="37" r="1.5" fill="#ef4444" opacity="0.7" />
            <circle cx="20" cy="37" r="1.5" fill="#ef4444" opacity="0.7" />
            <defs>
              <linearGradient id="carGrad" x1="14" y1="6" x2="14" y2="38" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#4a9eff" />
                <stop offset="1" stopColor="#2563eb" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* ── LAYER 5: GPS STATUS BAR ── */}
      <div className="absolute top-14 left-5 right-5 z-40">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] shadow-lg">
          <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
            <Navigation className="w-3.5 h-3.5 text-blue-400 fill-blue-400/30" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[8px] font-semibold text-white/30 uppercase tracking-widest leading-none mb-1">Navigating to</p>
            <p className="text-[11px] font-bold text-white leading-none truncate">Sector 7 Parking Hub</p>
          </div>
          <div className="flex flex-col items-end">
            <p className="text-[11px] font-bold text-emerald-400 leading-none">{Math.max(0, Math.round((1 - p) * 4))} min</p>
            <p className="text-[8px] text-white/25 leading-none mt-0.5">{(p * 1.2).toFixed(1)} km</p>
          </div>
        </div>
      </div>

      {/* ── LAYER 6: ARRIVAL CARD (slides up at p > 0.75) ── */}
      <div
        className="absolute bottom-6 left-4 right-4 z-40 transition-all duration-700 ease-out"
        style={{
          transform: `translateY(${showCard ? 0 : 120}px)`,
          opacity: showCard ? 1 : 0,
        }}
      >
        <div className="p-4 rounded-3xl bg-white/[0.05] backdrop-blur-3xl border border-white/[0.1] shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-white">Sector 7 Hub • A-12</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="text-[10px] text-white/50">4.8</span>
                <span className="text-[10px] text-white/25">•</span>
                <span className="text-[10px] text-white/50">Ground Floor</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-white leading-none">₹40</p>
              <p className="text-[9px] text-white/30">/hour</p>
            </div>
          </div>

          {/* Duration selector */}
          <div className="flex gap-2 mb-3">
            {['1h', '2h', '4h'].map((dur, i) => (
              <div key={i} className={`flex-1 py-1.5 rounded-xl text-center text-[10px] font-bold transition-all duration-300 ${i === 1 ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400' : 'bg-white/[0.03] border border-white/[0.06] text-white/40'}`}>
                {dur}
              </div>
            ))}
          </div>

          <button className="w-full h-11 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center gap-2 shadow-[0_10px_30px_-5px_rgba(59,130,246,0.4)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]" style={{ animationTimingFunction: 'ease-in-out' }} />
            <Locate className="w-4 h-4 text-white" />
            <span className="text-[11px] font-bold text-white uppercase tracking-wider">Book & Navigate</span>
          </button>
        </div>
      </div>

      {/* Status time bar */}
      <div className="absolute top-4 left-6 right-6 flex justify-between items-center z-50 opacity-30">
        <span className="text-[10px] font-semibold text-white">9:41</span>
        <div className="flex gap-1 items-center">
          <div className="w-4 h-2 rounded-sm border border-white/50 relative">
            <div className="absolute inset-[1px] right-[2px] bg-emerald-400 rounded-sm" />
          </div>
        </div>
      </div>

      {/* Home indicator */}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/15 rounded-full z-50" />
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   MAIN HERO — GSAP ScrollTrigger Driven
   ═══════════════════════════════════════════════════════════════════ */
export default function VibeHero() {
  const sectionRef = useRef(null);
  const phoneRef = useRef(null);
  const glowRef = useRef(null);
  const navigate = useNavigate();

  // Mouse tracking for subtle tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 100, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 25 });
  const tiltX = useTransform(springY, [-400, 400], [6, -6]);
  const tiltY = useTransform(springX, [-400, 400], [-6, 6]);

  // Scroll progress state for phone screen
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleMouseMove = useCallback((e) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  }, [mouseX, mouseY]);

  // GSAP ScrollTrigger setup
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5,
          onUpdate: (self) => {
            setScrollProgress(self.progress);
          },
        },
      });

      // Phone animation timeline
      tl.to(phoneRef.current, {
        y: -60,
        scale: 1.08,
        rotateX: 8,
        rotateY: -5,
        duration: 0.4,
        ease: 'none',
      })
      .to(phoneRef.current, {
        y: -30,
        scale: 1.15,
        rotateX: 15,
        rotateY: -12,
        duration: 0.3,
        ease: 'none',
      })
      .to(phoneRef.current, {
        y: 0,
        scale: 1.05,
        rotateX: 5,
        rotateY: -3,
        duration: 0.3,
        ease: 'none',
      });

      // Glow animation
      tl.to(glowRef.current, {
        scale: 1.3,
        opacity: 0.8,
        duration: 0.5,
        ease: 'none',
      }, 0)
      .to(glowRef.current, {
        scale: 1.5,
        opacity: 0.5,
        duration: 0.5,
        ease: 'none',
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-[200vh] bg-[#05070A]"
    >
      {/* Sticky container */}
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden px-6 py-20">
        {/* Animated gradient background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at 60% 40%, rgba(59,130,246,0.08) 0%, transparent 60%), radial-gradient(ellipse at 30% 70%, rgba(139,92,246,0.06) 0%, transparent 50%)',
          }} />
          <div className="absolute inset-0 opacity-[0.025]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
        </div>

        {/* Content grid */}
        <div className="relative z-10 max-w-[1400px] mx-auto w-full grid lg:grid-cols-[1fr_auto] gap-12 lg:gap-20 items-center">

          {/* ── LEFT: COPY ── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-10 max-w-xl"
          >
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                <span className="text-[11px] font-semibold text-white/50 uppercase tracking-widest">Live • 5,000+ spots</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1]"
              >
                Find Parking
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">Near You</span>
                <br />
                Anytime
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-base md:text-lg text-white/40 leading-relaxed"
              >
                Discover private parking spaces nearby, navigate in real-time, and pay by the hour. Smart parking for modern cities.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row items-start gap-4"
            >
              <button
                onClick={() => navigate('/search')}
                className="group flex items-center gap-3 px-7 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-sm tracking-wide shadow-[0_15px_40px_-10px_rgba(59,130,246,0.5)] hover:shadow-[0_20px_50px_-10px_rgba(59,130,246,0.6)] hover:scale-[1.03] active:scale-[0.97] transition-all duration-300"
              >
                <MapPin className="w-4 h-4" />
                Find Parking
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/register')}
                className="flex items-center gap-3 px-7 py-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-white/60 hover:text-white hover:border-white/15 font-bold text-sm tracking-wide hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 backdrop-blur-sm"
              >
                List Your Space
              </button>
            </motion.div>
          </motion.div>

          {/* ── RIGHT: 3D PHONE ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center lg:justify-end relative"
            style={{ perspective: 1200 }}
          >
            {/* Background glow */}
            <div
              ref={glowRef}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full pointer-events-none opacity-60"
              style={{
                background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(139,92,246,0.08) 40%, transparent 70%)',
              }}
            />

            {/* Phone wrapper with GSAP + mouse tilt */}
            <motion.div
              ref={phoneRef}
              style={{
                rotateX: tiltX,
                rotateY: tiltY,
                transformStyle: 'preserve-3d',
              }}
              className="relative"
            >
              {/* Floating animation */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              >
                {/* Phone chassis */}
                <div className="relative w-[300px] h-[630px] md:w-[320px] md:h-[670px]">
                  {/* Outer frame */}
                  <div className="absolute inset-0 rounded-[3.5rem] bg-gradient-to-b from-[#303035] via-[#1f1f23] to-[#18181c] border border-white/[0.08] shadow-[0_50px_100px_-25px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.03)_inset]">
                    {/* Dynamic Island */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[90px] h-[28px] bg-black rounded-full z-50 flex items-center justify-center gap-2">
                      <div className="w-[10px] h-[10px] rounded-full bg-[#1a1a1e] border border-white/[0.06]" />
                      <div className="w-[6px] h-[6px] rounded-full bg-[#111]" />
                    </div>

                    {/* Screen area */}
                    <div className="absolute inset-[5px] rounded-[3.2rem] overflow-hidden">
                      <PhoneScreen progress={scrollProgress} />
                    </div>

                    {/* Glass reflection */}
                    <motion.div
                      animate={{ x: [-350, 400] }}
                      transition={{ duration: 5, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
                      className="absolute inset-0 w-24 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent skew-x-[-15deg] pointer-events-none z-40 rounded-[3.5rem]"
                    />
                  </div>

                  {/* Side buttons */}
                  <div className="absolute -right-[2px] top-[170px] w-[3px] h-[50px] bg-gradient-to-b from-[#444] to-[#333] rounded-r-sm shadow-[1px_0_3px_rgba(0,0,0,0.3)]" />
                  <div className="absolute -left-[2px] top-[145px] w-[3px] h-[25px] bg-gradient-to-b from-[#444] to-[#333] rounded-l-sm shadow-[-1px_0_3px_rgba(0,0,0,0.3)]" />
                  <div className="absolute -left-[2px] top-[180px] w-[3px] h-[50px] bg-gradient-to-b from-[#444] to-[#333] rounded-l-sm shadow-[-1px_0_3px_rgba(0,0,0,0.3)]" />

                  {/* Drop shadow on ground */}
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[70%] h-[30px] bg-blue-500/10 blur-2xl rounded-full" />
                </div>
              </motion.div>
            </motion.div>
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
            <span className="text-[10px] font-semibold text-white/25 uppercase tracking-[0.3em]">Scroll to explore</span>
            <div className="w-5 h-8 rounded-full border border-white/15 flex justify-center pt-1.5">
              <motion.div
                animate={{ y: [0, 10, 0], opacity: [1, 0.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1 h-2 rounded-full bg-white/30"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
