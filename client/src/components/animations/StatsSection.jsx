import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

function AnimatedCounter({ target, suffix = '', prefix = '', duration = 2 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = parseInt(target);
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  return (
    <span ref={ref}>
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
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="py-32 md:py-40 px-6 bg-[#05070A] relative overflow-hidden" ref={ref}>
      {/* Animated gradient bg */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{
            background: [
              'radial-gradient(800px circle at 20% 50%, rgba(59,130,246,0.06), transparent 60%)',
              'radial-gradient(800px circle at 80% 50%, rgba(139,92,246,0.06), transparent 60%)',
              'radial-gradient(800px circle at 50% 50%, rgba(6,182,212,0.06), transparent 60%)',
              'radial-gradient(800px circle at 20% 50%, rgba(59,130,246,0.06), transparent 60%)',
            ],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0"
        />
      </div>

      <div className="max-w-[1440px] mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-20 space-y-6"
        >
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-[0.3em]">Trusted Platform</span>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">
            Numbers That <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Speak</span>
          </h2>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.12, duration: 0.6 }}
              className="relative p-8 rounded-3xl bg-white/[0.02] border border-white/[0.06] text-center hover:bg-white/[0.05] hover:border-white/10 transition-all duration-500 group hover:-translate-y-1"
            >
              <p className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">
                {isInView ? (
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                ) : (
                  `${stat.prefix || ''}0${stat.suffix || ''}`
                )}
              </p>
              <p className="text-sm font-bold text-white/60 mb-1">{stat.label}</p>
              <p className="text-xs text-white/30">{stat.desc}</p>

              {/* Hover glow */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
