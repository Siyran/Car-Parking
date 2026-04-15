import { motion, useInView } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';

export default function FinalCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const navigate = useNavigate();

  return (
    <section className="py-32 md:py-48 px-6 relative overflow-hidden bg-[#05070A]" ref={ref}>
      {/* Animated gradient background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{
            background: [
              'radial-gradient(ellipse at 30% 50%, rgba(59,130,246,0.15), transparent 60%)',
              'radial-gradient(ellipse at 70% 40%, rgba(139,92,246,0.15), transparent 60%)',
              'radial-gradient(ellipse at 50% 60%, rgba(6,182,212,0.12), transparent 60%)',
              'radial-gradient(ellipse at 30% 50%, rgba(59,130,246,0.15), transparent 60%)',
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0"
        />
        {/* Radial spotlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-blue-500/[0.07] rounded-full blur-[150px]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="space-y-10"
        >
          <Sparkles className="w-8 h-8 text-blue-400 mx-auto" />

          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight">
            Start Parking
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Smarter Today
            </span>
          </h2>

          <p className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto leading-relaxed">
            Join thousands of drivers and homeowners already using the smartest parking network in the country.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/search')}
              className="group relative flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-sm uppercase tracking-wider overflow-hidden"
              style={{ boxShadow: '0 20px 60px -15px rgba(59,130,246,0.5)' }}
            >
              {/* Animated shimmer */}
              <motion.div
                animate={{ x: [-200, 400] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="absolute inset-0 w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] pointer-events-none"
              />
              {/* Pulse ring */}
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0, 0.15] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-2xl border-2 border-blue-400"
              />
              Find Your Spot
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            <button
              onClick={() => navigate('/register')}
              className="flex items-center gap-3 px-10 py-5 rounded-2xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:border-white/20 font-bold text-sm uppercase tracking-wider hover:scale-105 active:scale-95 transition-all duration-300 backdrop-blur-sm"
            >
              Become a Host
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
