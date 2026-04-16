import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function FinalCTA() {
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Entrance animation
      gsap.from('.cta-content', {
        y: 40,
        opacity: 0,
        duration: 1.2,
        ease: 'cubic-bezier(0.22,1,0.36,1)',
        scrollTrigger: {
          trigger: '.cta-content',
          start: 'top 85%',
          once: true
        }
      });

      // 2. Subtle background drift
      gsap.to('.cta-bg-glow', {
        x: '20%',
        y: '10%',
        duration: 10,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut'
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section className="py-32 md:py-48 px-6 relative overflow-hidden bg-[#05070A]" ref={containerRef}>
      {/* Subtle blurred background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 cta-bg-glow" style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(59,132,255,0.08) 0%, transparent 60%)',
          transform: 'scale(1.5)'
        }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-blue-500/[0.04] rounded-full blur-[150px]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10 text-center cta-content">
        <div className="space-y-10">
          <Sparkles className="w-8 h-8 text-blue-400 mx-auto" />

          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight">
            Start Parking
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Smarter Today
            </span>
          </h2>

          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            Join thousands of drivers and homeowners already using the smartest parking network in the country.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4">
            <button
              onClick={() => navigate('/search')}
              className="gsap-btn group relative flex items-center gap-3 px-10 py-5 rounded-2xl bg-[#0A84FF] text-white font-bold text-sm uppercase tracking-wider overflow-hidden"
              style={{ boxShadow: '0 20px 60px -15px rgba(10,132,255,0.45)' }}
            >
              Find Your Spot
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/register')}
              className="gsap-btn flex items-center gap-3 px-10 py-5 rounded-2xl bg-white/5 border border-white/10 text-white/70 font-bold text-sm uppercase tracking-wider backdrop-blur-sm"
            >
              Become a Host
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
