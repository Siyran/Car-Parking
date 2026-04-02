import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { spotAPI, bookingAPI } from '../../api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, Plus, MapPin, IndianRupee, Users, ArrowUpRight, 
  Calendar, Clock, CheckCircle2, Navigation, Activity, Cpu, Shield 
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalSpots: 0, activeBookings: 0, totalEarnings: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [spotsRes, bookingsRes] = await Promise.all([
        spotAPI.getMy(),
        bookingAPI.getOwnerBookings({ limit: 5 })
      ]);
      
      const spots = spotsRes.data.spots;
      const earnings = spots.reduce((acc, s) => acc + (s.totalEarnings || 0), 0);
      
      setStats({
        totalSpots: spots.length,
        activeBookings: bookingsRes.data.bookings.filter(b => b.status === 'active').length,
        totalEarnings: earnings
      });
      setRecentBookings(bookingsRes.data.bookings);
    } catch (err) {
      toast.error('Provider telemetry link failed');
    }
    setLoading(false);
  };

  const statCards = [
    { label: 'Total Infrastructure Units', value: stats.totalSpots, icon: MapPin, color: 'text-primary-400', bg: 'bg-primary-500/10' },
    { label: 'Live Node Occupancy', value: stats.activeBookings, icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Aggregated Revenue', value: formatCurrency(stats.totalEarnings), icon: IndianRupee, color: 'text-accent-400', bg: 'bg-accent-500/10' }
  ];

  return (
    <div className="pt-20 min-h-screen bg-surface-950 selection:bg-primary-500 relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 map-grid opacity-10 pointer-events-none" />

      <div className="max-w-[1240px] mx-auto px-8 w-full pb-24 relative z-10">
        
        {/* Futuristic Provider Header */}
        <div className="mb-14 pt-12 flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-white/5 pb-12">
           <div className="space-y-4">
              <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-accent-600/10 border border-accent-500/20 text-[10px] font-black text-accent-400 uppercase tracking-[0.3em] w-fit">
                 <Cpu className="w-3.5 h-3.5" />
                 Infrastructure Management
              </div>
              <h1 className="text-6xl font-black text-white italic uppercase tracking-tighter leading-none">
                 Owner <span className="gradient-text italic text-glow">Dashboard</span>.
              </h1>
           </div>
           
           <div className="flex gap-4">
              <Button onClick={() => navigate('/owner/add-spot')} size="lg" className="!rounded-[1.5rem] px-8 py-5 text-sm font-black uppercase tracking-widest shadow-glow flex items-center gap-3">
                 <Plus className="w-5 h-5" /> Deploy New Node
              </Button>
           </div>
        </div>

        {/* Real-time Telemetry Stats */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
           {statCards.map((stat, i) => (
             <motion.div key={stat.label} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
               className="glass-dark border border-white/5 rounded-[2.5rem] p-8 group hover:border-primary-500/20 transition-all hover:bg-white/[0.02]"
             >
                <div className="flex justify-between items-start mb-10">
                   <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center border border-white/5`}>
                      <stat.icon className={`w-7 h-7 ${stat.color}`} />
                   </div>
                   <ArrowUpRight className="w-5 h-5 text-surface-600 group-hover:text-primary-400 transition-colors" />
                </div>
                <p className="text-[10px] font-black text-surface-500 uppercase tracking-[0.4em] mb-2 leading-none">{stat.label}</p>
                <h3 className="text-4xl font-black text-white italic tracking-tighter transition-all group-hover:translate-x-2">{stat.value}</h3>
             </motion.div>
           ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
           {/* Primary Feed: Node Activity */}
           <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center justify-between px-4">
                 <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-primary-400 tech-pulse" />
                    <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em] italic">Live Node Telemetry</h4>
                 </div>
                 <Button variant="ghost" className="text-[10px] font-black uppercase text-surface-500" onClick={() => navigate('/owner/my-listings')}>View Full Grid</Button>
              </div>

              <div className="grid gap-5">
                 {loading ? (
                    [1,2,3].map(i => <div key={i} className="h-32 rounded-[2rem] glass-dark animate-pulse" />)
                 ) : recentBookings.length === 0 ? (
                    <div className="text-center py-20 glass-dark border border-white/5 rounded-[3rem]">
                       <Shield className="w-16 h-16 text-surface-600 mx-auto mb-6 opacity-20" />
                       <p className="text-xl font-black text-white italic uppercase tracking-tighter">Zero Network Activity</p>
                       <p className="text-sm font-medium text-surface-600 mt-2">No active sessions or reservations linked to your identity.</p>
                    </div>
                 ) : (
                    recentBookings.map((booking, i) => (
                       <motion.div key={booking._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                         className="group glass-dark border border-white/5 hover:border-emerald-500/20 rounded-[2.5rem] p-8 transition-all flex flex-col md:flex-row items-center gap-8 relative overflow-hidden"
                       >
                         <div className="absolute top-0 left-0 w-40 h-40 bg-emerald-500/[0.02] blur-3xl pointer-events-none" />
                         
                         <div className="w-16 h-16 rounded-[1.5rem] bg-surface-900 border border-white/10 flex items-center justify-center shrink-0 shadow-2xl">
                            <Clock className={`w-7 h-7 ${booking.status === 'active' ? 'text-emerald-500 animate-pulse' : 'text-surface-500'}`} />
                         </div>

                         <div className="flex-1 min-w-0 text-center md:text-left">
                           <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                             <h5 className="text-lg font-black text-white italic uppercase tracking-tighter truncate leading-none group-hover:text-emerald-400 transition-colors">{booking.user?.name}</h5>
                             <Badge variant={booking.status === 'active' ? 'primary' : 'success'} className="!rounded-lg px-2 text-[8px] font-black uppercase text-glow">
                               {booking.status}
                             </Badge>
                           </div>
                           <div className="flex items-center justify-center md:justify-start gap-3">
                              <MapPin className="w-3.5 h-3.5 text-surface-600" />
                              <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">{booking.spot?.title}</p>
                           </div>
                         </div>

                         <div className="flex flex-col items-center md:items-end gap-3 shrink-0 w-full md:w-auto pt-6 md:pt-0 border-t md:border-t-0 border-white/5">
                            <p className="text-[9px] font-black text-surface-600 uppercase tracking-widest leading-none mb-1">Session Data</p>
                            <p className="text-2xl font-black text-white italic tracking-tighter leading-none">{formatCurrency(booking.totalAmount || 0)}</p>
                            <p className="text-[9px] font-bold text-surface-500 uppercase tracking-widest">{formatDate(booking.startTime)}</p>
                         </div>
                       </motion.div>
                    ))
                 )}
              </div>
           </div>

           {/* Secondary View: System Insights */}
           <div className="space-y-8">
              <div className="flex items-center gap-3 px-4">
                 <Shield className="w-5 h-5 text-accent-400" />
                 <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em] italic">Network Health</h4>
              </div>

              <div className="glass-dark border border-white/5 rounded-[3rem] p-8 space-y-10 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-accent-500/5 blur-3xl pointer-events-none" />
                 
                 <div className="space-y-4">
                    <p className="text-sm font-black text-white italic uppercase tracking-widest">Protocol Sync</p>
                    <div className="space-y-6">
                       {[
                         { label: 'Blockchain Log', val: '99.4%', color: 'bg-primary-500' },
                         { label: 'Node Uptime', val: '100%', color: 'bg-emerald-500' },
                         { label: 'API Latency', val: '12ms', color: 'bg-accent-500' },
                       ].map(node => (
                         <div key={node.label} className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black text-surface-500 uppercase tracking-widest">
                               <span>{node.label}</span>
                               <span className="text-white">{node.val}</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                               <motion.div initial={{ width: 0 }} animate={{ width: '80%' }} className={`h-full ${node.color}`} />
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4">
                    <p className="text-center text-[10px] font-black text-surface-500 uppercase tracking-[0.2em] italic leading-relaxed">Your infrastructure is performing with absolute 100% efficiency. No recalibration required.</p>
                    <Button variant="secondary" className="w-full !rounded-xl text-[10px] font-black uppercase tracking-widest py-3 hover:bg-white/5" onClick={() => navigate('/owner/earnings')}>Detailed Analytics</Button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
