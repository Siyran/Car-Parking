import { motion, useInView } from 'framer-motion';
import { Home, MapPin, Navigation, Wallet, ArrowRight } from 'lucide-react';
import { useRef } from 'react';

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
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative group"
    >
      {/* Connector line */}
      {index < steps.length - 1 && (
        <div className="hidden lg:block absolute top-1/2 -right-8 w-16 h-[2px]">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ delay: index * 0.15 + 0.5, duration: 0.6 }}
            className="w-full h-full bg-gradient-to-r from-white/10 to-transparent origin-left"
          />
        </div>
      )}

      <div className="relative p-8 rounded-3xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm hover:bg-white/[0.06] hover:border-white/10 transition-all duration-500 group-hover:-translate-y-2">
        {/* Step number */}
        <span className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em] mb-6 block">{step.step}</span>

        {/* Animated Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={isInView ? { scale: 1, rotate: 0 } : {}}
          transition={{ delay: index * 0.15 + 0.3, type: 'spring', stiffness: 200, damping: 15 }}
          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
          style={{ boxShadow: `0 15px 40px -10px ${step.glow}` }}
        >
          <step.icon className="w-6 h-6 text-white" />
        </motion.div>

        <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{step.title}</h3>
        <p className="text-sm text-white/40 leading-relaxed">{step.desc}</p>
      </div>
    </motion.div>
  );
}

export default function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="py-32 md:py-40 px-6 bg-[#05070A] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-[1440px] mx-auto relative z-10">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-20 space-y-6"
        >
          <span className="text-xs font-bold text-blue-400 uppercase tracking-[0.3em]">Simple Process</span>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">
            How It <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Works</span>
          </h2>
          <p className="text-lg text-white/40 max-w-2xl mx-auto">
            From listing to parking, the entire experience takes under 2 minutes.
          </p>
        </motion.div>

        {/* Steps grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <StepCard key={i} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
