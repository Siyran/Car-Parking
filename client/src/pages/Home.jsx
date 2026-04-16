import { useNavigate } from 'react-router-dom';
import { Lock, Activity, Radio, Signal, Globe, ShieldCheck, Zap } from 'lucide-react';
import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAuth } from '../context/AuthContext';
import VibeHero from '../components/animations/VibeHero';
import HowItWorks from '../components/animations/HowItWorks';
import LiveMapSection from '../components/animations/LiveMapSection';
import StatsSection from '../components/animations/StatsSection';
import FinalCTA from '../components/animations/FinalCTA';
import VibeNavbar from '../components/layout/VibeNavbar';
import MobileInterface from '../components/animations/MobileInterface';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Entrance animations for sections
      gsap.utils.toArray('.gsap-reveal').forEach((el) => {
        gsap.from(el, {
          y: 40,
          opacity: 0,
          duration: 1,
          ease: 'cubic-bezier(0.22,1,0.36,1)',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true
          }
        });
      });

      // 2. Specialized staggered reveal for specs
      gsap.from('.gsap-spec-item', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.gsap-spec-grid',
          start: 'top 80%',
          once: true
        }
      });

      // 3. Hover effects for cards
      const cards = gsap.utils.toArray('.gsap-card');
      cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
          gsap.to(card, { scale: 1.02, y: -8, duration: 0.4, ease: 'power2.out' });
        });
        card.addEventListener('mouseleave', () => {
          gsap.to(card, { scale: 1, y: 0, duration: 0.4, ease: 'power2.out' });
        });
      });

      // 4. Button effects
      const buttons = gsap.utils.toArray('.gsap-btn');
      buttons.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
          gsap.to(btn, { filter: 'brightness(1.1)', duration: 0.3 });
        });
        btn.addEventListener('mouseleave', () => {
          gsap.to(btn, { filter: 'brightness(1)', duration: 0.3 });
        });
        btn.addEventListener('mousedown', () => {
          gsap.to(btn, { scale: 0.97, duration: 0.1 });
        });
        btn.addEventListener('mouseup', () => {
          gsap.to(btn, { scale: 1, duration: 0.1 });
        });
        btn.addEventListener('mouseleave', () => {
          gsap.to(btn, { scale: 1, duration: 0.2 });
        });
      });

    }, containerRef);
    return () => ctx.revert();
  }, []);
  
  return (
    <div ref={containerRef} className="bg-[#05070A] selection:bg-primary-vibrant relative flex flex-col">
      {!user && <VibeNavbar />}

      {/* 1. HERO SECTION — 3D phone with animated map */}
      <VibeHero />
      
      {/* 2. HOW IT WORKS — Animated 4-step flow */}
      <HowItWorks />

      {/* 3. LIVE MAP — Interactive parking map preview */}
      <LiveMapSection />

      {/* 4. THE APP SHOWCASE (Interface Terminal) */}
      <section className="py-32 md:py-40 px-6 bg-[#05070A] relative overflow-hidden border-t border-white/[0.04]">
        <div className="max-w-[1440px] mx-auto grid lg:grid-cols-2 gap-20 items-center">
           
           {/* LEFT: THE INTERFACE */}
           <div className="flex justify-center gsap-reveal">
              <MobileInterface />
           </div>

           {/* RIGHT: THE APP FEATURES */}
           <div className="space-y-12">
              <div className="space-y-6 gsap-reveal">
                 <span className="text-xs font-bold text-purple-400 uppercase tracking-[0.3em]">App Preview</span>
                 <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
                    The Pro <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Terminal</span>
                 </h2>
                 <p className="text-lg text-white/40 leading-relaxed max-w-xl">
                    A precision interface designed for transparent earnings and effortless management.
                 </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-8 gsap-spec-grid">
                 {[
                   { icon: Lock, title: 'Bank Security', desc: 'Encrypted protocols for every session.' },
                   { icon: Activity, title: 'Instant Sync', desc: 'Real-time response across the network.' },
                   { icon: Radio, title: 'UPI Settlement', desc: 'Direct payments with zero commission.' },
                   { icon: Signal, title: 'Accurate GPS', desc: 'Centimeter-precise spot location.' }
                 ].map((spec, i) => (
                   <div
                     key={i}
                     className="space-y-3 group p-5 rounded-2xl hover:bg-white/[0.03] transition-all duration-300 gsap-spec-item"
                   >
                     <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/[0.08] flex items-center justify-center transition-all duration-500 group-hover:border-blue-500/30 group-hover:bg-blue-500/5">
                       <spec.icon className="w-5 h-5 text-white/40 group-hover:text-blue-400 group-hover:scale-110 transition-all duration-500" />
                     </div>
                     <h4 className="text-base font-bold text-white tracking-tight">{spec.title}</h4>
                     <p className="text-sm text-white/30 leading-relaxed">{spec.desc}</p>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </section>

      {/* 5. FEATURE CARDS */}
      <section className="py-32 md:py-40 px-6 bg-[#05070A] relative overflow-hidden border-t border-white/[0.04]">
        <div className="max-w-[1440px] mx-auto">
          <div className="text-center mb-20 space-y-6 gsap-reveal">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-[0.3em]">Why ParkFlow</span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white">
              Global <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Coverage</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {[
              { 
                icon: Globe, title: 'Urban Scale', desc: 'Thousands of spots in major metro hubs.',
                img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2940&auto=format&fit=crop'
              },
              { 
                icon: ShieldCheck, title: 'Ironclad Trust', desc: 'Every spot verified through safety checks.',
                img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2940&auto=format&fit=crop'
              },
              { 
                icon: Zap, title: 'Instant Payouts', desc: 'Earnings available immediately after session.',
                img: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=2940&auto=format&fit=crop'
              }
            ].map((f, i) => (
              <div
                key={i}
                className="group relative h-[420px] rounded-3xl overflow-hidden border border-white/[0.06] hover:border-white/10 transition-all duration-500 gsap-card gsap-reveal"
              >
                <div className="absolute inset-0 z-0">
                  <img src={f.img} alt={f.title} className="w-full h-full object-cover transition-transform duration-[4s] group-hover:scale-110 opacity-15 grayscale" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#05070A] via-[#05070A]/60 to-transparent" />
                </div>

                {/* Hover glow border */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{
                  boxShadow: 'inset 0 0 0 1px rgba(59,130,246,0.2), 0 0 40px -10px rgba(59,130,246,0.15)'
                }} />

                <div className="h-full flex flex-col justify-end p-10 relative z-10 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/[0.08] flex items-center justify-center backdrop-blur-xl group-hover:bg-blue-500/10 group-hover:border-blue-500/20 transition-all duration-500">
                    <f.icon className="w-5 h-5 text-white/50 group-hover:text-blue-400 transition-colors duration-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">{f.title}</h3>
                  <p className="text-sm text-white/30 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. STATS & TRUST */}
      <StatsSection />

      {/* 7. FINAL CTA */}
      <FinalCTA />
    </div>
  );
}
