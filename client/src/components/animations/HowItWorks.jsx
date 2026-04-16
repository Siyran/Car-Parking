import { Home, MapPin, Navigation, Wallet, ArrowRight } from 'lucide-react';
import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    icon: Home,
    step: '01',
    title: 'Owner Lists Space',
    desc: 'Homeowners register their unused parking space. Set your own price, hours, and availability.',
    color: 'from-blue-500 to-blue-600',
    glow: 'rgba(59,130,246,0.3)',
  },
  {
    icon: MapPin,
    step: '02',
    title: 'Driver Discovers',
    desc: 'Drivers search nearby spots with real-time availability. Filter by price, distance, and rating.',
    color: 'from-purple-500 to-purple-600',
    glow: 'rgba(139,92,246,0.3)',
  },
  {
    icon: Navigation,
    step: '03',
    title: 'Navigate & Park',
    desc: 'GPS-guided navigation takes drivers directly to their booked spot with turn-by-turn directions.',
    color: 'from-cyan-500 to-cyan-600',
    glow: 'rgba(6,182,212,0.3)',
  },
  {
    icon: Wallet,
    step: '04',
    title: 'Pay & Go',
    desc: 'Automatic billing based on duration. Pay via UPI, cards, or wallet. Zero hidden charges.',
    color: 'from-emerald-500 to-emerald-600',
    glow: 'rgba(52,211,153,0.3)',
  },
];

function StepCard({ step, index }) {
  return (
    <div className="relative group how-it-works-step opacity-0 translate-y-12">
      {/* Connector line */}
      {index < steps.length - 1 && (
        <div className="hidden lg:block absolute top-1/2 -right-8 w-16 h-[2px]">
          <div className="w-full h-full bg-gradient-to-r from-white/10 to-transparent origin-left scale-x-0 step-connector" />
        </div>
      )}

      <div className="relative p-8 rounded-3xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm hover:bg-white/[0.06] hover:border-white/10 transition-all duration-500 gsap-card">
        {/* Step number */}
        <span className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em] mb-6 block">{step.step}</span>

        {/* Animated Icon */}
        <div
          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300 step-icon-box`}
          style={{ boxShadow: `0 15px 40px -10px ${step.glow}` }}
        >
          <step.icon className="w-6 h-6 text-white" />
        </div>

        <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{step.title}</h3>
        <p className="text-sm text-white/40 leading-relaxed">{step.desc}</p>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Header Entrance
      gsap.from('.how-it-works-header', {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: 'cubic-bezier(0.22,1,0.36,1)',
        scrollTrigger: {
          trigger: '.how-it-works-header',
          start: 'top 85%',
          once: true
        }
      });

      // 2. Steps Entrance Staggered
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.steps-grid',
          start: 'top 80%',
          once: true
        }
      });

      tl.to('.how-it-works-step', {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power2.out'
      })
      .to('.step-connector', {
        scaleX: 1,
        duration: 0.6,
        stagger: 0.15,
        ease: 'power2.inOut'
      }, '-=0.6')
      .from('.step-icon-box', {
        scale: 0,
        rotate: -20,
        duration: 0.6,
        stagger: 0.15,
        ease: 'back.out(1.7)'
      }, '-=0.8');

      // 3. Global card interactions (from Home.jsx context but locally applied if needed)
      // Note: We used a logic in Home.jsx that targets .gsap-card, 
      // but since these are sub-components, we need to ensure the listeners are active 
      // if we aren't using a global listener. 
      // Actually, applying it here for encapsulation is better.
      const cards = gsap.utils.toArray('.gsap-card');
      cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
          gsap.to(card, { scale: 1.02, y: -8, duration: 0.4, ease: 'power2.out' });
        });
        card.addEventListener('mouseleave', () => {
          gsap.to(card, { scale: 1, y: 0, duration: 0.4, ease: 'power2.out' });
        });
      });

    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-32 md:py-40 px-6 bg-[#05070A] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-[1440px] mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-20 space-y-6 how-it-works-header">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-[0.3em]">Simple Process</span>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">
            How It <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Works</span>
          </h2>
          <p className="text-lg text-white/40 max-w-2xl mx-auto">
            From listing to parking, the entire experience takes under 2 minutes.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 steps-grid">
          {steps.map((step, i) => (
            <StepCard key={i} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
