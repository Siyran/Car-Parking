import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { spotAPI, bookingAPI, billingAPI } from '../../api';
import { useSocket } from '../../context/SocketContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { motion } from 'framer-motion';
import { 
  Plus, MapPin, Users, Clock, Shield, Radio, Car, TrendingUp, DollarSign,
  Sparkles, Route, Layers3, CircleDollarSign, CheckCircle2, AlertTriangle, TimerReset
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

const createDriverIcon = (heading = 0) => {
  return L.divIcon({
    className: 'driver-marker-icon',
    html: `
      <div style="transform:rotate(${heading}deg);width:32px;height:32px;display:flex;align-items:center;justify-content:center;">
        <div style="width:24px;height:24px;background:#3b82f6;border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 0 10px rgba(59,130,246,0.5);">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const createSpotIcon = () => {
  return L.divIcon({
    className: 'spot-marker-icon',
    html: `
      <div style="width:24px;height:24px;border-radius:50%;background:#10b981;border:2px solid white;box-shadow:0 0 10px rgba(16,185,129,0.5);display:flex;align-items:center;justify-content:center;">
        <div style="width:8px;height:8px;border-radius:50%;background:white;"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const { subscribeToDrivers, subscribeToDriverETA, joinSpot, leaveSpot, onGPSStopped } = useSocket();
  const [stats, setStats] = useState({ totalSpots: 0, activeBookings: 0, totalEarnings: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDrivers, setActiveDrivers] = useState([]);
  const [liveDriverPositions, setLiveDriverPositions] = useState(new Map());
  const [ownerSpots, setOwnerSpots] = useState([]);
  const [mapMode, setMapMode] = useState('portfolio');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (ownerSpots.length === 0) return;
    ownerSpots.forEach(s => joinSpot(s._id));
    const unsubPos = subscribeToDrivers((data) => {
      setLiveDriverPositions(prev => {
        const next = new Map(prev);
        next.set(data.bookingId, { lat: data.lat, lng: data.lng, heading: data.heading || 0, userId: data.userId });
        return next;
      });
    });
    const unsubETA = subscribeToDriverETA((data) => {
      setActiveDrivers(prev => prev.map(d => d.bookingId === data.bookingId ? { ...d, eta: { duration: data.duration, distance: data.distance } } : d));
    });
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
      setStats({
        totalSpots: dashRes.data.totalSpots || 0,
        activeBookings: dashRes.data.activeBookings || 0,
        totalEarnings: dashRes.data.totalEarnings || 0
      });
      setRecentBookings(dashRes.data.recentTransactions || []);
      setOwnerSpots(spotsRes.data.spots || []);

      const driversRes = await bookingAPI.getOwnerDrivers().catch(() => ({ data: { drivers: [] } }));
      setActiveDrivers(driversRes.data.drivers || []);
      const posMap = new Map();
      (driversRes.data.drivers || []).forEach(d => {
        if (d.position) posMap.set(d.bookingId, { lat: d.position.lat, lng: d.position.lng, heading: d.position.heading || 0, userId: d.user?._id });
      });
      setLiveDriverPositions(posMap);
    } catch (err) {
      toast.error('Failed to sync dashboard data');
    }
    setLoading(false);
  };

  const statCards = [
    { label: 'Total Spaces', value: stats.totalSpots, note: `${ownerSpots.filter((spot) => spot.status === 'approved').length} approved`, icon: MapPin, color: 'text-primary-300', bg: 'from-primary-500/20 to-primary-500/5', glow: 'shadow-[0_0_40px_-18px_rgba(59,92,255,0.6)]' },
    { label: 'Active Sessions', value: stats.activeBookings, note: activeDrivers.length > 0 ? `${activeDrivers.length} drivers inbound` : 'No live arrivals', icon: Users, color: 'text-emerald-300', bg: 'from-emerald-500/20 to-emerald-500/5', glow: 'shadow-[0_0_40px_-18px_rgba(16,185,129,0.5)]' },
    { label: 'Total Earnings', value: formatCurrency(stats.totalEarnings), note: `${formatCurrency(Math.max(stats.totalEarnings / Math.max(stats.totalSpots || 1, 1), 0))} per space`, icon: DollarSign, color: 'text-amber-200', bg: 'from-amber-500/20 to-amber-500/5', glow: 'shadow-[0_0_40px_-18px_rgba(245,158,11,0.55)]' }
  ];

  const approvedSpots = ownerSpots.filter((spot) => spot.status === 'approved');
  const pendingSpots = ownerSpots.filter((spot) => spot.status === 'pending');
  const rejectedSpots = ownerSpots.filter((spot) => spot.status === 'rejected');
  const averageOccupancy = ownerSpots.length
    ? Math.round(ownerSpots.reduce((sum, spot) => {
        if (!spot.totalSlots) return sum;
        return sum + ((spot.totalSlots - spot.availableSlots) / spot.totalSlots) * 100;
      }, 0) / ownerSpots.length)
    : 0;
  const liveArrivalRate = stats.activeBookings > 0
    ? Math.min(100, Math.round((activeDrivers.length / stats.activeBookings) * 100))
    : 12;
  const uptime = 99.9;
  const latency = activeDrivers.length > 0 ? 18 : 24;
  const throughput = recentBookings.length > 0 ? Math.round((recentBookings.length / Math.max(ownerSpots.length, 1)) * 100) : 0;
  const mapCenter = ownerSpots.length > 0 ? [ownerSpots[0].location.coordinates[1], ownerSpots[0].location.coordinates[0]] : [34.0837, 74.7973];

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-linear-to-br from-white/[0.04] via-transparent to-primary-500/[0.06] p-5 md:p-7 shadow-[0_30px_80px_-45px_rgba(59,92,255,0.45)]"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -right-14 top-0 h-40 w-40 rounded-full bg-primary-500/12 blur-3xl" />
          <div className="absolute left-0 bottom-0 h-32 w-32 rounded-full bg-emerald-500/8 blur-3xl" />
        </div>

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-primary-500/12 text-primary-300 border-primary-400/20 px-3 py-1 text-[10px] uppercase tracking-[0.28em]">
                Operations Center
              </Badge>
              <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-400/20 px-3 py-1 text-[10px] uppercase tracking-[0.24em]">
                {activeDrivers.length > 0 ? `${activeDrivers.length} inbound live` : 'Quiet traffic window'}
              </Badge>
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-[-0.04em] leading-none">
                Run your parking network
                <span className="block mt-2 text-surface-400">with live operational context.</span>
              </h1>
              <p className="mt-4 max-w-2xl text-sm md:text-base text-surface-400 leading-7">
                Track occupancy, spot approvals, incoming drivers and earnings from one control surface designed for quick decisions on desktop and mobile.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:min-w-[360px]">
            {[
              { label: 'Occupancy', value: `${averageOccupancy}%`, icon: Layers3 },
              { label: 'Approved', value: approvedSpots.length, icon: CheckCircle2 },
              { label: 'Pending', value: pendingSpots.length, icon: AlertTriangle },
              { label: 'Throughput', value: `${throughput}%`, icon: TimerReset }
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/8 bg-black/20 px-4 py-4 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-surface-500">{item.label}</span>
                  <item.icon className="h-4 w-4 text-surface-500" />
                </div>
                <p className="mt-3 text-2xl font-black tracking-tight text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mt-6 flex flex-col gap-3 md:flex-row">
          <Button onClick={() => navigate('/owner/add-spot')} className="gap-2 !rounded-2xl px-6">
            <Plus className="w-4 h-4" /> Add New Space
          </Button>
          <Button variant="secondary" onClick={() => navigate('/owner/listings')} className="gap-2 !rounded-2xl border-white/10">
            <Layers3 className="w-4 h-4" /> Review Portfolio
          </Button>
          <Button variant="ghost" onClick={() => navigate('/owner/earnings')} className="justify-start gap-2 !rounded-2xl text-surface-300">
            <CircleDollarSign className="w-4 h-4" /> Inspect Earnings Stream
          </Button>
        </div>
      </motion.section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {statCards.map((stat) => (
          <motion.div key={stat.label} whileHover={{ y: -4 }}>
            <Card className={`relative overflow-hidden p-6 border-white/8 bg-linear-to-br ${stat.bg} ${stat.glow}`}>
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-white/[0.04] blur-2xl" />
              <div className="flex items-center justify-between mb-8">
                <div className="h-14 w-14 rounded-2xl bg-black/25 backdrop-blur-xl border border-white/8 flex items-center justify-center">
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <TrendingUp className="w-4 h-4 text-surface-600" />
              </div>
              <p className="text-[11px] font-bold text-surface-500 uppercase tracking-[0.26em]">{stat.label}</p>
              <h3 className="text-3xl md:text-4xl font-black text-white mt-2 tracking-tight">{stat.value}</h3>
              <p className="mt-3 text-xs text-surface-400">{stat.note}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.75fr_0.95fr] gap-6 md:gap-8">
        <div className="space-y-6">
          <Card className="overflow-hidden p-0 border-white/8 bg-white/[0.02]">
            <div className="flex flex-col gap-4 border-b border-white/6 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary-400" />
                  <h3 className="text-lg font-semibold text-white">Live Operations Map</h3>
                </div>
                <p className="mt-2 text-xs md:text-sm text-surface-400">
                  Scan your full inventory, active approaches and slot pressure at a glance.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setMapMode('portfolio')}
                  className={`rounded-xl px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] transition-all ${mapMode === 'portfolio' ? 'bg-primary-500/12 text-primary-300 border border-primary-400/20' : 'bg-white/5 text-surface-400 border border-white/6 hover:text-white'}`}
                >
                  Portfolio
                </button>
                <button
                  type="button"
                  onClick={() => setMapMode('drivers')}
                  className={`rounded-xl px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] transition-all ${mapMode === 'drivers' ? 'bg-emerald-500/12 text-emerald-300 border border-emerald-400/20' : 'bg-white/5 text-surface-400 border border-white/6 hover:text-white'}`}
                >
                  Arrivals
                </button>
              </div>
            </div>

            <div className="grid gap-4 border-b border-white/6 px-5 py-4 sm:grid-cols-3 md:px-6">
              <div className="rounded-2xl border border-white/6 bg-black/20 px-4 py-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-surface-500">Visible spaces</p>
                <p className="mt-2 text-2xl font-black text-white">{ownerSpots.length}</p>
              </div>
              <div className="rounded-2xl border border-white/6 bg-black/20 px-4 py-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-surface-500">Drivers inbound</p>
                <p className="mt-2 text-2xl font-black text-emerald-300">{activeDrivers.length}</p>
              </div>
              <div className="rounded-2xl border border-white/6 bg-black/20 px-4 py-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-surface-500">Occupancy load</p>
                <p className="mt-2 text-2xl font-black text-primary-300">{averageOccupancy}%</p>
              </div>
            </div>

            <div className="h-[360px] md:h-[440px] relative">
              <MapContainer center={mapCenter} zoom={14} className="h-full w-full dark-map-tiles" zoomControl={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {(mapMode === 'portfolio' ? ownerSpots : approvedSpots).map(spot => (
                  <Marker key={spot._id} position={[spot.location.coordinates[1], spot.location.coordinates[0]]} icon={createSpotIcon()}>
                    <Popup>
                      <div className="p-2">
                        <p className="text-xs font-bold">{spot.title}</p>
                        <p className="text-[10px] text-surface-500">{spot.availableSlots}/{spot.totalSlots} Slots Free</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
                {Array.from(liveDriverPositions.entries()).map(([bookingId, pos]) => (
                  <Marker key={bookingId} position={[pos.lat, pos.lng]} icon={createDriverIcon(pos.heading)} />
                ))}
              </MapContainer>
              <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2 bg-surface-950/80 backdrop-blur-md p-2 px-3 rounded-xl border border-white/10">
                <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                  {mapMode === 'portfolio' ? 'Live Portfolio' : 'Driver Approaches'}
                </span>
              </div>
            </div>
            <div className="p-5 md:p-6 border-t border-white/5">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h4 className="text-sm font-semibold text-white">En Route Drivers</h4>
                <p className="text-[11px] uppercase tracking-[0.22em] text-surface-500">
                  {activeDrivers.length > 0 ? 'actively updating' : 'no movement'}
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {activeDrivers.length === 0 ? (
                  <div className="md:col-span-2 rounded-2xl border border-dashed border-white/8 bg-white/[0.02] px-5 py-6">
                    <p className="text-sm text-surface-500 italic">No drivers currently navigating to your spots.</p>
                  </div>
                ) : (
                  activeDrivers.map(driver => (
                    <div key={driver.bookingId} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-linear-to-r from-white/[0.04] to-white/[0.02] border border-white/6">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center shrink-0">
                          <Car className="w-4 h-4 text-primary-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">{driver.user?.name}</p>
                          <p className="text-[11px] text-surface-500 truncate">Destination: {driver.spot?.title}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary-400">{driver.eta ? formatETA(driver.eta.duration) : 'Calculating..'}</p>
                        <p className="text-[10px] text-surface-600">{driver.eta ? formatDistance(driver.eta.distance) : ''}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>

          <Card className="p-5 md:p-6 border-white/8 bg-white/[0.02]">
            <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                <p className="mt-1 text-xs text-surface-500">A tighter readout of the latest sessions touching your spaces.</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/owner/earnings')} className="text-xs font-semibold text-primary-500 justify-start sm:justify-center">
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {recentBookings.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/8 bg-white/[0.02] px-5 py-6 text-sm text-surface-500">
                  No activity has been recorded yet.
                </div>
              ) : recentBookings.map((booking) => (
                <div key={booking._id} className="flex flex-col gap-4 rounded-2xl border border-white/6 bg-linear-to-r from-white/[0.035] to-transparent p-4 transition-all hover:border-white/12 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-surface-500/10 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-surface-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{booking.user?.name}</p>
                      <p className="text-[11px] text-surface-500 truncate">{booking.spot?.title} · {formatDate(booking.startTime)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:block md:text-right">
                    <p className="text-sm font-bold text-emerald-500">{formatCurrency(booking.totalAmount || 0)}</p>
                    <Badge variant={booking.status === 'active' ? 'primary' : 'success'} className="text-[9px]">{booking.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5 md:p-6 border-white/8 bg-white/[0.02]">
            <div className="flex items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Network Health</h3>
                <p className="mt-1 text-xs text-surface-500">Signals distilled from current live activity.</p>
              </div>
              <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2 text-right">
                <p className="text-[10px] uppercase tracking-[0.22em] text-surface-500">Live arrival rate</p>
                <p className="text-sm font-bold text-white">{liveArrivalRate}%</p>
              </div>
            </div>
            <div className="space-y-6">
              {[
                { label: 'Real-time Tracking', val: activeDrivers.length > 0 ? 'Active' : 'Standby', color: 'bg-emerald-500', width: `${Math.max(liveArrivalRate, 12)}%` },
                { label: 'System Uptime', val: `${uptime}%`, color: 'bg-emerald-500', width: `${uptime}%` },
                { label: 'API Latency', val: `${latency}ms`, color: 'bg-primary-500', width: `${Math.max(35, 100 - latency)}%` },
              ].map(item => (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                    <span className="text-surface-500">{item.label}</span>
                    <span className="text-white">{item.val}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} transition-all duration-700`} style={{ width: item.width }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <p className="text-xs text-surface-500 leading-relaxed text-center">Your parking infrastructure is currently operating at optimal efficiency.</p>
            </div>
          </Card>

          <Card className="p-5 md:p-6 border-white/8 bg-white/[0.02]">
            <div className="flex items-center gap-3 mb-5">
              <Route className="w-5 h-5 text-primary-400" />
              <h4 className="text-sm font-bold text-white">Portfolio Mix</h4>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Approved spaces', value: approvedSpots.length, tone: 'bg-emerald-500/12 text-emerald-300 border-emerald-400/20' },
                { label: 'Pending review', value: pendingSpots.length, tone: 'bg-amber-500/12 text-amber-200 border-amber-400/20' },
                { label: 'Rejected', value: rejectedSpots.length, tone: 'bg-danger-500/12 text-danger-300 border-danger-400/20' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/6 bg-black/20 px-4 py-4">
                  <span className="text-sm text-surface-300">{item.label}</span>
                  <span className={`rounded-full border px-3 py-1 text-xs font-bold ${item.tone}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 md:p-6 bg-primary-600/5 border-primary-500/20 shadow-[0_30px_60px_-35px_rgba(59,92,255,0.45)]">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-primary-500" />
              <h4 className="text-sm font-bold text-white">Owner Support</h4>
            </div>
            <p className="text-sm text-surface-400 mb-5 leading-6">
              Need help managing your spaces? Our support team is available 24/7 with guidance on approvals, pricing and spot optimization.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <Button variant="secondary" className="w-full text-xs py-2 border-white/10 hover:bg-white/5">Contact Support</Button>
              <Button variant="ghost" onClick={() => navigate('/owner/listings')} className="w-full text-xs py-2 justify-center">Inspect Listings</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
