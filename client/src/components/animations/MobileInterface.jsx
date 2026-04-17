import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Smartphone, ShieldCheck, Activity, Zap, Radio, Signal, Lock, Star, Globe, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function MobileInterface() {
  const [ledger, setLedger] = useState([
    { id: 'ID_7742', type: 'Check-in', status: 'Active' },
    { id: 'ID_7741', type: 'Payout', status: 'Complete' },
    { id: 'ID_7740', type: 'Processing', status: 'Synced' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLedger(prev => {
        const newTx = { 
          id: `ID_${Math.floor(Math.random() * 9000) + 1000}`, 
          type: Math.random() > 0.5 ? 'Check-in' : 'Payout', 
          status: 'Active' 
        };
        return [newTx, ...prev.slice(0, 3)];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative group perspective-1000">
      {/* 1. Technical HUD Labels (Floating around the phone) */}
      <motion.div 
        animate={{ y: [0, -10, 0] }} 
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-32 top-10 glass-dark border border-white/5 p-4 rounded-2xl space-y-2 z-20 backdrop-blur-3xl hidden xl:block"
      >
        <div className="flex items-center gap-3 text-primary-400">
          <Activity className="w-4 h-4" />
          <span className="text-[10px] font-black tracking-widest uppercase">Live Tracking</span>
        </div>
        <div className="flex items-center gap-3 text-emerald-400">
          <Lock className="w-4 h-4" />
          <span className="text-[10px] font-black tracking-widest uppercase">Encrypted Pay</span>
        </div>
      </motion.div>

      <motion.div 
        animate={{ y: [0, 10, 0] }} 
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-32 bottom-20 glass-dark border border-white/5 p-4 rounded-2xl space-y-2 z-20 backdrop-blur-3xl hidden xl:block"
      >
        <div className="flex items-center gap-3 text-orange-400">
          <Zap className="w-4 h-4 animate-pulse" />
          <span className="text-[10px] font-black tracking-widest uppercase">Smart Access</span>
        </div>
        <div className="flex items-center gap-3 text-surface-400">
          <Star className="w-4 h-4 fill-current" />
          <span className="text-[10px] font-black tracking-widest uppercase">Top Rated</span>
        </div>
      </motion.div>

      {/* 2. The Phone Shell */}
      <motion.div
        whileHover={{ rotateY: 5, rotateX: -5, scale: 1.02 }}
        className="relative aspect-[9/19.5] w-[300px] glass-dark rounded-[3.5rem] border-[4px] border-surface-800 p-2 shadow-[0_50px_100px_rgba(0,0,0,0.5)] transition-all duration-700"
      >
        <div className="h-full w-full rounded-[3rem] bg-black overflow-hidden flex flex-col relative px-6 py-12">
          
          {/* Top Interface Bar */}
          <div className="flex justify-between items-center mb-8 opacity-40">
             <span className="text-[10px] font-black text-white">9:41</span>
             <div className="flex gap-2">
                <Signal className="w-3 h-3 text-white" />
                <Globe className="w-3 h-3 text-white" />
             </div>
          </div>

          {/* Map Grid View */}
          <div className="relative h-44 w-full rounded-2xl bg-surface-900 border border-white/5 overflow-hidden mb-8">
             <div className="absolute inset-0 opacity-20 bg-linear-to-b from-primary-500/10 to-transparent" />
             <svg viewBox="0 0 200 150" className="w-full h-full text-white/10">
                <path d="M0 40 L200 40 M0 100 L200 100 M60 0 L60 150 M140 0 L140 150" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 8" />
                <motion.circle 
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  cx="100" cy="75" r="20" fill="var(--color-primary-500)" className="opacity-10" 
                />
                <MapPin cx="100" cy="75" className="w-6 h-6 text-primary-500 fill-primary-500/20" x="90" y="65" />
             </svg>
          </div>

          {/* Live Transaction Ledger */}
          <div className="flex-1 space-y-4 overflow-hidden">
             <p className="text-[9px] font-black text-surface-600 uppercase tracking-widest leading-none mb-2">Live Activity Feed</p>
             <AnimatePresence mode="popLayout">
                {ledger.map((tx) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5"
                  >
                    <div>
                      <p className="text-[10px] font-bold text-white leading-none">{tx.id}</p>
                      <p className="text-[8px] text-surface-500 uppercase tracking-tighter mt-1">{tx.type}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{tx.status}</p>
                    </div>
                  </motion.div>
                ))}
             </AnimatePresence>
          </div>

          {/* Lower Action Hub */}
          <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
             <div className="flex justify-between items-end">
                <div>
                   <p className="text-[9px] font-black text-surface-600 uppercase tracking-widest">Your Earnings</p>
                   <h4 className="text-2xl font-black text-white italic tracking-tighter">₹2,440.00</h4>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
                   <Zap className="w-5 h-5 text-primary-400" />
                </div>
             </div>
             <div className="w-full h-12 rounded-xl bg-primary-600 flex items-center justify-center text-xs font-black text-white uppercase tracking-[0.2em] shadow-glow">
                Manage Revenue
             </div>
          </div>

          {/* iPhone Home Indicator */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full" />
        </div>
      </motion.div>

      {/* Decorative Glow Elements */}
      <div className="absolute -inset-20 bg-primary-500/5 blur-[100px] rounded-full pointer-events-none" />
    </div>
  );
}
