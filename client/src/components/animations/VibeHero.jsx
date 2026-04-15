import { useRef, useState, useCallback, useLayoutEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, MapPin, Navigation, Locate, Star, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────────────────────
   EASING: Car acceleration curve
   Slow start → fast middle → slow arrival
   ───────────────────────────────────────────────────────── */
function carEase(t) {
  if (t < 0.15) return t * t * (1 / 0.15); // slow start (quadratic in)
  if (t > 0.85) { const r = (1 - t) / 0.15; return 1 - r * r * 0.15; } // slow arrival
  return 0.15 + (t - 0.15) * (0.7 / 0.7); // linear cruise
}

/* ─────────────────────────────────────────────────────────
   BEZIER: Compute point on cubic bezier
   ───────────────────────────────────────────────────────── */
function bezier(t, p0, p1, p2, p3) {
  const u = 1 - t;
  return u*u*u*p0 + 3*u*u*t*p1 + 3*u*t*t*p2 + t*t*t*p3;
}
function bezierTangent(t, p0, p1, p2, p3) {
  const u = 1 - t;
  return 3*u*u*(p1-p0) + 6*u*t*(p2-p1) + 3*t*t*(p3-p2);
}

/* ═══════════════════════════════════════════════════════════
   PHONE SCREEN — Multi-Layer Depth Simulation
   ═══════════════════════════════════════════════════════════ */
function PhoneScreen({ progress, journeyActive }) {
  // Journey progress (0→1 only during phase 3-4, mapped from overall progress)
  const jp = Math.min(1, Math.max(0, journeyActive));
  const easedJp = carEase(jp);

  // ── Car path (cubic bezier) ──
  const sx=55, sy=550, c1x=90, c1y=380, c2x=230, c2y=250, ex=225, ey=145;
  const carX = bezier(easedJp, sx, c1x, c2x, ex);
  const carY = bezier(easedJp, sy, c1y, c2y, ey);
  const tx = bezierTangent(easedJp, sx, c1x, c2x, ex);
  const ty = bezierTangent(easedJp, sy, c1y, c2y, ey);
  const heading = Math.atan2(ty, tx) * (180/Math.PI);

  // ── Road scroll speed (matches car speed) ──
  const roadSpeed = jp < 0.15 ? jp * 4 : jp > 0.85 ? (1-jp) * 4 : 0.8;

  // ── Route draw ──
  const routePath = `M${sx},${sy} C${c1x},${c1y} ${c2x},${c2y} ${ex},${ey}`;
  const routeLen = 800;
  const routeOffset = routeLen - easedJp * routeLen;

  // ── Parking nodes ──
  const spots = [
    { x: 225, y: 145, dest: true },
    { x: 265, y: 220, dest: false },
    { x: 100, y: 190, dest: false },
    { x: 175, y: 330, dest: false },
    { x: 85, y: 110, dest: false },
  ];

  // ── Destination proximity ──
  const distDest = Math.sqrt((carX-spots[0].x)**2 + (carY-spots[0].y)**2);
  const nearDest = Math.max(0, 1 - distDest/150);

  // ── Arrival state ──
  const arrived = jp > 0.82;

  // ── Map parallax offsets (each layer at different speed) ──
  const roadLayerY = easedJp * -200;
  const routeLayerY = easedJp * -180;
  const spotLayerY = easedJp * -160;
  const carLayerY = easedJp * -170;

  return (
    <div className="absolute inset-0 bg-[#060a14] overflow-hidden rounded-[3.2rem]">

      {/* ═══ LAYER 0: INFINITE ROAD GRID (deepest) ═══ */}
      <div className="absolute inset-0 overflow-hidden" style={{ transform: `translateY(${roadLayerY * 0.5}px)` }}>
        {/* Infinite scrolling road pattern */}
        <div
          className="absolute inset-x-0 w-full"
          style={{
            height: '300%',
            top: '-100%',
            animation: `roadScroll ${3 / Math.max(0.1, roadSpeed)}s linear infinite`,
          }}
        >
          <svg className="w-full h-full" viewBox="0 0 320 2000" preserveAspectRatio="none">
            {/* CITY BLOCKS — perspective depth via opacity/size */}
            {Array.from({ length: 30 }, (_, i) => {
              const row = Math.floor(i / 3);
              const col = i % 3;
              const depth = 1 - (row / 10) * 0.3;
              const y = row * 200 + 20;
              const x = col * 110 + 10;
              const w = 70 + col * 10;
              const h = 50 + (row % 3) * 20;
              return (
                <rect key={i} x={x} y={y} width={w} height={h} rx="3"
                  fill={`rgba(255,255,255,${0.015 * depth})`}
                  stroke={`rgba(255,255,255,${0.03 * depth})`} strokeWidth="0.5" />
              );
            })}

            {/* ROADS */}
            {[160, 360, 560, 760, 960, 1160, 1360, 1560, 1760].map((y, i) => (
              <g key={`hr${i}`}>
                <line x1="0" y1={y} x2="320" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="24" />
                <line x1="0" y1={y} x2="320" y2={y} stroke="rgba(100,140,255,0.06)" strokeWidth="0.8" strokeDasharray="8 14" />
              </g>
            ))}
            {[100, 200, 270].map((x, i) => (
              <g key={`vr${i}`}>
                <line x1={x} y1="0" x2={x} y2="2000" stroke="rgba(255,255,255,0.05)" strokeWidth="22" />
                <line x1={x} y1="0" x2={x} y2="2000" stroke="rgba(100,140,255,0.06)" strokeWidth="0.8" strokeDasharray="8 14" />
              </g>
            ))}
          </svg>
        </div>

        {/* Depth fog (gradient to simulate distance) */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#060a14] to-transparent z-10" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#060a14] to-transparent z-10" />
      </div>

      {/* ═══ LAYER 1: ROUTE LINE ═══ */}
      <svg className="absolute inset-0 w-full h-full z-20" viewBox="0 0 320 660"
        style={{ transform: `translateY(${routeLayerY * 0.3}px)` }}>
        {/* Route glow */}
        <path d={routePath} fill="none" stroke="rgba(59,130,246,0.12)" strokeWidth="12"
          strokeDasharray={routeLen} strokeDashoffset={routeOffset} strokeLinecap="round"
          filter="url(#routeGlow)" />
        {/* Route solid */}
        <path d={routePath} fill="none" stroke="rgba(59,130,246,0.7)" strokeWidth="3"
          strokeDasharray={routeLen} strokeDashoffset={routeOffset} strokeLinecap="round" />
        {/* Moving dashes (direction indicator) */}
        <path d={routePath} fill="none" stroke="rgba(120,170,255,0.4)" strokeWidth="1.5"
          strokeDasharray="6 12" strokeDashoffset={routeOffset + (jp * 500 % 18)} strokeLinecap="round" />
        {/* Glow filter */}
        <defs>
          <filter id="routeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" />
          </filter>
        </defs>
      </svg>

      {/* ═══ LAYER 2: PARKING NODES ═══ */}
      <div className="absolute inset-0 z-30" style={{ transform: `translateY(${spotLayerY * 0.2}px)` }}>
        {spots.map((spot, i) => {
          const dist = Math.sqrt((carX-spot.x)**2 + (carY-spot.y)**2);
          const prox = Math.max(0, 1 - dist/120);
          const baseSize = spot.dest ? 14 + nearDest * 18 : 10 + prox * 6;
          const color = spot.dest ? '59,130,246' : '52,211,153';

          return (
            <div key={i} className="absolute" style={{ left: spot.x, top: spot.y, transform: 'translate(-50%,-50%)' }}>
              {/* Ripple (on destination arrival) */}
              {spot.dest && arrived && (
                <>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-full animate-ping" style={{
                      width: 60, height: 60,
                      backgroundColor: `rgba(${color},0.15)`,
                      animationDuration: '1.5s',
                    }} />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-full animate-ping" style={{
                      width: 90, height: 90,
                      backgroundColor: `rgba(${color},0.08)`,
                      animationDuration: '2s',
                      animationDelay: '0.3s',
                    }} />
                  </div>
                </>
              )}
              {/* Pulse */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-full animate-ping" style={{
                  width: baseSize * 2.5, height: baseSize * 2.5,
                  backgroundColor: `rgba(${color},${0.08 + prox * 0.2})`,
                  animationDuration: `${2.5 - prox}s`,
                }} />
              </div>
              {/* Core marker */}
              <div className="rounded-full flex items-center justify-center transition-all duration-300" style={{
                width: baseSize, height: baseSize,
                border: `2px solid rgba(${color},${0.4 + prox * 0.6})`,
                backgroundColor: `rgba(${color},${0.08 + prox * 0.25})`,
                boxShadow: `0 0 ${8 + prox * 30}px rgba(${color},${0.15 + prox * 0.45})`,
              }}>
                <div className="rounded-full" style={{
                  width: Math.max(2, baseSize * 0.25), height: Math.max(2, baseSize * 0.25),
                  backgroundColor: `rgba(${color},${0.6 + prox * 0.4})`,
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ LAYER 3: THE CAR ═══ */}
      <div className="absolute z-40" style={{
        left: carX,
        top: carY + carLayerY * 0.2,
        transform: `translate(-50%,-50%) rotate(${heading - 90}deg)`,
        transition: 'none',
      }}>
        {/* Headlight beam */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-8 w-10 h-12 opacity-30"
          style={{ background: 'linear-gradient(to top, rgba(200,220,255,0.2), transparent)', clipPath: 'polygon(30% 100%, 70% 100%, 100% 0%, 0% 0%)' }} />
        {/* Navigation pulse */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-blue-500/15 blur-xl" />
        {/* Car SVG */}
        <svg width="26" height="40" viewBox="0 0 26 40" fill="none" className="drop-shadow-[0_4px_12px_rgba(59,130,246,0.4)]">
          <rect x="2" y="5" width="22" height="30" rx="6" fill="url(#cg)" stroke="rgba(100,160,255,0.3)" strokeWidth="0.5" />
          <rect x="4" y="9" width="18" height="7" rx="3" fill="rgba(130,190,255,0.12)" />
          <rect x="4" y="24" width="18" height="5" rx="2" fill="rgba(130,190,255,0.08)" />
          <circle cx="7" cy="6" r="1.8" fill="#e0eaff" opacity="0.95">
            <animate attributeName="opacity" values="0.95;0.4;0.95" dur="1.2s" repeatCount="indefinite" />
          </circle>
          <circle cx="19" cy="6" r="1.8" fill="#e0eaff" opacity="0.95">
            <animate attributeName="opacity" values="0.95;0.4;0.95" dur="1.2s" repeatCount="indefinite" />
          </circle>
          <circle cx="7" cy="34" r="1.2" fill="#f87171" opacity="0.6" />
          <circle cx="19" cy="34" r="1.2" fill="#f87171" opacity="0.6" />
          <defs>
            <linearGradient id="cg" x1="13" y1="5" x2="13" y2="35" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#5b9fff" /><stop offset="1" stopColor="#2563eb" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ═══ LAYER 4: GPS HUD ═══ */}
      <div className="absolute top-14 left-5 right-5 z-50">
        <div className="flex items-center gap-3 px-3.5 py-3 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
          style={{ opacity: jp > 0.05 ? 1 : 0.4, transition: 'opacity 0.5s' }}>
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-[0_0_12px_rgba(59,130,246,0.2)]">
            <Navigation className="w-3.5 h-3.5 text-blue-400 fill-blue-400/30" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[7px] font-semibold text-white/25 uppercase tracking-[0.15em] leading-none mb-1">Navigating</p>
            <p className="text-[10px] font-bold text-white/80 leading-none truncate">Sector 7 Hub</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-bold text-emerald-400 leading-none">{Math.max(0, Math.round((1-easedJp)*4))} min</p>
            <div className="flex items-center gap-1 mt-0.5 justify-end">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
              <p className="text-[7px] text-white/20 leading-none">GPS</p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ LAYER 5: ARRIVAL CARD ═══ */}
      <div className="absolute bottom-5 left-4 right-4 z-50 transition-all duration-700"
        style={{ transform: `translateY(${arrived ? 0 : 130}px)`, opacity: arrived ? 1 : 0 }}>
        <div className="p-4 rounded-3xl bg-white/[0.04] backdrop-blur-3xl border border-white/[0.08] shadow-[0_-15px_50px_-10px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(52,211,153,0.2)]">
              <MapPin className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-bold text-white">Sector 7 Hub • A-12</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                <span className="text-[9px] text-white/40">4.8</span>
                <span className="text-[9px] text-white/20">•</span>
                <span className="text-[9px] text-white/40">Ground Floor</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-white leading-none">₹40</p>
              <p className="text-[8px] text-white/25 leading-none mt-0.5">/hour</p>
            </div>
          </div>
          <div className="flex gap-2 mb-3">
            {['1h','2h','4h'].map((d,i) => (
              <div key={i} className={`flex-1 py-1.5 rounded-xl text-center text-[9px] font-bold transition-all ${i===1 ? 'bg-blue-500/15 border border-blue-500/25 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.15)]' : 'bg-white/[0.02] border border-white/[0.05] text-white/30'}`}>{d}</div>
            ))}
          </div>
          <button className="w-full h-11 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center gap-2 relative overflow-hidden shadow-[0_8px_25px_-5px_rgba(59,130,246,0.45)]"
            style={{ animation: arrived ? 'btnPulse 2s ease-in-out infinite' : 'none' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2.5s_ease-in-out_infinite]" />
            <Locate className="w-3.5 h-3.5 text-white" />
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Book & Navigate</span>
          </button>
        </div>
      </div>

      {/* Status bar */}
      <div className="absolute top-3.5 left-7 right-7 flex justify-between items-center z-50 opacity-25">
        <span className="text-[10px] font-semibold text-white">9:41</span>
        <div className="flex gap-1 items-center">
          <div className="w-4 h-2.5 rounded-sm border border-white/40 relative p-[1px]"><div className="h-full w-3/4 bg-emerald-400 rounded-[1px]" /></div>
        </div>
      </div>
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/12 rounded-full z-50" />
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════
   MAIN HERO — CINEMATIC 5-PHASE SCROLL
   ═══════════════════════════════════════════════════════════ */
export default function VibeHero() {
  const sectionRef = useRef(null);
  const phoneRef = useRef(null);
  const textRef = useRef(null);
  const glowRef = useRef(null);
  const bgRef = useRef(null);
  const edgeLightRef = useRef(null);
  const navigate = useNavigate();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const sx = useSpring(mouseX, { stiffness: 80, damping: 20 });
  const sy = useSpring(mouseY, { stiffness: 80, damping: 20 });
  const tiltX = useTransform(sy, [-400, 400], [4, -4]);
  const tiltY = useTransform(sx, [-400, 400], [-4, 4]);

  const [scrollProg, setScrollProg] = useState(0);
  const [journeyProg, setJourneyProg] = useState(0);

  const handleMouse = useCallback((e) => {
    const r = sectionRef.current?.getBoundingClientRect();
    if (!r) return;
    mouseX.set(e.clientX - r.left - r.width/2);
    mouseY.set(e.clientY - r.top - r.height/2);
  }, [mouseX, mouseY]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 2,
          onUpdate: (self) => {
            const p = self.progress;
            setScrollProg(p);
            // Journey runs during phase 3-4 (0.25 → 0.75)
            const jp = Math.min(1, Math.max(0, (p - 0.25) / 0.5));
            setJourneyProg(jp);
          },
        },
      });

      /* ── PHASE 1 (0→0.15): Phone enters ── */
      tl.fromTo(phoneRef.current,
        { scale: 0.88, y: 40, rotateY: -8, rotateX: 5 },
        { scale: 1, y: 0, rotateY: 0, rotateX: 0, duration: 0.15, ease: 'none' }
      );

      /* ── PHASE 2 (0.15→0.3): Zoom into phone, text exits ── */
      tl.to(phoneRef.current,
        { scale: 1.35, y: -20, rotateY: 3, rotateX: 8, duration: 0.15, ease: 'none' }
      );
      tl.to(textRef.current,
        { opacity: 0, x: -80, duration: 0.12, ease: 'none' }, 0.15
      );
      tl.to(bgRef.current,
        { opacity: 0.3, duration: 0.15, ease: 'none' }, 0.15
      );

      /* ── PHASE 3-4 (0.3→0.8): Journey plays (driven by journeyProg state) ── */
      tl.to(phoneRef.current,
        { scale: 1.45, y: -10, rotateY: -2, rotateX: 12, duration: 0.5, ease: 'none' }
      );
      tl.to(glowRef.current,
        { scale: 1.8, opacity: 0.9, duration: 0.35, ease: 'none' }, 0.3
      );

      /* ── PHASE 5 (0.8→1): Phone settles, glow dims ── */
      tl.to(phoneRef.current,
        { scale: 1.1, y: 30, rotateY: -6, rotateX: 4, duration: 0.2, ease: 'none' }
      );
      tl.to(glowRef.current,
        { scale: 1, opacity: 0.4, duration: 0.2, ease: 'none' }, 0.8
      );

      /* ── Edge light sweep (continuous) ── */
      tl.fromTo(edgeLightRef.current,
        { x: '-120%' },
        { x: '120%', duration: 1, ease: 'none' }, 0
      );

    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouse}
      className="relative"
      style={{ height: '400vh' }}
    >
      {/* STICKY VIEWPORT */}
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">

        {/* ── BACKGROUND ── */}
        <div ref={bgRef} className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at 60% 40%, rgba(59,130,246,0.07) 0%, transparent 55%), radial-gradient(ellipse at 35% 65%, rgba(139,92,246,0.05) 0%, transparent 45%)',
          }} />
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
        </div>

        {/* ── CONTENT LAYOUT ── */}
        <div className="relative z-10 max-w-[1400px] mx-auto w-full px-6 grid lg:grid-cols-[1fr_auto] gap-12 lg:gap-16 items-center">

          {/* LEFT TEXT */}
          <div ref={textRef} className="max-w-xl">
            <motion.div initial={{ opacity: 0, y: 35 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16,1,0.3,1] }} className="space-y-10">
              <div className="space-y-6">
                <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06]">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                  <span className="text-[11px] font-semibold text-white/40 uppercase tracking-[0.2em]">Live • 5,000+ spots</span>
                </motion.div>
                <motion.h1 initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.3 }}
                  className="text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.02]">
                  Find Parking<br />
                  <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">Near You</span><br />
                  Anytime
                </motion.h1>
                <motion.p initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}
                  className="text-base md:text-lg text-white/35 leading-relaxed">
                  Discover private parking, navigate in real-time, pay by the hour.
                </motion.p>
              </div>
              <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.7 }} className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => navigate('/search')}
                  className="group flex items-center gap-3 px-7 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-sm tracking-wide shadow-[0_15px_40px_-10px_rgba(59,130,246,0.5)] hover:scale-[1.03] active:scale-[0.97] transition-all duration-300">
                  <MapPin className="w-4 h-4" /> Find Parking <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button onClick={() => navigate('/register')}
                  className="px-7 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] text-white/50 hover:text-white font-bold text-sm tracking-wide hover:scale-[1.03] active:scale-[0.97] transition-all duration-300">
                  List Your Space
                </button>
              </motion.div>
            </motion.div>
          </div>

          {/* RIGHT: 3D PHONE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 1, ease: [0.16,1,0.3,1] }}
            className="flex justify-center lg:justify-end relative"
            style={{ perspective: 1200 }}
          >
            {/* Ambient glow */}
            <div ref={glowRef} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full pointer-events-none opacity-50"
              style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, rgba(139,92,246,0.08) 40%, transparent 70%)' }} />

            {/* Phone with GSAP + mouse tilt */}
            <motion.div ref={phoneRef} style={{ rotateX: tiltX, rotateY: tiltY, transformStyle: 'preserve-3d' }}>
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
                <div className="relative w-[290px] h-[610px] md:w-[310px] md:h-[650px]">
                  {/* Frame */}
                  <div className="absolute inset-0 rounded-[3.5rem] bg-gradient-to-b from-[#2e2e32] via-[#1d1d21] to-[#151518] border border-white/[0.07] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.04)]">
                    {/* Dynamic Island */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[88px] h-[26px] bg-black rounded-full z-50 flex items-center justify-center gap-2">
                      <div className="w-[9px] h-[9px] rounded-full bg-[#1a1a1d] border border-white/[0.05]" />
                      <div className="w-[5px] h-[5px] rounded-full bg-[#0f0f12]" />
                    </div>
                    {/* Screen */}
                    <div className="absolute inset-[5px] rounded-[3.2rem] overflow-hidden">
                      <PhoneScreen progress={scrollProg} journeyActive={journeyProg} />
                    </div>
                    {/* Edge light sweep */}
                    <div ref={edgeLightRef} className="absolute inset-0 w-16 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent skew-x-[-12deg] pointer-events-none z-40 rounded-[3.5rem]" />
                    {/* Screen reflection */}
                    <div className="absolute inset-[5px] rounded-[3.2rem] pointer-events-none z-30"
                      style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 50%, rgba(255,255,255,0.01) 100%)' }} />
                  </div>
                  {/* Buttons */}
                  <div className="absolute -right-[2px] top-[168px] w-[3px] h-[48px] bg-gradient-to-b from-[#404044] to-[#2a2a2e] rounded-r-sm" />
                  <div className="absolute -left-[2px] top-[143px] w-[3px] h-[24px] bg-gradient-to-b from-[#404044] to-[#2a2a2e] rounded-l-sm" />
                  <div className="absolute -left-[2px] top-[178px] w-[3px] h-[48px] bg-gradient-to-b from-[#404044] to-[#2a2a2e] rounded-l-sm" />
                  {/* Ground shadow */}
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[65%] h-6 bg-blue-500/8 blur-xl rounded-full" />
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2" style={{ opacity: scrollProg > 0.1 ? 0 : 1, transition: 'opacity 0.5s' }}>
          <motion.div animate={{ y:[0,8,0] }} transition={{ duration:2, repeat:Infinity }} className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-semibold text-white/20 uppercase tracking-[0.3em]">Scroll to explore</span>
            <div className="w-5 h-8 rounded-full border border-white/12 flex justify-center pt-1.5">
              <motion.div animate={{ y:[0,10,0], opacity:[1,0.2,1] }} transition={{ duration:2, repeat:Infinity }} className="w-1 h-2 rounded-full bg-white/25" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
