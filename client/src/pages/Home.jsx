import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Target, Shield, MapPin, ParkingCircle, CreditCard, Star, Clock, Info, ShieldCheck, Globe, Cpu, Smartphone, BarChart3 } from 'lucide-react';
import HeroCar from '../components/animations/HeroCar';
import Button from '../components/ui/Button';
import { useState, useEffect } from 'react';

export default function Home() {
  const navigate = useNavigate();
  
  // Parallax Values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-300, 300], [10, -10]);
  const rotateY = useTransform(x, [-300, 300], [-10, 10]);

  const springConfig = { damping: 25, stiffness: 150 };
  const springX = useSpring(rotateY, springConfig);
  const springY = useSpring(rotateX, springConfig);

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
  };

  const floatingIcons = [
    { Icon: ShieldCheck, top: '20%', left: '10%', delay: 0 },
    { Icon: Globe, top: '60%', left: '5%', delay: 1 },
    { Icon: Cpu, top: '15%', right: '15%', delay: 0.5 },
    { Icon: Smartphone, top: '70%', right: '10%', delay: 1.5 },
  ];

  return (
    <div className="min-h-screen bg-surface-950 selection:bg-primary-500 relative overflow-hidden flex flex-col pt-20" onMouseMove={handleMouseMove}>
      
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '80px 80px' }}></div>
        <div className="absolute top-0 left-0 w-full h-[500px] bg-linear-to-b from-primary-600/10 to-transparent blur-3xl opacity-40" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-accent-600/5 rounded-full blur-[200px]" />
      </div>

      {/* Floating 3D Elements */}
      <div className="absolute inset-0 pointer-events-none z-10 hidden lg:block">
        {floatingIcons.map(({ Icon, ...pos }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.2, scale: 1 }}
            transition={{ delay: pos.delay + 0.5, duration: 2 }}
            style={{ 
              position: 'absolute', ...pos,
              x: useTransform(x, [-500, 500], [i % 2 === 0 ? 20 : -20, i % 2 === 0 ? -20 : 20]),
              y: useTransform(y, [-500, 500], [i % 2 === 0 ? 30 : -30, i % 2 === 0 ? -30 : 30]),
            }}
          >
            <motion.div 
              animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
              className="w-16 h-16 glass-dark border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-md"
            >
              <Icon className="w-8 h-8 text-primary-400" />
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex items-center justify-center py-20 px-6 overflow-hidden z-20">
        <motion.div 
          className="max-w-[1440px] mx-auto grid lg:grid-cols-2 gap-20 items-center"
          style={{ perspective: 2000 }}
        >
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ rotateX: springY, rotateY: springX }}
            className="space-y-10 relative z-30"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-4 px-5 py-2.5 rounded-2xl glass-dark border border-primary-500/30 text-white text-[10px] font-black tracking-[0.4em] uppercase shadow-glow">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-500 animate-ping" />
              Autonomous Mobility Network
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-8xl md:text-[9rem] font-black tracking-tighter leading-[0.8] italic uppercase text-white drop-shadow-2xl">
              Next Gen <br />
              <span className="gradient-text italic text-glow block mt-2 drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">Parking</span>
              <span className="block mt-2">Architecture.</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-xl text-surface-300 max-w-lg font-medium leading-relaxed opacity-90">
              India's first decentralized mobility marketplace. Secure verified spots with instant node verification and peer-to-peer settlement.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-8 pt-4">
              <Button size="lg" className="!rounded-3xl px-12 py-9 text-lg font-black italic uppercase tracking-[0.2em] shadow-glow transform hover:scale-105 transition-all group overflow-hidden relative" onClick={() => navigate('/search')}>
                 <span className="relative z-10 flex items-center gap-3">
                   Execute Entry <ArrowRight className="w-6 h-6 group-hover:translate-x-3 transition-transform" />
                 </span>
                 <div className="absolute inset-0 bg-linear-to-r from-primary-400 to-accent-400 opacity-0 group-hover:opacity-20 transition-opacity" />
              </Button>
              <Button variant="outline" size="lg" className="!rounded-3xl px-12 py-9 text-lg font-black italic uppercase tracking-[0.2em] border-white/20 hover:bg-white/5 hover:border-primary-500/50 backdrop-blur-sm" onClick={() => navigate('/register?role=owner')}>
                Register Host
              </Button>
            </motion.div>

            {/* Micro Stats */}
            <motion.div variants={itemVariants} className="flex gap-16 pt-10 border-t border-white/5">
              {[
                { label: 'Network Nodes', val: '5,000+' },
                { label: 'Secured Tx', val: '₹12M+' },
                { label: 'Identity Check', val: '100%' },
              ].map((s, i) => (
                <div key={i}>
                  <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest mb-1">{s.label}</p>
                  <p className="text-2xl font-black text-white italic tracking-tighter">{s.val}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* 3D Visual Hub */}
          <motion.div 
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            className="relative h-[700px] flex items-center justify-center"
            style={{ 
              rotateY: springX, 
              rotateX: springY,
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Visual Layers */}
            <div className="absolute inset-0 bg-primary-600/10 blur-[150px] pointer-events-none rounded-full animate-pulse" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] glass-dark border border-white/5 rounded-full rotate-45 opacity-20 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] glass-dark border border-white/10 rounded-full -rotate-12 opacity-10 pointer-events-none" />
            
            <motion.div 
              className="relative z-10 w-full"
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <HeroCar />
            </motion.div>

            {/* Digital Grid Overlay */}
            <div className="absolute inset-0 map-grid opacity-20 pointer-events-none -z-10 bg-[length:40px_40px]" />
          </motion.div>
        </motion.div>
      </section>

      {/* Feature Mesh */}
      <section className="py-32 px-6 bg-surface-950 relative overflow-hidden">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid lg:grid-cols-3 gap-10">
            {[
              { icon: Cpu, title: "CORE COMPUTE", desc: "Autonomous matching algorithm dynamically calculates pricing and proximity with millisecond response time.", gradient: "from-blue-500/20 to-purple-500/20" },
              { icon: ShieldCheck, title: "IMMUTABLE TRUST", desc: "Verification nodes ensure every spot and user is authenticated via zero-knowledge proof protocols.", gradient: "from-emerald-500/20 to-teal-500/20" },
              { icon: Zap, title: "INSTANT SETTLEMENT", desc: "Unified payment layer handles wallet deductions and host earnings with real-time liquidity via Razorpay.", gradient: "from-orange-500/20 to-rose-500/20" }
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group relative h-[400px] overflow-hidden rounded-[3.5rem] border border-white/5 bg-white/[0.01] hover:border-primary-500/30 transition-all duration-700 p-12 flex flex-col justify-end"
              >
                <div className={`absolute inset-0 bg-linear-to-br ${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-1000`} />
                <div className="relative z-10 space-y-6">
                  <div className="w-16 h-16 rounded-2xl glass-dark border border-white/10 flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-500">
                    <f.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase">{f.title}</h3>
                  <p className="text-surface-400 font-medium leading-relaxed leading-tight max-w-sm">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Grid */}
      <section className="py-32 px-6 border-t border-white/5 bg-linear-to-b from-transparent to-black/20">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col items-center text-center mb-24 max-w-3xl mx-auto space-y-10">
            <h2 className="text-7xl font-black tracking-tighter leading-none italic uppercase text-white">
              The Architecture of <span className="gradient-text italic">Tomorrow.</span>
            </h2>
            <p className="text-xl text-surface-400 font-medium max-w-2xl">A high-fidelity infrastructure built for India's evolving urban sprawl.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Razorpay Unified', icon: CreditCard },
              { title: 'Vector GPS', icon: MapPin },
              { title: 'Node Analytics', icon: BarChart3 },
              { title: 'Real-Time Sync', icon: Zap },
            ].map((item, i) => (
              <div key={i} className="group p-8 rounded-[2.5rem] glass-dark border border-white/5 hover:border-primary-500/40 transition-all cursor-default relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-500/5 blur-[50px] group-hover:bg-primary-500/10 transition-all" />
                <item.icon className="w-8 h-8 text-primary-400 mb-6 group-hover:scale-110 transition-transform" />
                <span className="text-2xl font-black italic uppercase tracking-tighter text-white block">{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
