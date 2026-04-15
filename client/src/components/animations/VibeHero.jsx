import { useRef, useState, useCallback, useLayoutEffect, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, MapPin, Navigation, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ─── Custom ease: slow → cruise → slow (natural driving) ─── */
function driveEase(t) {
  // Sine-based ease: slow start, smooth cruise, gentle stop
  return 0.5 - 0.5 * Math.cos(Math.PI * t);
}

/* ─── Bezier math ─── */
function bz(t, a, b, c, d) {
  const u = 1 - t;
  return u*u*u*a + 3*u*u*t*b + 3*u*t*t*c + t*t*t*d;
}
function bzTan(t, a, b, c, d) {
  const u = 1 - t;
  return 3*u*u*(b-a) + 6*u*t*(c-b) + 3*t*t*(d-c);
}


/* ═══════════════════════════════════════════════════
   PHONE SCREEN — Minimal, Realistic Apple Maps Style
   ═══════════════════════════════════════════════════ */
function PhoneScreen({ journey }) {
  const j = Math.min(1, Math.max(0, journey));
  const ej = driveEase(j);

  // Car path
  const sx=60, sy=480, c1x=80, c1y=340, c2x=210, c2y=220, ex=215, ey=160;
  const cx = bz(ej, sx, c1x, c2x, ex);
  const cy = bz(ej, sy, c1y, c2y, ey);
  const tx = bzTan(ej, sx, c1x, c2x, ex);
  const ty = bzTan(ej, sy, c1y, c2y, ey);
  const heading = Math.atan2(ty, tx) * (180/Math.PI);

  // Route
  const route = `M${sx},${sy} C${c1x},${c1y} ${c2x},${c2y} ${ex},${ey}`;
  const rLen = 700;

  // Parallax
  const mapShift = ej * -140;

  // Arrival state (no constant animations — only triggered)
  const arrived = j > 0.85;
  const approaching = j > 0.6;

  // Spots — muted, realistic
  const spots = [
    { x: 215, y: 160, dest: true, label: 'A-12' },
    { x: 248, y: 228, dest: false },
    { x: 118, y: 198, dest: false },
    { x: 165, y: 310, dest: false },
  ];

  return (
    <div className="absolute inset-0 bg-[#1c1c1e] overflow-hidden rounded-[3rem]">

      {/* ── MAP LAYER (subtle, desaturated) ── */}
      <div className="absolute inset-x-0 top-0 h-[170%]" style={{ transform: `translateY(${mapShift}px)`, filter: 'blur(0.3px)' }}>
        <svg className="w-full h-full" viewBox="0 0 320 900" preserveAspectRatio="none">
          {/* Building blocks — very subtle */}
          {[
            [25,40,55,70],[115,25,65,90],[220,60,75,80],
            [35,180,85,55],[175,170,95,65],
            [28,330,70,45],[145,320,90,70],[255,310,40,55],
            [55,460,90,60],[195,440,75,80],
            [20,600,65,70],[135,580,85,55],[245,610,50,40],
            [75,730,55,45],[180,710,95,65],
          ].map(([x,y,w,h],i) => (
            <rect key={i} x={x} y={y} width={w} height={h} rx="3"
              fill="rgba(255,255,255,0.018)" stroke="rgba(255,255,255,0.025)" strokeWidth="0.5" />
          ))}
          {/* Roads — quiet gray */}
          {[130,270,420,570,720].map((y,i) => (
            <line key={`h${i}`} x1="0" y1={y} x2="320" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="18" />
          ))}
          {[95,195,265].map((x,i) => (
            <line key={`v${i}`} x1={x} y1="0" x2={x} y2="900" stroke="rgba(255,255,255,0.04)" strokeWidth="16" />
          ))}
        </svg>
      </div>

      {/* ── ROUTE LINE (draws with scroll) ── */}
      <svg className="absolute inset-0 w-full h-full z-10" viewBox="0 0 320 560"
        style={{ transform: `translateY(${mapShift * 0.3}px)` }}>
        <defs>
          <filter id="softGlow"><feGaussianBlur in="SourceGraphic" stdDeviation="4" /></filter>
        </defs>
        {/* Soft glow under route */}
        <path d={route} fill="none" stroke="rgba(0,122,255,0.1)" strokeWidth="8"
          strokeDasharray={rLen} strokeDashoffset={rLen - ej * rLen} strokeLinecap="round" filter="url(#softGlow)" />
        {/* Route line */}
        <path d={route} fill="none" stroke="rgba(0,122,255,0.55)" strokeWidth="2.5"
          strokeDasharray={rLen} strokeDashoffset={rLen - ej * rLen} strokeLinecap="round" />
      </svg>

      {/* ── PARKING SPOTS (static until approached) ── */}
      <div className="absolute inset-0 z-20" style={{ transform: `translateY(${mapShift * 0.2}px)` }}>
        {spots.map((s, i) => {
          const d = Math.sqrt((cx-s.x)**2 + (cy-s.y)**2);
          const near = Math.max(0, 1 - d/100);
          const size = s.dest ? (10 + (arrived ? 6 : 0)) : 8;

          return (
            <div key={i} className="absolute transition-all duration-700" style={{
              left: s.x, top: s.y, transform: 'translate(-50%,-50%)',
              // Only the destination gets emphasis, and only when arriving
              opacity: s.dest ? 1 : (0.4 + near * 0.4),
            }}>
              {/* Arrival indicator — single soft ring, NOT a constant ping */}
              {s.dest && arrived && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border border-[rgba(0,122,255,0.25)] transition-all duration-1000"
                    style={{ transform: `scale(${arrived ? 1 : 0})`, opacity: arrived ? 1 : 0 }} />
                </div>
              )}
              <div className="rounded-full transition-all duration-500" style={{
                width: size, height: size,
                backgroundColor: s.dest
                  ? (arrived ? 'rgba(0,122,255,0.25)' : 'rgba(0,122,255,0.12)')
                  : 'rgba(255,255,255,0.08)',
                border: `1.5px solid ${s.dest
                  ? (arrived ? 'rgba(0,122,255,0.6)' : 'rgba(0,122,255,0.3)')
                  : 'rgba(255,255,255,0.12)'}`,
                boxShadow: s.dest && arrived ? '0 0 20px rgba(0,122,255,0.2)' : 'none',
              }}>
              </div>
              {/* Label — only on destination, only when close */}
              {s.dest && approaching && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap transition-opacity duration-500"
                  style={{ opacity: approaching ? 1 : 0 }}>
                  <span className="text-[8px] font-semibold text-[rgba(0,122,255,0.7)] tracking-wide">{s.label}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── CAR ── */}
      <div className="absolute z-30" style={{
        left: cx, top: cy + mapShift * 0.2,
        transform: `translate(-50%,-50%) rotate(${heading - 90}deg)`,
      }}>
        {/* Soft shadow under car */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-10 bg-black/20 rounded-full blur-md" />
        <svg width="22" height="34" viewBox="0 0 22 34" fill="none">
          <rect x="2" y="4" width="18" height="26" rx="5" fill="#007AFF" />
          <rect x="4" y="8" width="14" height="5" rx="2" fill="rgba(255,255,255,0.1)" />
          <rect x="4" y="21" width="14" height="4" rx="1.5" fill="rgba(255,255,255,0.06)" />
          <circle cx="6" cy="5" r="1.5" fill="rgba(255,255,255,0.85)" />
          <circle cx="16" cy="5" r="1.5" fill="rgba(255,255,255,0.85)" />
          <circle cx="6" cy="29" r="1" fill="rgba(255,100,100,0.5)" />
          <circle cx="16" cy="29" r="1" fill="rgba(255,100,100,0.5)" />
        </svg>
      </div>

      {/* ── NAV BAR (minimal, appears with journey) ── */}
      <div className="absolute top-14 left-4 right-4 z-40 transition-all duration-500"
        style={{ opacity: j > 0.05 ? 1 : 0, transform: `translateY(${j > 0.05 ? 0 : -10}px)` }}>
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl bg-[rgba(28,28,30,0.85)] backdrop-blur-xl border border-white/[0.06]">
          <div className="w-7 h-7 rounded-lg bg-[rgba(0,122,255,0.1)] flex items-center justify-center">
            <Navigation className="w-3 h-3 text-[#007AFF]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[7px] font-medium text-white/25 uppercase tracking-wider leading-none mb-0.5">Navigating</p>
            <p className="text-[10px] font-semibold text-white/75 leading-none">Sector 7 Hub</p>
          </div>
          <span className="text-[10px] font-semibold text-[#34C759]">{Math.max(0, Math.round((1-ej)*4))} min</span>
        </div>
      </div>

      {/* ── ARRIVAL CARD (slides up precisely when arrived) ── */}
      <div className="absolute bottom-5 left-3.5 right-3.5 z-40 transition-all"
        style={{
          transform: `translateY(${arrived ? 0 : 100}px)`,
          opacity: arrived ? 1 : 0,
          transitionDuration: '800ms',
          transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        }}>
        <div className="p-3.5 rounded-2xl bg-[rgba(28,28,30,0.9)] backdrop-blur-xl border border-white/[0.06]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-[rgba(0,122,255,0.08)] flex items-center justify-center">
              <MapPin className="w-4 h-4 text-[#007AFF]" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-semibold text-white/85">Sector 7 Hub • A-12</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Star className="w-2.5 h-2.5 text-[#FF9F0A] fill-[#FF9F0A]" />
                <span className="text-[9px] text-white/35">4.8 • Ground Floor</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-base font-bold text-white leading-none">₹40</p>
              <p className="text-[8px] text-white/25">/hour</p>
            </div>
          </div>
          <button className="w-full h-10 rounded-xl bg-[#007AFF] flex items-center justify-center gap-2 active:scale-[0.97] transition-transform duration-150">
            <span className="text-[11px] font-semibold text-white tracking-wide">Book This Spot</span>
          </button>
        </div>
      </div>

      {/* Status bar */}
      <div className="absolute top-3 left-6 right-6 flex justify-between items-center z-50 text-white/25">
        <span className="text-[10px] font-medium">9:41</span>
        <div className="w-5 h-2.5 rounded-sm border border-white/25 relative p-[1px]">
          <div className="h-full w-3/4 bg-white/40 rounded-[1px]" />
        </div>
      </div>
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-[3px] bg-white/15 rounded-full z-50" />
    </div>
  );
}


/* ═══════════════════════════════════════════════════
   WORD-BY-WORD HEADLINE REVEAL
   ═══════════════════════════════════════════════════ */
function RevealHeadline({ children, className }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const words = ref.current?.querySelectorAll('.reveal-word');
    if (!words?.length) return;

    gsap.fromTo(words,
      { opacity: 0, y: 18 },
      {
        opacity: 1, y: 0,
        duration: 0.6,
        stagger: 0.06,
        ease: 'cubic-bezier(0.22, 1, 0.36, 1)',
        delay: 0.4,
      }
    );
  }, []);

  const lines = typeof children === 'string' ? [children] : children;

  return (
    <h1 ref={ref} className={className}>
      {lines}
    </h1>
  );
}

function WordWrap({ children, gradient }) {
  const words = children.split(' ');
  return (
    <>
      {words.map((w, i) => (
        <span key={i} className={`reveal-word inline-block mr-[0.25em] ${gradient || ''}`} style={{ opacity: 0 }}>
          {w}
        </span>
      ))}
    </>
  );
}


/* ═══════════════════════════════════════════════════
   MAIN HERO — CINEMATIC, INTENTIONAL, APPLE-GRADE
   ═══════════════════════════════════════════════════ */
export default function VibeHero() {
  const sectionRef = useRef(null);
  const phoneRef = useRef(null);
  const textRef = useRef(null);
  const glowRef = useRef(null);
  const bgRef = useRef(null);
  const lightRef = useRef(null);
  const navigate = useNavigate();

  // Mouse tilt — very subtle (±3°)
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 60, damping: 20 });
  const smy = useSpring(my, { stiffness: 60, damping: 20 });
  const tiltX = useTransform(smy, [-400, 400], [3, -3]);
  const tiltY = useTransform(smx, [-400, 400], [-3, 3]);

  const [journey, setJourney] = useState(0);

  const handleMouse = useCallback((e) => {
    const r = sectionRef.current?.getBoundingClientRect();
    if (!r) return;
    mx.set(e.clientX - r.left - r.width/2);
    my.set(e.clientY - r.top - r.height/2);
  }, [mx, my]);

  // GSAP Scroll Timeline
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const ease = 'none'; // scrub handles easing

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 2.5, // Very smooth scrub
          onUpdate: (self) => {
            const p = self.progress;
            const jp = Math.min(1, Math.max(0, (p - 0.2) / 0.55));
            setJourney(jp);
          },
        },
      });

      // ── Phase 1 (0→0.15): Phone enters from depth ──
      tl.fromTo(phoneRef.current,
        { scale: 0.92, y: 30, rotateY: -4, rotateX: 2, opacity: 0.8 },
        { scale: 1, y: 0, rotateY: 0, rotateX: 0, opacity: 1, duration: 0.15, ease },
      );

      // ── Phase 2 (0.15→0.3): Zoom + text exits ──
      tl.to(phoneRef.current,
        { scale: 1.25, y: -15, rotateX: 6, rotateY: 2, duration: 0.15, ease },
      );
      tl.to(textRef.current,
        { opacity: 0, x: -60, filter: 'blur(4px)', duration: 0.12, ease },
        0.18,
      );
      tl.to(bgRef.current,
        { opacity: 0.15, duration: 0.12, ease },
        0.18,
      );

      // ── Phase 3-4 (0.3→0.8): Journey (state-driven) + phone grows ──
      tl.to(phoneRef.current,
        { scale: 1.35, rotateX: 8, rotateY: -1.5, duration: 0.5, ease },
      );
      // Glow appears softly during journey
      tl.to(glowRef.current,
        { opacity: 0.6, scale: 1.3, duration: 0.3, ease },
        0.35,
      );

      // ── Phase 5 (0.8→1): Settle ──
      tl.to(phoneRef.current,
        { scale: 1.1, y: 20, rotateX: 3, rotateY: -3, duration: 0.2, ease },
      );
      tl.to(glowRef.current,
        { opacity: 0.2, scale: 1, duration: 0.2, ease },
        0.8,
      );

      // Edge light — single sweep across the scroll range
      tl.fromTo(lightRef.current,
        { x: '-150%' },
        { x: '150%', duration: 0.6, ease },
        0.2,
      );

    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouse}
      className="relative bg-[#000]"
      style={{ height: '350vh' }}
    >
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">

        {/* Background */}
        <div ref={bgRef} className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at 55% 45%, rgba(255,255,255,0.03) 0%, transparent 60%)',
          }} />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-[1300px] mx-auto w-full px-8 grid lg:grid-cols-[1fr_auto] gap-16 items-center">

          {/* LEFT: TEXT */}
          <div ref={textRef} className="max-w-lg">
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/[0.06]"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
                <span className="text-[11px] font-medium text-white/35 tracking-wide">5,000+ parking spots live</span>
              </motion.div>

              <RevealHeadline className="text-[3.2rem] md:text-[3.8rem] lg:text-[4.5rem] font-bold text-white tracking-[-0.03em] leading-[1.05]">
                <WordWrap>Find Parking</WordWrap>
                <br />
                <WordWrap gradient="bg-gradient-to-r from-[#007AFF] to-[#5AC8FA] bg-clip-text text-transparent">Near You</WordWrap>
                <br />
                <WordWrap>Anytime</WordWrap>
              </RevealHeadline>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="text-[15px] text-white/30 leading-[1.7] max-w-md"
              >
                Discover private parking near you. Navigate in real-time. Pay only for what you use.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="flex gap-3 pt-2"
              >
                <button onClick={() => navigate('/search')}
                  className="group flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#007AFF] text-white text-[13px] font-semibold tracking-wide active:scale-[0.97] hover:bg-[#0066D6] transition-all duration-200">
                  Find Parking
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-200" />
                </button>
                <button onClick={() => navigate('/register')}
                  className="px-6 py-3.5 rounded-xl border border-white/[0.08] text-white/45 text-[13px] font-semibold tracking-wide active:scale-[0.97] hover:text-white/65 hover:border-white/12 transition-all duration-200">
                  List Your Space
                </button>
              </motion.div>
            </div>
          </div>

          {/* RIGHT: PHONE */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center lg:justify-end relative"
            style={{ perspective: 1200 }}
          >
            {/* Ambient glow — subtle, NOT permanent */}
            <div ref={glowRef}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full pointer-events-none opacity-20"
              style={{ background: 'radial-gradient(circle, rgba(0,122,255,0.12) 0%, transparent 65%)' }}
            />

            <motion.div ref={phoneRef} style={{ rotateX: tiltX, rotateY: tiltY, transformStyle: 'preserve-3d' }}>
              <div className="relative w-[280px] h-[590px] md:w-[300px] md:h-[630px]">
                {/* Chassis */}
                <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-b from-[#2c2c2e] via-[#1c1c1e] to-[#161618] border border-white/[0.06] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]">
                  {/* Dynamic Island */}
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-[82px] h-[24px] bg-black rounded-full z-50 flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#1c1c1e]/80" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#111]" />
                  </div>
                  {/* Screen */}
                  <div className="absolute inset-[4px] rounded-[2.8rem] overflow-hidden">
                    <PhoneScreen journey={journey} />
                  </div>
                  {/* Edge light (single sweep, GSAP-driven) */}
                  <div ref={lightRef}
                    className="absolute inset-0 w-12 bg-gradient-to-r from-transparent via-white/[0.025] to-transparent pointer-events-none z-40 rounded-[3rem]" />
                  {/* Screen reflection (static, very subtle) */}
                  <div className="absolute inset-[4px] rounded-[2.8rem] pointer-events-none z-30"
                    style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.015) 0%, transparent 40%)' }} />
                </div>
                {/* Side buttons */}
                <div className="absolute -right-[1.5px] top-[165px] w-[2.5px] h-[44px] bg-[#3a3a3c] rounded-r-sm" />
                <div className="absolute -left-[1.5px] top-[140px] w-[2.5px] h-[22px] bg-[#3a3a3c] rounded-l-sm" />
                <div className="absolute -left-[1.5px] top-[172px] w-[2.5px] h-[44px] bg-[#3a3a3c] rounded-l-sm" />
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator — fades on scroll */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 transition-opacity duration-500"
          style={{ opacity: journey > 0 ? 0 : 0.3 }}>
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-medium text-white/25 tracking-[0.25em] uppercase">Scroll</span>
            <div className="w-[18px] h-7 rounded-full border border-white/10 flex justify-center pt-1">
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: [0.22, 1, 0.36, 1] }}
                className="w-[3px] h-[6px] rounded-full bg-white/20"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
