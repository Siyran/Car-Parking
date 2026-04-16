import { MapPin, Zap, Clock, Star } from 'lucide-react';
import { useRef, useState, useEffect, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const MARKERS = [
  { id: 1, x: 15, y: 25, name: 'Sector 7 Hub', price: 40, rating: 4.8, available: 3 },
  { id: 2, x: 55, y: 18, name: 'Mall Parking A', price: 60, rating: 4.5, available: 8 },
  { id: 3, x: 75, y: 45, name: 'Tech Park Gate', price: 30, rating: 4.9, available: 2 },
  { id: 4, x: 30, y: 60, name: 'Residential Block', price: 25, rating: 4.7, available: 5 },
  { id: 5, x: 60, y: 70, name: 'City Center Deep', price: 80, rating: 4.6, available: 1 },
  { id: 6, x: 85, y: 20, name: 'Airport Zone', price: 100, rating: 4.4, available: 12 },
  { id: 7, x: 40, y: 40, name: 'Stadium Lot', price: 50, rating: 4.3, available: 6 },
];

function MapMarker({ marker, delay, onHover, isHovered }) {
  const markerRef = useRef(null);
  const ringRef = useRef(null);
  const tooltipRef = useRef(null);

  useLayoutEffect(() => {
    // Initial entrance
    gsap.fromTo(markerRef.current, 
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, delay, duration: 0.8, ease: 'back.out(1.7)' }
    );

    // Pulse animation
    gsap.to(ringRef.current, {
      scale: 2.5,
      opacity: 0,
      duration: 2,
      repeat: -1,
      delay: delay,
      ease: 'power2.out'
    });
  }, []);

  useLayoutEffect(() => {
    if (isHovered) {
      gsap.to(markerRef.current, { scale: 1.3, y: -5, duration: 0.4, ease: 'power2.out' });
      if (tooltipRef.current) {
        gsap.fromTo(tooltipRef.current,
          { opacity: 0, y: 10, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power2.out' }
        );
      }
    } else {
      gsap.to(markerRef.current, { scale: 1, y: 0, duration: 0.4, ease: 'power2.out' });
    }
  }, [isHovered]);

  return (
    <div
      ref={markerRef}
      className="absolute group cursor-pointer"
      style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
      onMouseEnter={() => onHover(marker.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Pulse ring */}
      <div
        ref={ringRef}
        className="absolute inset-0 w-10 h-10 -translate-x-5 -translate-y-5 rounded-full bg-blue-400 opacity-30"
      />
      {/* Marker */}
      <div className="relative w-10 h-10 -translate-x-5 -translate-y-5 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white/30 shadow-[0_0_20px_rgba(59,130,246,0.5)] flex items-center justify-center z-10">
        <MapPin className="w-4 h-4 text-white fill-white/30" />
      </div>

      {/* Hover tooltip */}
      {isHovered && (
        <div
          ref={tooltipRef}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 p-3 rounded-xl bg-[#12162a]/95 backdrop-blur-xl border border-white/10 shadow-2xl z-50 pointer-events-none"
        >
          <p className="text-xs font-bold text-white mb-1">{marker.name}</p>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="text-white/60">₹{marker.price}/hr</span>
            <span className="text-emerald-400 flex items-center gap-1"><Star className="w-2.5 h-2.5 fill-current" />{marker.rating}</span>
            <span className="text-blue-400">{marker.available} spots</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LiveMapSection() {
  const containerRef = useRef(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [activeCount, setActiveCount] = useState(37);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Entrance animations
      gsap.from('.map-container', {
        x: -40,
        opacity: 0,
        duration: 1.2,
        ease: 'cubic-bezier(0.22,1,0.36,1)',
        scrollTrigger: {
          trigger: '.map-container',
          start: 'top 85%',
          once: true
        }
      });

      gsap.from('.map-copy', {
        x: 40,
        opacity: 0,
        duration: 1.2,
        ease: 'cubic-bezier(0.22,1,0.36,1)',
        scrollTrigger: {
          trigger: '.map-copy',
          start: 'top 85%',
          once: true
        }
      });

      gsap.from('.map-stat-item', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.map-stats-grid',
          start: 'top 90%',
          once: true
        }
      });

    }, containerRef);
    return () => ctx.revert();
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCount(prev => prev + Math.floor(Math.random() * 3) - 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-32 md:py-40 px-6 bg-[#05070A] relative overflow-hidden" ref={containerRef}>
      <div className="max-w-[1440px] mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Map */}
          <div className="relative aspect-square rounded-3xl bg-[#0a0e1a] border border-white/[0.06] overflow-hidden map-container">
            {/* Map grid background */}
            <div className="absolute inset-0 opacity-[0.04]" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }} />

            {/* Road patterns */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              <line x1="0%" y1="30%" x2="100%" y2="30%" stroke="rgba(255,255,255,0.04)" strokeWidth="30" />
              <line x1="0%" y1="65%" x2="100%" y2="65%" stroke="rgba(255,255,255,0.04)" strokeWidth="25" />
              <line x1="25%" y1="0%" x2="25%" y2="100%" stroke="rgba(255,255,255,0.04)" strokeWidth="25" />
              <line x1="70%" y1="0%" x2="70%" y2="100%" stroke="rgba(255,255,255,0.04)" strokeWidth="30" />
            </svg>

            {/* Ambient glow */}
            <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]" />

            {/* Markers */}
            {MARKERS.map((m, i) => (
              <MapMarker
                key={m.id}
                marker={m}
                delay={0.3 + i * 0.12}
                onHover={setHoveredId}
                isHovered={hoveredId === m.id}
              />
            ))}

            {/* Live badge */}
            <div className="absolute top-5 left-5 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Live</span>
            </div>

            {/* Active spots counter */}
            <div className="absolute bottom-5 right-5 px-4 py-2 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Active Spots</p>
              <div
                className="text-2xl font-black text-white"
              >{activeCount}</div>
            </div>
          </div>

          {/* Right: Copy */}
          <div className="space-y-8 map-copy">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-[0.3em]">Real-Time Network</span>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
              Live <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Parking</span> Map
            </h2>
            <p className="text-lg text-white/40 leading-relaxed max-w-lg">
              Watch spots appear and disappear in real-time. Our network updates every second so you never miss an available space.
            </p>

            <div className="grid grid-cols-3 gap-6 pt-4 map-stats-grid">
              {[
                { icon: Zap, label: 'Real-time', value: '< 1s' },
                { icon: MapPin, label: 'Coverage', value: '50+ areas' },
                { icon: Clock, label: 'Uptime', value: '99.9%' },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="space-y-1 map-stat-item"
                >
                  <stat.icon className="w-5 h-5 text-blue-400 mb-2" />
                  <p className="text-xl font-black text-white">{stat.value}</p>
                  <p className="text-[11px] text-white/30 uppercase tracking-widest font-bold">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
