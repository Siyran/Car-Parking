import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { spotAPI, bookingAPI, billingAPI } from '../../api';
import { useSocket } from '../../context/SocketContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, Plus, MapPin, IndianRupee, Users, ArrowUpRight, 
  Calendar, Clock, CheckCircle2, Navigation, Activity, Cpu, Shield, Radio, Car
} from 'lucide-react';
import { formatCurrency, formatDate, formatETA, formatDistance } from '../../lib/utils';
import toast from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';

// Fix leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ─── Animated car icon for incoming drivers ───
const createDriverIcon = (heading = 0) => {
  return L.divIcon({
    className: 'driver-marker-icon',
    html: `
      <div style="transform:rotate(${heading}deg);transition:transform 0.8s ease;width:40px;height:40px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 0 12px rgba(59,130,246,0.5));">
        <div style="width:32px;height:32px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 0 20px rgba(59,130,246,0.4);">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white" style="transform:rotate(45deg);">
            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

// ─── Parking spot icon for owner ───
const createSpotIcon = () => {
  return L.divIcon({
    className: 'spot-marker-icon',
    html: `
      <div style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;width:44px;height:44px;border-radius:50%;background:rgba(16,185,129,0.15);border:2px solid rgba(16,185,129,0.3);animation:spotPulseOwner 2s ease-in-out infinite;"></div>
        <div style="width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#10b981,#059669);border:2px solid white;box-shadow:0 0 20px rgba(16,185,129,0.5);z-index:1;display:flex;align-items:center;justify-content:center;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
};

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const { subscribeToDrivers, subscribeToDriverETA, joinSpot, leaveSpot, onGPSStopped } = useSocket();
  const [stats, setStats] = useState({ totalSpots: 0, activeBookings: 0, totalEarnings: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDrivers, setActiveDrivers] = useState([]); // from API
  const [liveDriverPositions, setLiveDriverPositions] = useState(new Map()); // bookingId -> { lat, lng, heading }
  const [ownerSpots, setOwnerSpots] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  // ─── Join spot rooms and subscribe to driver positions ───
  useEffect(() => {
    if (ownerSpots.length === 0) return;

    // Join all spot rooms
    ownerSpots.forEach(s => joinSpot(s._id));

    // Subscribe to real-time driver position updates
    const unsubPos = subscribeToDrivers((data) => {
      setLiveDriverPositions(prev => {
        const next = new Map(prev);
        next.set(data.bookingId, {
          lat: data.lat, lng: data.lng,
          heading: data.heading || 0,
          userId: data.userId
        });
        return next;
      });
    });

    // Subscribe to ETA updates
    const unsubETA = subscribeToDriverETA((data) => {
      setActiveDrivers(prev => prev.map(d =>
        d.bookingId === data.bookingId
          ? { ...d, eta: { duration: data.duration, distance: data.distance } }
          : d
      ));
    });

    // Subscribe to GPS stopped
    const unsubStop = onGPSStopped((data) => {
      setLiveDriverPositions(prev => {
        const next = new Map(prev);
        next.delete(data.bookingId);
        return next;
      });
      setActiveDrivers(prev => prev.filter(d => d.bookingId !== data.bookingId));
    });

    return () => {
      ownerSpots.forEach(s => leaveSpot(s._id));
      unsubPos();
      unsubETA();
      unsubStop();
    };
  }, [ownerSpots]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashRes, spotsRes] = await Promise.all([
        billingAPI.getOwnerDashboard(),
        spotAPI.getMy()
      ]);
      const { data } = dashRes;
      
      setStats({
        totalSpots: data.totalSpots || 0,
        activeBookings: data.activeBookings || 0,
        totalEarnings: data.totalEarnings || 0
      });
      setRecentBookings(data.recentTransactions || []);
      setOwnerSpots(spotsRes.data.spots || []);

      // Fetch active drivers
      try {
        const driversRes = await bookingAPI.getOwnerDrivers();
        setActiveDrivers(driversRes.data.drivers || []);
        // Initialize live positions from fetched data
        const posMap = new Map();
        (driversRes.data.drivers || []).forEach(d => {
          if (d.position) {
            posMap.set(d.bookingId, {
              lat: d.position.lat, lng: d.position.lng,
              heading: d.position.heading || 0,
              userId: d.user?._id
            });
          }
        });
        setLiveDriverPositions(posMap);
      } catch (err) {
        // No active drivers or endpoint not available
      }
    } catch (err) {
      toast.error('Provider connectivity failed: Sync required');
    }
    setLoading(false);
  };

  const statCards = [
    { label: 'Total Listed Spaces', value: stats.totalSpots, icon: MapPin, color: 'text-primary-400', bg: 'bg-primary-500/10' },
    { label: 'Live Space Occupancy', value: stats.activeBookings, icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Aggregated Revenue', value: formatCurrency(stats.totalEarnings), icon: IndianRupee, color: 'text-accent-400', bg: 'bg-accent-500/10' }
  ];

  // Calculate map center from spots
  const mapCenter = ownerSpots.length > 0
    ? [ownerSpots[0].location.coordinates[1], ownerSpots[0].location.coordinates[0]]
    : [34.0837, 74.7973];

  return (
    <div className="pt-32 min-h-screen bg-surface-950 selection:bg-primary-500 relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 map-grid opacity-10 pointer-events-none" />

      {/* Inject pulse animation */}
      <style>{`@keyframes spotPulseOwner { 0%,100% { transform:scale(1); opacity:0.6; } 50% { transform:scale(1.5); opacity:0.15; } }`}</style>

      <div className="max-w-[1240px] mx-auto px-8 w-full pb-24 relative z-10">
        
        {/* Provider Header */}
        <div className="mb-14 pt-12 flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-white/5 pb-12">
           <div className="space-y-4">
              <h1 className="text-6xl font-black text-white italic uppercase tracking-tighter leading-none">
                 Owner <span className="gradient-text italic text-glow">Dashboard</span>.
              </h1>
           </div>
           
           <div className="flex gap-4">
              <Button onClick={() => navigate('/owner/add-spot')} size="lg" className="!rounded-[1.5rem] px-8 py-5 text-sm font-black uppercase tracking-widest shadow-glow flex items-center gap-3">
                 <Plus className="w-5 h-5" /> List My Space
              </Button>
           </div>
        </div>

        {/* Stats */}
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

        {/* ─── LIVE DRIVER TRACKING MAP ─── */}
        {ownerSpots.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between px-4 mb-6">
              <div className="flex items-center gap-3">
                <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
                <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em] italic">Live Driver Tracking</h4>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                  {liveDriverPositions.size} Active {liveDriverPositions.size === 1 ? 'Driver' : 'Drivers'}
                </span>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute -inset-1 bg-linear-to-r from-primary-500 to-emerald-500 rounded-[3rem] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
              <div className="glass-dark rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl relative">
                <div className="h-[400px] relative">
                  <div className="absolute inset-0 z-10 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.7)]" />
                  <MapContainer center={mapCenter} zoom={14} className="h-full w-full dark-map-tiles" zoomControl={false}>
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Owner's parking spots */}
                    {ownerSpots.map(spot => (
                      <Marker
                        key={spot._id}
                        position={[spot.location.coordinates[1], spot.location.coordinates[0]]}
                        icon={createSpotIcon()}
                      >
                        <Popup>
                          <div className="p-4 bg-surface-950 border border-white/10 rounded-2xl min-w-[200px]">
                            <h3 className="text-sm font-black text-white uppercase tracking-tighter mb-1">{spot.title}</h3>
                            <p className="text-[10px] text-surface-400 uppercase tracking-widest">{spot.address}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="success" className="!rounded-lg px-2 text-[9px] font-black uppercase">
                                {spot.availableSlots}/{spot.totalSlots} Open
                              </Badge>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    ))}

                    {/* Live driver markers */}
                    {Array.from(liveDriverPositions.entries()).map(([bookingId, pos]) => {
                      const driverInfo = activeDrivers.find(d => d.bookingId === bookingId);
                      return (
                        <Marker
                          key={bookingId}
                          position={[pos.lat, pos.lng]}
                          icon={createDriverIcon(pos.heading)}
                        >
                          <Popup>
                            <div className="p-4 bg-surface-950 border border-white/10 rounded-2xl min-w-[220px]">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center">
                                  <Car className="w-4 h-4 text-primary-400" />
                                </div>
                                <div>
                                  <h3 className="text-sm font-black text-white uppercase tracking-tighter">{driverInfo?.user?.name || 'Driver'}</h3>
                                  <p className="text-[9px] text-surface-400 uppercase tracking-widest">{driverInfo?.user?.phone || ''}</p>
                                </div>
                              </div>
                              {driverInfo?.eta && (
                                <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/10">
                                  <div>
                                    <p className="text-[8px] font-black text-surface-500 uppercase tracking-widest">ETA</p>
                                    <p className="text-lg font-black text-primary-400 italic tracking-tighter">{formatETA(driverInfo.eta.duration)}</p>
                                  </div>
                                  <div className="w-px h-8 bg-white/10" />
                                  <div>
                                    <p className="text-[8px] font-black text-surface-500 uppercase tracking-widest">Distance</p>
                                    <p className="text-lg font-black text-white italic tracking-tighter">{formatDistance(driverInfo.eta.distance)}</p>
                                  </div>
                                </div>
                              )}
                              <p className="text-[9px] text-surface-500 uppercase tracking-widest mt-2">
                                → {driverInfo?.spot?.title || 'Spot'}
                              </p>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}
                  </MapContainer>
                </div>

                {/* Driver list below map */}
                {activeDrivers.length > 0 && (
                  <div className="p-6 bg-surface-950/80 backdrop-blur-2xl border-t border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                      <Car className="w-4 h-4 text-primary-400" />
                      <span className="text-[10px] font-black text-surface-400 uppercase tracking-widest">Incoming Drivers</span>
                    </div>
                    <div className="grid gap-3">
                      {activeDrivers.map(driver => (
                        <div key={driver.bookingId} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
                              <Navigation className="w-5 h-5 text-primary-400 rotate-45" />
                            </div>
                            <div>
                              <p className="text-xs font-black text-white uppercase tracking-tighter">{driver.user?.name}</p>
                              <p className="text-[9px] text-surface-500 uppercase tracking-widest">→ {driver.spot?.title}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {driver.eta ? (
                              <>
                                <p className="text-lg font-black text-primary-400 italic tracking-tighter">{formatETA(driver.eta.duration)}</p>
                                <p className="text-[9px] font-bold text-surface-500 uppercase tracking-widest">{formatDistance(driver.eta.distance)}</p>
                              </>
                            ) : (
                              <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Awaiting GPS</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {liveDriverPositions.size === 0 && activeDrivers.length === 0 && (
                  <div className="p-8 bg-surface-950/80 backdrop-blur-2xl border-t border-white/5 text-center">
                    <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">No active drivers en route. Map will update in real-time when users start navigating.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-10">
           {/* Primary Feed: Space Activity */}
           <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center justify-between px-4">
                 <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-primary-400 tech-pulse" />
                    <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em] italic">Live Space Activity</h4>
                 </div>
                 <Button variant="ghost" className="text-[10px] font-black uppercase text-surface-500" onClick={() => navigate('/owner/listings')}>View Full Grid</Button>
              </div>

              <div className="grid gap-5">
                 {loading ? (
                    [1,2,3].map(i => <div key={i} className="h-32 rounded-[2rem] glass-dark animate-pulse" />)
                 ) : recentBookings.length === 0 ? (
                    <div className="text-center py-20 glass-dark border border-white/5 rounded-[3rem]">
                       <Shield className="w-16 h-16 text-surface-600 mx-auto mb-6 opacity-20" />
                       <p className="text-xl font-black text-white italic uppercase tracking-tighter">Zero Space Activity</p>
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

           {/* Network Health */}
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
                         { label: 'Real-Time GPS', val: liveDriverPositions.size > 0 ? 'Active' : 'Idle', color: liveDriverPositions.size > 0 ? 'bg-emerald-500' : 'bg-surface-600' },
                         { label: 'Space Uptime', val: '100%', color: 'bg-emerald-500' },
                         { label: 'Socket Status', val: 'Connected', color: 'bg-primary-500' },
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
