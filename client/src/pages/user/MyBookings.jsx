import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingAPI } from '../../api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, Calendar, Timer, X, Navigation, Activity, History, ChevronRight, Zap } from 'lucide-react';
import { formatCurrency, formatDate, formatTime, formatDuration } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    loadData();
  }, [filter]);

  useEffect(() => {
    if (!activeSession) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - new Date(activeSession.startTime).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, activeRes] = await Promise.all([
        bookingAPI.getMy({ status: filter || undefined }),
        bookingAPI.getActive()
      ]);
      setBookings(bookingsRes.data.bookings);
      setActiveSession(activeRes.data.booking);
    } catch (err) {
      toast.error('Telemetry link failed');
    }
    setLoading(false);
  };

  const handleEnd = async () => {
    if (!activeSession) return;
    setEnding(true);
    try {
      const { data } = await bookingAPI.end(activeSession._id);
      toast.success(`Session Terminated: ${formatCurrency(data.booking.totalAmount)} Charged`);
      setActiveSession(null);
      loadData();
    } catch (err) {
      toast.error('Termination sequence failed');
    }
    setEnding(false);
  };

  const handleCancel = async (id) => {
    try {
      await bookingAPI.cancel(id);
      toast.success('Reservation De-allocated');
      setActiveSession(null);
      loadData();
    } catch (err) {
      toast.error('De-allocation failed');
    }
  };

  const fmtElapsed = () => {
    const h = Math.floor(elapsed / 3600);
    const m = Math.floor((elapsed % 3600) / 60);
    const s = elapsed % 60;
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
  };

  const currentCost = () => {
    if (!activeSession?.spot?.pricePerHour) return 0;
    return Math.ceil(elapsed / 3600) * activeSession.spot.pricePerHour;
  };

  const statusVariant = { active: 'primary', completed: 'success', cancelled: 'danger' };

  return (
    <div className="pt-20 min-h-screen bg-surface-950 selection:bg-primary-500 relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 map-grid opacity-10 pointer-events-none" />

      <div className="max-w-[1000px] mx-auto px-8 w-full pb-24 relative z-10">
        
        {/* Futuristic Dashboard Header */}
        <div className="mb-12 pt-10 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-10">
           <div className="space-y-4">
              <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary-600/10 border border-primary-500/20 text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] w-fit">
                 <History className="w-3.5 h-3.5" />
                 Reservation Telemetry
              </div>
              <h1 className="text-6xl font-black text-white italic uppercase tracking-tighter leading-none">
                 My <span className="gradient-text italic text-glow">Bookings</span>.
              </h1>
           </div>
           
           <div className="flex gap-2 glass-dark border border-white/5 p-1.5 rounded-2xl shadow-2xl">
              {[{ v: '', l: 'All Nodes' }, { v: 'active', l: 'Active' }, { v: 'completed', l: 'Finalized' }].map(({ v, l }) => (
                <button key={v} onClick={() => setFilter(v)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === v ? 'bg-primary-600 text-white shadow-glow' : 'text-surface-500 hover:text-white'}`}>
                  {l}
                </button>
              ))}
           </div>
        </div>

        {/* Immersive Active Session Terminal */}
        <AnimatePresence>
          {activeSession && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="mb-12 relative group"
            >
              <div className="absolute -inset-1 bg-linear-to-r from-primary-500 to-accent-500 rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="glass-dark rounded-[3rem] border-2 border-primary-500/40 p-10 relative overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.15)]">
                 <div className="absolute top-0 right-0 w-60 h-60 bg-primary-600/10 blur-[100px] pointer-events-none" />
                 
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
                    <div className="flex items-center gap-5">
                       <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                          <Zap className="w-8 h-8 text-emerald-500 animate-pulse" />
                       </div>
                       <div>
                          <Badge variant="primary" className="!rounded-lg px-3 py-1 font-black uppercase text-[10px] mb-2 tracking-widest border-none text-glow animate-pulse">Live Tracking Active</Badge>
                          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">{activeSession.spot?.title}</h2>
                          <div className="flex items-center gap-2 mt-2">
                             <MapPin className="w-4 h-4 text-primary-500" />
                             <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">{activeSession.spot?.address}</p>
                          </div>
                       </div>
                    </div>
                    <button onClick={() => handleCancel(activeSession._id)} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-surface-500 hover:text-danger-500 hover:bg-danger-500/10 transition-all ml-auto md:ml-0">
                       <X className="w-6 h-6" />
                    </button>
                 </div>

                 <div className="grid md:grid-cols-3 gap-8 p-8 bg-black/40 rounded-[2rem] border border-white/5 shadow-inner">
                    <div className="text-center space-y-3 border-b md:border-b-0 md:border-r border-white/5 pb-8 md:pb-0">
                       <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest opacity-80">Temporal Duration</p>
                       <div className="text-4xl font-mono font-black text-primary-400 italic tracking-widest">{fmtElapsed()}</div>
                    </div>
                    <div className="text-center space-y-3 border-b md:border-b-0 md:border-r border-white/5 pb-8 md:pb-0">
                       <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest opacity-80">Accrued Charges</p>
                       <div className="text-4xl font-black text-white italic tracking-tighter">₹{currentCost()}</div>
                    </div>
                    <div className="text-center space-y-3">
                       <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest opacity-80">Unit Base Rate</p>
                       <div className="text-4xl font-black text-accent-500 italic tracking-tighter">₹{activeSession.spot?.pricePerHour}/H</div>
                    </div>
                 </div>

                 <div className="flex flex-col sm:flex-row gap-5 mt-10">
                    <Button onClick={handleEnd} loading={ending} variant="danger" className="flex-1 !rounded-2xl py-6 text-sm font-black uppercase tracking-[0.2em] shadow-glow" size="lg">
                       <Timer className="w-5 h-5 mr-3" /> Terminate Node Session
                    </Button>
                    <Button onClick={() => {
                       const [lng, lat] = activeSession.spot.location.coordinates;
                       window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
                    }} variant="secondary" size="lg" className="px-10 !rounded-2xl py-6 border border-white/10 hover:bg-white/5 transition-all">
                       <Navigation className="w-6 h-6 rotate-45" />
                    </Button>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Telemetry Stream: Historical Data */}
        <div className="space-y-6 relative">
          <div className="flex items-center gap-4 px-2">
             <div className="h-px flex-1 bg-white/5" />
             <span className="text-[10px] font-black text-surface-400 uppercase tracking-[0.5em] opacity-80">Historical Nodes</span>
             <div className="h-px flex-1 bg-white/5" />
          </div>

          {bookings.length === 0 && !loading && (
            <div className="text-center py-32 glass-dark border border-white/5 rounded-[3rem] relative overflow-hidden">
               <div className="absolute inset-0 bg-primary-500/5 opacity-10 pointer-events-none" />
               <Calendar className="w-20 h-20 mx-auto mb-8 opacity-20 text-white" />
               <p className="text-2xl font-black text-white italic uppercase tracking-tighter">No Ledger Entries</p>
               <p className="text-sm font-medium text-surface-400 mt-2 max-w-xs mx-auto opacity-70">Infrastructure utilization records are currently empty. Resume search to begin.</p>
               <Button onClick={() => navigate('/search')} variant="ghost" className="mt-10 !rounded-2xl px-10 py-4 text-xs font-black uppercase tracking-widest border border-white/5 text-primary-400">Execute Terminal Search</Button>
            </div>
          )}

          <div className="grid gap-5">
             {bookings.filter(b => b._id !== activeSession?._id).map((b, i) => (
               <motion.div key={b._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                 onClick={() => navigate(`/spots/${b.spot?._id}`)}
                 className="group cursor-pointer glass-dark border border-white/5 hover:border-primary-500/20 rounded-[2.5rem] p-7 transition-all flex flex-col md:flex-row items-center gap-8 relative overflow-hidden"
               >
                 <div className="absolute top-0 left-0 w-32 h-32 bg-primary-500/[0.02] blur-2xl pointer-events-none" />

                 <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-2xl transition-transform group-hover:scale-110 ${b.status === 'completed' ? 'bg-emerald-500/10 border border-emerald-500/20' : b.status === 'cancelled' ? 'bg-danger-500/10 border border-danger-500/20' : 'bg-primary-500/10 border border-primary-500/20'}`}>
                   <Clock className={`w-7 h-7 ${b.status === 'completed' ? 'text-emerald-500' : b.status === 'cancelled' ? 'text-danger-500' : 'text-primary-500'}`} />
                 </div>

                 <div className="flex-1 min-w-0 text-center md:text-left">
                   <h3 className="text-xl font-black text-white italic uppercase tracking-tighter truncate group-hover:text-primary-400 transition-colors leading-none mb-2">{b.spot?.title || 'System Unknown'}</h3>
                   <div className="flex items-center justify-center md:justify-start gap-4">
                      <p className="text-[10px] font-black text-surface-300 uppercase tracking-widest">{formatDate(b.startTime)}</p>
                      <div className="w-1 h-1 rounded-full bg-white/20" />
                      <p className="text-[10px] font-black text-surface-300 uppercase tracking-widest">{formatTime(b.startTime)} — {b.endTime ? formatTime(b.endTime) : 'ACTIVE'}</p>
                   </div>
                 </div>

                 <div className="flex flex-col items-center md:items-end gap-3 shrink-0 w-full md:w-auto pt-6 md:pt-0 border-t md:border-t-0 border-white/5">
                   <div className="text-2xl font-black text-white italic tracking-tighter">
                      {b.totalAmount > 0 ? formatCurrency(b.totalAmount) : 'Pending..'}
                   </div>
                   <Badge variant={statusVariant[b.status]} className="!rounded-xl px-4 py-1.5 font-black uppercase text-[10px] border-none shadow-glow">
                      {b.status}
                   </Badge>
                 </div>
               </motion.div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
