import { useRef, useState, useEffect, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function AnimatedCounter({ target, suffix = '', prefix = '', isVisible }) {
  const [count, setCount] = useState(0);
  const countRef = useRef({ val: 0 });

  useEffect(() => {
    if (!isVisible) return;
    
    gsap.to(countRef.current, {
      val: parseInt(target),
      duration: 1.5,
      ease: 'power2.out',
      onUpdate: () => {
        setCount(Math.floor(countRef.current.val));
      }
    });
  }, [isVisible, target]);

  return (
    <span>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

const stats = [
  { value: 5000, suffix: '+', label: 'Verified Spots', desc: 'Active across major cities' },
  { value: 12, suffix: 'ms', label: 'Response Time', desc: 'Near-instant updates' },
  { value: 0, prefix: '₹', suffix: '', label: 'Hidden Fees', desc: 'Transparent pricing always' },
  { value: 99, suffix: '%', label: 'Uptime', desc: 'Enterprise-grade reliability' },
];

export default function StatsSection() {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Entrance animations
      gsap.fromTo('.stats-header', 
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'cubic-bezier(0.22,1,0.36,1)',
          scrollTrigger: {
            trigger: '.stats-header',
            start: 'top 90%',
            once: true
          }
        }
      );

      gsap.fromTo('.stat-card', 
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.stats-grid',
            start: 'top bottom', // Trigger as soon as the grid enters the viewport
            once: true,
            onEnter: () => setIsVisible(true)
          }
        }
      );

      // 2. Background gradient animation
      gsap.to('.stats-bg-gradient', {
        backgroundPosition: '100% 50%',
        duration: 12,
        repeat: -1,
        yoyo: true,
        ease: 'none'
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section className="py-32 md:py-40 px-6 bg-[#05070A] relative overflow-hidden" ref={containerRef}>
      {/* Animated gradient bg */}
      <div className="absolute inset-0 pointer-events-none stats-bg-gradient" style={{
        background: 'radial-gradient(800px circle at 20% 50%, rgba(59,130,246,0.06), transparent 60%)',
        backgroundSize: '200% 200%'
      }} />

      <div className="max-w-[1440px] mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-20 space-y-6 stats-header">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-[0.3em]">Trusted Platform</span>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">
            Numbers That <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Speak</span>
          </h2>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 stats-grid">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="relative p-8 rounded-3xl bg-white/[0.02] border border-white/[0.06] text-center transition-all duration-500 group stat-card gsap-card"
            >
              <p className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} prefix={stat.prefix} isVisible={isVisible} />
              </p>
              <p className="text-sm font-bold text-white/80 mb-1">{stat.label}</p>
              <p className="text-xs text-white/70">{stat.desc}</p>

              {/* Hover glow */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
