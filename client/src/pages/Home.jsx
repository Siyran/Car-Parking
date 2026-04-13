import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lock, Activity, Radio, Signal, Globe, ShieldCheck, Zap } from 'lucide-react';
import { useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import VibeHero from '../components/animations/VibeHero';
import VibeNavbar from '../components/layout/VibeNavbar';
import Button from '../components/ui/Button';
import MobileInterface from '../components/animations/MobileInterface';

export default function Home() {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  return (
    <div ref={containerRef} className="bg-[#05070A] selection:bg-primary-vibrant relative flex flex-col">
      {!user && <VibeNavbar />}
      <VibeHero />
      
      {/* 2. THE MISSION (About Us / Logic) */}
      <section className="py-48 px-6 bg-surface-950 relative z-40">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-32 items-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="relative aspect-square md:aspect-video rounded-[3rem] overflow-hidden border border-white/10 group"
            >
              <img 
                src="https://images.unsplash.com/photo-1573344697920-ca9810842e20?q=80&w=2938&auto=format&fit=crop" 
                alt="Modern Cityscape" 
                className="w-full h-full object-cover grayscale opacity-40 group-hover:scale-110 group-hover:grayscale-0 transition-all duration-[4s]" 
              />
              <div className="absolute inset-0 bg-linear-to-t from-surface-950 via-transparent to-transparent" />
              <div className="absolute bottom-12 left-12 space-y-4">
                 <p className="text-[10px] font-black tracking-[0.4em] uppercase text-primary-400">Our_Core_Mission</p>
                 <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter">REDESIGNING <br /> URBAN FLOW.</h3>
              </div>
            </motion.div>

            <div className="space-y-12">
               <motion.div
                 initial={{ opacity: 0, x: 30 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 className="space-y-6"
               >
                 <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter leading-tight">
                    BUILT FOR THE <br />
                    <span className="gradient-text italic">NEXT DECADE.</span>
                 </h2>
                 <p className="text-xl text-surface-400 font-medium leading-relaxed opacity-70">
                    We didn't just build a parking app. We built an autonomous protocol that turns unused space into a high-yield asset network.
                 </p>
               </motion.div>

               <div className="grid sm:grid-cols-2 gap-10">
                  {[
                    { label: "01", title: "Smart Sourcing", desc: "Finding every hidden space in the city through advanced GPS logic." },
                    { label: "02", title: "Direct Value", desc: "Eliminating middle-man fees so hosts earn 100% of their space's worth." }
                  ].map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="space-y-4">
                       <span className="text-sm font-black text-primary-500 font-mono tracking-widest">{item.label}</span>
                       <h4 className="text-xl font-black text-white italic uppercase tracking-tighter">{item.title}</h4>
                       <p className="text-sm text-surface-500 font-medium leading-relaxed">{item.desc}</p>
                    </motion.div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE APP SHOWCASE (Interface Terminal) */}
      <section className="py-48 px-6 bg-surface-950 relative z-40 overflow-hidden border-t border-white/5">
        <div className="max-w-[1440px] mx-auto grid lg:grid-cols-2 gap-32 items-center">
           
           {/* LEFT: THE INTERFACE */}
           <motion.div 
             initial={{ opacity: 0, x: -60 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 1 }}
             className="flex justify-center"
           >
              <MobileInterface />
           </motion.div>

           {/* RIGHT: THE APP FEATURES */}
           <div className="space-y-16">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                 <h2 className="text-6xl font-black text-white italic uppercase tracking-tighter leading-[0.9]">
                    THE PRO <br />
                    <span className="gradient-text">TERMINAL.</span>
                 </h2>
                 <p className="text-xl text-surface-400 font-medium leading-relaxed max-w-xl opacity-70">
                    A millisecond-precision interface designed for absolute earning transparency and autonomous management.
                 </p>
              </motion.div>

              <div className="grid sm:grid-cols-2 gap-12 pt-8">
                 {[
                   { icon: Lock, title: "BANK SECURITY", desc: "Encrypted handshake protocols for every peer-to-peer session." },
                   { icon: Activity, title: "INSTANT SYNC", desc: "Real-time response across our entire city-wide parking network." },
                   { icon: Radio, title: "UPI SETTLEMENT", desc: "Funds move directly to your account with zero commission leakage." },
                   { icon: Signal, title: "ACCURATE GPS", desc: "Finding your allocated spot with perfect coordinate precision." }
                 ].map((spec, i) => (
                   <motion.div
                     key={i}
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     transition={{ delay: i * 0.1, duration: 0.8 }}
                     viewport={{ once: true }}
                     className="space-y-4 group"
                   >
                     <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-500 group-hover:border-primary-500/40 group-hover:bg-primary-500/5">
                       <spec.icon className="w-6 h-6 text-white opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                     </div>
                     <h4 className="text-lg font-black text-white italic uppercase tracking-tighter leading-none">{spec.title}</h4>
                     <p className="text-sm text-surface-500 font-medium leading-relaxed">{spec.desc}</p>
                   </motion.div>
                 ))}
              </div>
           </div>
        </div>
      </section>

      {/* 4. THE INFRASTRUCTURE (Feature Grid) */}
      <section className="py-48 px-6 bg-surface-950/90 backdrop-blur-3xl z-40 border-t border-white/5">
        <div className="max-w-[1440px] mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto mb-24 space-y-8"
          >
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase text-white">
              GLOBAL <span className="gradient-text">COVERAGE</span>. <br />
              VERIFIED <span className="underline decoration-primary-500/30 decoration-8 underline-offset-8">DEMAND</span>.
            </h2>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-10">
            {[
              { 
                icon: Globe, title: "URBAN SCALE", desc: "Our network connects thousands of prime locations in major metro hubs.",
                img: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2940&auto=format&fit=crop"
              },
              { 
                icon: ShieldCheck, title: "IRONCLAD TRUST", desc: "Every spot and vehicle is verified through our proprietary safety logic.",
                img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2940&auto=format&fit=crop"
              },
              { 
                icon: Zap, title: "INSTANT LIQUIDITY", desc: "Earnings are available for withdrawal the moment your session concludes.",
                img: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=2940&auto=format&fit=crop"
              }
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group relative h-[450px] rounded-[3.5rem] overflow-hidden border border-white/5 card-hover-premium"
              >
                <div className="absolute inset-0 z-0">
                  <img src={f.img} alt={f.title} className="w-full h-full object-cover transition-transform duration-[4s] group-hover:scale-110 opacity-20 grayscale" />
                  <div className="absolute inset-0 bg-linear-to-t from-surface-950 via-surface-950/40 to-transparent" />
                </div>

                <div className="h-full flex flex-col justify-end p-12 relative z-10 space-y-6 text-left">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl">
                    <f.icon className="w-6 h-6 text-white opacity-60" />
                  </div>
                  <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">{f.title}</h3>
                  <p className="text-sm text-surface-400 font-medium leading-relaxed opacity-60">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FINAL CALL (Live Network Stats) */}
      <section className="py-60 px-6 text-center relative overflow-hidden bg-black">
        <div className="absolute inset-0 bg-radial-at-center from-primary-600/10 to-transparent opacity-40" />
        
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           className="relative z-10 space-y-16"
        >
          <div className="space-y-8 flex flex-col items-center">
             <h2 className="text-6xl md:text-8xl font-black tracking-tighter italic uppercase text-white">
                READY TO <span className="gradient-text italic">LAUNCH?</span>
             </h2>
             <div className="flex flex-col md:flex-row gap-12 pt-8">
                {[
                  { val: "5K+", label: "Verified Nodes" },
                  { val: "12MS", label: "Network Latency" },
                  { val: "₹0", label: "Entry Fees" }
                ].map((s, i) => (
                  <div key={i} className="text-center">
                     <p className="text-5xl font-black text-white italic tracking-tighter mb-1">{s.val}</p>
                     <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest">{s.label}</p>
                  </div>
                ))}
             </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <Button size="lg" className="!rounded-full px-16 py-8 text-xl font-black italic uppercase tracking-[0.2em] shadow-glow transform hover:scale-105 transition-all" onClick={() => navigate('/search')}>
              Find Your Spot
            </Button>
            <Button variant="ghost" className="text-sm font-black italic uppercase tracking-[0.2em] text-surface-500 hover:text-white" onClick={() => navigate('/register')}>
               Become a Host
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
