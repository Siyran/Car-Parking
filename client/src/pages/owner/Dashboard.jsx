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
  Calendar, Clock, Navigation, Activity, Shield, Radio, Car, TrendingUp, DollarSign
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
    { label: 'Total Spaces', value: stats.totalSpots, icon: MapPin, color: 'text-primary-400', bg: 'bg-primary-500/10' },
    { label: 'Active Sessions', value: stats.activeBookings, icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Total Earnings', value: formatCurrency(stats.totalEarnings), icon: DollarSign, color: 'text-accent-400', bg: 'bg-accent-500/10' }
  ];

  const mapCenter = ownerSpots.length > 0 ? [ownerSpots[0].location.coordinates[1], ownerSpots[0].location.coordinates[0]] : [34.0837, 74.7973];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-surface-500 text-sm mt-1">Monitor your parking network in real-time</p>
        </div>
        <Button onClick={() => navigate('/owner/add-spot')} className="gap-2">
          <Plus className="w-4 h-4" /> Add New Space
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.label} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <TrendingUp className="w-4 h-4 text-surface-600" />
            </div>
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-3xl font-bold text-white mt-1">{stat.value}</h3>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="overflow-hidden p-0">
            <div className="h-[400px] relative">
              <MapContainer center={mapCenter} zoom={14} className="h-full w-full dark-map-tiles" zoomControl={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {ownerSpots.map(spot => (
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
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Live Map</span>
              </div>
            </div>
            <div className="p-6 border-t border-white/5">
              <h4 className="text-sm font-semibold text-white mb-4">En Route Drivers</h4>
              <div className="space-y-3">
                {activeDrivers.length === 0 ? (
                  <p className="text-xs text-surface-500 italic">No drivers currently navigating to your spots.</p>
                ) : (
                  activeDrivers.map(driver => (
                    <div key={driver.bookingId} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
                          <Car className="w-4 h-4 text-primary-400" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{driver.user?.name}</p>
                          <p className="text-[10px] text-surface-500">Destination: {driver.spot?.title}</p>
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

          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/owner/earnings')} className="text-xs font-semibold text-primary-500">View All</Button>
            </div>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking._id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-surface-500/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-surface-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{booking.user?.name}</p>
                      <p className="text-[11px] text-surface-500">{booking.spot?.title} · {formatDate(booking.startTime)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-500">{formatCurrency(booking.totalAmount || 0)}</p>
                    <Badge variant={booking.status === 'active' ? 'primary' : 'success'} className="text-[9px]">{booking.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Network Health</h3>
            <div className="space-y-6">
              {[
                { label: 'Real-time Tracking', val: activeDrivers.length > 0 ? 'Active' : 'Standby', color: 'bg-emerald-500' },
                { label: 'System Uptime', val: '99.9%', color: 'bg-emerald-500' },
                { label: 'API Latency', val: '24ms', color: 'bg-primary-500' },
              ].map(item => (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                    <span className="text-surface-500">{item.label}</span>
                    <span className="text-white">{item.val}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: '100%' }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <p className="text-xs text-surface-500 leading-relaxed text-center">Your parking infrastructure is currently operating at optimal efficiency.</p>
            </div>
          </Card>

          <Card className="p-6 bg-primary-600/5 border-primary-500/20">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-primary-500" />
              <h4 className="text-sm font-bold text-white">Owner Support</h4>
            </div>
            <p className="text-xs text-surface-400 mb-4">Need help managing your spaces? Our support team is available 24/7.</p>
            <Button variant="secondary" className="w-full text-xs py-2 border-white/10 hover:bg-white/5">Contact Support</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
