import { useRef, useCallback, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, Navigation, Star } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

const ROUTE_PATH = 'M60,480 C85,340 200,250 215,155';

export default function VibeHero() {
  const heroRef = useRef(null);
  const phoneRef = useRef(null);
  const mapLayerRef = useRef(null);
  const routePathRef = useRef(null);
  const routeGlowRef = useRef(null);
  const carRef = useRef(null);
  const destNodeRef = useRef(null);
  const destRingRef = useRef(null);
  const destGlowRef = useRef(null);
  const uiNavRef = useRef(null);
  const uiCardRef = useRef(null);
  const textRef = useRef(null);
  const lightRef = useRef(null);
  const glowRef = useRef(null);
  const bgRef = useRef(null);
  const etaRef = useRef(null);
  const navigate = useNavigate();

  const handleMouse = useCallback((e) => {
    const r = heroRef.current?.getBoundingClientRect();
    if (!r) return;
    const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    const ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
    gsap.to(phoneRef.current, {
      rotateY: nx * 3,
      rotateX: ny * -3,
      duration: 0.8,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  }, []);

  useLayoutEffect(() => {
    const routeEl = routePathRef.current;
    const routeGlowEl = routeGlowRef.current;
    if (routeEl) {
      const len = routeEl.getTotalLength();
      gsap.set(routeEl, { strokeDasharray: len, strokeDashoffset: len });
      gsap.set(routeGlowEl, { strokeDasharray: len, strokeDashoffset: len });
    }

    gsap.set(carRef.current, { opacity: 0, scale: 0 });
    gsap.set(uiNavRef.current, { y: -20, opacity: 0 });
    gsap.set(uiCardRef.current, { y: '100%', opacity: 0 });
    gsap.set(destRingRef.current, { scale: 0, opacity: 0 });
    gsap.set(destGlowRef.current, { scale: 0, opacity: 0 });
    gsap.set(lightRef.current, { x: '-150%' });
    gsap.set(glowRef.current, { scale: 0.8, opacity: 0 });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: '+=2500',
          scrub: 2,
          pin: true,
        },
      });

      tl.fromTo(
        phoneRef.current,
        { scale: 0.92, rotateY: 10, opacity: 0.7 },
        { scale: 1, rotateY: 0, opacity: 1, duration: 0.8, ease: 'power2.inOut' },
        0
      );

      tl.to(
        phoneRef.current,
        { scale: 1.2, y: -20, duration: 1.1, ease: 'power2.inOut' },
        0.7
      );
      tl.to(
        textRef.current,
        { opacity: 0, x: -50, filter: 'blur(3px)', duration: 0.8, ease: 'power2.in' },
        0.9
      );
      tl.to(
        bgRef.current,
        { opacity: 0.08, duration: 0.8, ease: 'power2.in' },
        0.9
      );
      tl.to(
        glowRef.current,
        { scale: 1.2, opacity: 0.5, duration: 1, ease: 'power2.inOut' },
        1.0
      );

      tl.to(
        mapLayerRef.current,
        { y: -180, duration: 3, ease: 'power2.inOut' },
        1.5
      );

      tl.to(
        routePathRef.current,
        { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut' },
        1.8
      );
      tl.to(
        routeGlowRef.current,
        { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut' },
        1.8
      );

      tl.to(
        carRef.current,
        { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' },
        2.0
      );
      tl.to(
        uiNavRef.current,
        { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' },
        2.2
      );
      tl.to(
        carRef.current,
        {
          motionPath: {
            path: ROUTE_PATH,
            align: 'self',
            alignOrigin: [0.5, 0.5],
            autoRotate: -90,
          },
          duration: 2.5,
          ease: 'power2.inOut',
        },
        2.0
      );
      tl.to(
        phoneRef.current,
        { scale: 1.3, rotateX: 6, rotateY: -2, duration: 2.5, ease: 'power2.inOut' },
        2.0
      );
      tl.to(
        lightRef.current,
        { x: '150%', duration: 2, ease: 'power2.inOut' },
        2.5
      );

      tl.to(
        destNodeRef.current,
        { scale: 1.4, duration: 0.3, ease: 'power2.in' },
        4.3
      );
      tl.to(
        destNodeRef.current,
        { scale: 1, duration: 0.4, ease: 'power2.out' },
        4.6
      );
      tl.to(
        destRingRef.current,
        { scale: 1, opacity: 0.5, duration: 0.5, ease: 'power2.out' },
        4.3
      );
      tl.to(
        destRingRef.current,
        { scale: 1.8, opacity: 0, duration: 0.6, ease: 'power2.in' },
        4.8
      );
      tl.to(
        destGlowRef.current,
        { scale: 1, opacity: 0.4, duration: 0.4, ease: 'power2.out' },
        4.3
      );
      tl.to(
        destGlowRef.current,
        { opacity: 0, duration: 0.5, ease: 'power2.in' },
        4.9
      );

      tl.to(
        uiCardRef.current,
        { y: '0%', opacity: 1, duration: 0.8, ease: 'power2.inOut' },
        4.8
      );

      tl.to(
        phoneRef.current,
        { scale: 1.1, rotateY: -4, rotateX: 2, y: 10, duration: 1, ease: 'power2.inOut' },
        5.5
      );
      tl.to(
        glowRef.current,
        { opacity: 0.15, scale: 1, duration: 0.8, ease: 'power2.in' },
        5.5
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouse}
      className="relative h-screen bg-black overflow-hidden"
    >
      <div ref={bgRef} className="absolute inset-0 pointer-events-none" style={{ willChange: 'opacity' }}>
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 55% 45%, rgba(255,255,255,0.025) 0%, transparent 55%)',
          }}
        />
      </div>

      <div className="relative z-10 h-full max-w-[1300px] mx-auto px-8 flex items-center">
        <div className="w-full grid lg:grid-cols-[1fr_auto] gap-16 items-center">
          <div ref={textRef} className="max-w-lg" style={{ willChange: 'transform, opacity, filter' }}>
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/[0.06]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#30D158]" />
                <span className="text-[11px] font-medium text-white/30 tracking-wide">5,000+ spots live</span>
              </div>

              <h1 className="text-[3.5rem] md:text-[4rem] lg:text-[4.5rem] font-semibold text-white tracking-[-0.03em] leading-[1.08]">
                Find Parking
                <br />
                <span className="text-[#0A84FF]">Near You</span>
                <br />
                Anytime
              </h1>

              <p className="text-[15px] text-white/28 leading-[1.7] max-w-md">
                Discover private parking near you. Navigate in real-time. Pay only for what you use.
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => navigate('/search')}
                  className="group flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#0A84FF] text-white text-[13px] font-semibold tracking-wide active:scale-[0.97] hover:bg-[#0070E0] transition-all duration-200"
                >
                  Find Parking
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-200" />
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-6 py-3.5 rounded-xl border border-white/[0.08] text-white/40 text-[13px] font-semibold tracking-wide active:scale-[0.97] hover:text-white/55 hover:border-white/[0.12] transition-all duration-200"
                >
                  List Your Space
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end relative" style={{ perspective: 1200 }}>
            <div
              ref={glowRef}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(10,132,255,0.1) 0%, transparent 60%)',
                willChange: 'transform, opacity',
              }}
            />

            <div ref={phoneRef} style={{ transformStyle: 'preserve-3d', willChange: 'transform, opacity' }}>
              <div className="relative w-[280px] h-[580px] md:w-[295px] md:h-[620px]">
                <div className="absolute inset-0 rounded-[2.8rem] bg-gradient-to-b from-[#2c2c2e] via-[#1c1c1e] to-[#161618] border border-white/[0.05] shadow-[0_35px_70px_-18px_rgba(0,0,0,0.75)]">
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-[78px] h-[22px] bg-black rounded-full z-50" />

                  <div className="absolute inset-[4px] rounded-[2.6rem] overflow-hidden bg-[#1c1c1e]">
                    <div ref={mapLayerRef} className="absolute inset-x-0 top-0 w-full h-[170%]" style={{ willChange: 'transform', filter: 'blur(0.2px)' }}>
                      <svg className="w-full h-full" viewBox="0 0 300 850" preserveAspectRatio="none">
                        {[
                          [20, 30, 50, 65], [105, 20, 60, 85], [200, 55, 70, 75],
                          [30, 170, 80, 50], [160, 160, 90, 60],
                          [25, 310, 65, 42], [135, 300, 85, 65], [235, 295, 38, 52],
                          [50, 430, 85, 55], [180, 420, 70, 75],
                          [18, 570, 60, 65], [125, 555, 80, 50], [225, 580, 45, 38],
                          [70, 700, 50, 42], [165, 685, 90, 60],
                        ].map(([x, y, w, h], i) => (
                          <rect key={i} x={x} y={y} width={w} height={h} rx="2.5" fill="rgba(255,255,255,0.015)" stroke="rgba(255,255,255,0.022)" strokeWidth="0.5" />
                        ))}
                        {[120, 260, 400, 540, 680].map((y, i) => (
                          <line key={`h${i}`} x1="0" y1={y} x2="300" y2={y} stroke="rgba(255,255,255,0.035)" strokeWidth="16" />
                        ))}
                        {[85, 180, 245].map((x, i) => (
                          <line key={`v${i}`} x1={x} y1="0" x2={x} y2="850" stroke="rgba(255,255,255,0.035)" strokeWidth="14" />
                        ))}
                      </svg>
                    </div>

                    <svg className="absolute inset-0 w-full h-full z-10" viewBox="0 0 300 560">
                      <defs>
                        <filter id="rGlow"><feGaussianBlur in="SourceGraphic" stdDeviation="3.5" /></filter>
                      </defs>
                      <path ref={routeGlowRef} d={ROUTE_PATH} fill="none" stroke="rgba(10,132,255,0.1)" strokeWidth="8" strokeLinecap="round" filter="url(#rGlow)" />
                      <path ref={routePathRef} d={ROUTE_PATH} fill="none" stroke="rgba(10,132,255,0.5)" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>

                    <div className="absolute inset-0 z-20">
                      {[
                        { x: 248, y: 225 },
                        { x: 118, y: 195 },
                        { x: 165, y: 310 },
                      ].map((s, i) => (
                        <div
                          key={i}
                          className="absolute w-[7px] h-[7px] rounded-full"
                          style={{
                            left: s.x,
                            top: s.y,
                            transform: 'translate(-50%,-50%)',
                            backgroundColor: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.1)',
                          }}
                        />
                      ))}

                      <div className="absolute" style={{ left: 215, top: 155, transform: 'translate(-50%,-50%)' }}>
                        <div ref={destRingRef} className="absolute inset-0 flex items-center justify-center" style={{ willChange: 'transform, opacity' }}>
                          <div className="w-10 h-10 rounded-full border border-[rgba(10,132,255,0.3)]" />
                        </div>
                        <div ref={destGlowRef} className="absolute inset-0 flex items-center justify-center" style={{ willChange: 'transform, opacity' }}>
                          <div className="w-8 h-8 rounded-full bg-[rgba(10,132,255,0.12)]" style={{ filter: 'blur(8px)' }} />
                        </div>
                        <div
                          ref={destNodeRef}
                          className="relative w-[10px] h-[10px] rounded-full"
                          style={{
                            backgroundColor: 'rgba(10,132,255,0.15)',
                            border: '1.5px solid rgba(10,132,255,0.4)',
                            willChange: 'transform',
                          }}
                        />
                      </div>
                    </div>

                    <div ref={carRef} className="absolute z-30 left-0 top-0" style={{ willChange: 'transform, opacity' }}>
                      <svg width="20" height="30" viewBox="0 0 20 30" fill="none" className="block" style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.3))' }}>
                        <rect x="1" y="3" width="18" height="24" rx="5" fill="#0A84FF" />
                        <rect x="3" y="7" width="14" height="5" rx="2" fill="rgba(255,255,255,0.08)" />
                        <rect x="3" y="19" width="14" height="3.5" rx="1.5" fill="rgba(255,255,255,0.05)" />
                        <circle cx="5" cy="4" r="1.3" fill="rgba(255,255,255,0.8)" />
                        <circle cx="15" cy="4" r="1.3" fill="rgba(255,255,255,0.8)" />
                        <circle cx="5" cy="26" r="1" fill="rgba(220,80,80,0.45)" />
                        <circle cx="15" cy="26" r="1" fill="rgba(220,80,80,0.45)" />
                      </svg>
                    </div>

                    <div ref={uiNavRef} className="absolute top-12 left-3.5 right-3.5 z-40" style={{ willChange: 'transform, opacity' }}>
                      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[rgba(28,28,30,0.88)] backdrop-blur-xl border border-white/[0.05]">
                        <div className="w-6 h-6 rounded-lg bg-[rgba(10,132,255,0.08)] flex items-center justify-center">
                          <Navigation className="w-3 h-3 text-[#0A84FF]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[7px] font-medium text-white/20 uppercase tracking-wider leading-none mb-0.5">Navigating</p>
                          <p className="text-[9px] font-semibold text-white/70 leading-none">Sector 7 Hub</p>
                        </div>
                        <span ref={etaRef} className="text-[9px] font-semibold text-[#30D158]">4 min</span>
                      </div>
                    </div>

                    <div ref={uiCardRef} className="absolute bottom-4 left-3 right-3 z-40" style={{ willChange: 'transform, opacity' }}>
                      <div className="p-3 rounded-2xl bg-[rgba(28,28,30,0.92)] backdrop-blur-xl border border-white/[0.05]">
                        <div className="flex items-center gap-2.5 mb-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[rgba(10,132,255,0.06)] flex items-center justify-center">
                            <MapPin className="w-3.5 h-3.5 text-[#0A84FF]" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] font-semibold text-white/80">Sector 7 Hub • A-12</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Star className="w-2 h-2 text-[#FF9F0A] fill-[#FF9F0A]" />
                              <span className="text-[8px] text-white/30">4.8 • Ground Floor</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-white leading-none">₹40</p>
                            <p className="text-[7px] text-white/20">/hour</p>
                          </div>
                        </div>
                        <button className="w-full h-9 rounded-lg bg-[#0A84FF] flex items-center justify-center active:scale-[0.97] transition-transform duration-150">
                          <span className="text-[10px] font-semibold text-white tracking-wide">Book This Spot</span>
                        </button>
                      </div>
                    </div>

                    <div className="absolute top-2.5 left-5 right-5 flex justify-between z-50 text-white/20">
                      <span className="text-[9px] font-medium">9:41</span>
                      <div className="w-4 h-2 rounded-sm border border-white/20 p-[0.5px]">
                        <div className="h-full w-3/4 bg-white/30 rounded-[0.5px]" />
                      </div>
                    </div>
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-24 h-[3px] bg-white/12 rounded-full z-50" />
                  </div>

                  <div
                    ref={lightRef}
                    className="absolute inset-0 w-10 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent pointer-events-none z-40 rounded-[2.8rem]"
                    style={{ willChange: 'transform' }}
                  />
                </div>

                <div className="absolute -right-[1.5px] top-[160px] w-[2px] h-[40px] bg-[#3a3a3c] rounded-r-sm" />
                <div className="absolute -left-[1.5px] top-[135px] w-[2px] h-[20px] bg-[#3a3a3c] rounded-l-sm" />
                <div className="absolute -left-[1.5px] top-[165px] w-[2px] h-[40px] bg-[#3a3a3c] rounded-l-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 opacity-25">
        <div className="flex flex-col items-center gap-2">
          <span className="text-[9px] font-medium text-white/40 tracking-[0.3em] uppercase">Scroll</span>
          <div className="w-[16px] h-6 rounded-full border border-white/10 flex justify-center pt-1">
            <div className="w-[2px] h-[5px] rounded-full bg-white/20" />
          </div>
        </div>
      </div>
    </section>
  );
}
