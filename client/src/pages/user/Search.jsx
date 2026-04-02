import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { spotAPI } from '../../api';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import RoutingMachine from '../../components/map/RoutingMachine';
import { MapPin, Star, Navigation, List, Map as MapIcon, Filter, X, IndianRupee, ArrowLeft, Search as SearchIcon, SlidersHorizontal, ChevronRight, Activity, Cpu, Shield } from 'lucide-react';
import { formatCurrency, getDistance, formatDistance } from '../../lib/utils';
import toast from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// Fix leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createPriceIcon = (price, available) => {
  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="background:${available > 0 ? 'linear-gradient(135deg,#3b82f6,#8b5cf6)' : '#1e293b'};color:white;padding:6px 14px;border-radius:14px;font-size:12px;font-weight:900;font-family:Plus Jakarta Sans,sans-serif;white-space:nowrap;box-shadow:0 0 30px rgba(59,130,246,0.4);border:1px solid rgba(255,255,255,0.3)">₹${price}</div>`,
    iconSize: [64, 32],
    iconAnchor: [32, 32],
  });
};

const userIcon = L.divIcon({
  className: 'custom-icon',
  html: '<div style="width:24px;height:24px;background:#3b82f6;border-radius:50%;border:4px solid white;box-shadow:0 0 0 8px rgba(59,130,246,0.1),0 0 30px rgba(59,130,246,0.8)"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function MapUpdater({ center, isManual }) {
  const map = useMap();
  useEffect(() => {
    if (center && isManual) {
      map.flyTo(center, map.getZoom() < 14 ? 14 : map.getZoom(), { duration: 1.5 });
    }
  }, [center, isManual, map]);
  return null;
}

function MapEventHandler({ onMoveEnd }) {
  useMapEvents({
    moveend: (e) => {
      const center = e.target.getCenter();
      onMoveEnd([center.lat, center.lng]);
    }
  });
  return null;
}

export default function Search() {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([12.9716, 77.5946]); // Bangalore default
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('map');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ minPrice: '', maxPrice: '', radius: 5000 });
  const [isManual, setIsManual] = useState(true);
  const [routingTo, setRoutingTo] = useState(null);
  const searchTimeout = useRef(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const loc = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(loc);
        setIsManual(true);
        setMapCenter(loc);
      },
      () => { fetchSpots(mapCenter[0], mapCenter[1]); },
      { enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    if (mapCenter) fetchSpots(mapCenter[0], mapCenter[1]);
  }, [mapCenter]);

  const fetchSpots = async (lat, lng) => {
    setLoading(true);
    try {
      const params = { lat, lng, radius: filters.radius };
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      const { data } = await spotAPI.getNearby(params);
      const withDist = data.spots.map(s => ({
        ...s,
        distance: userLocation ? getDistance(userLocation[0], userLocation[1], s.location.coordinates[1], s.location.coordinates[0]) : null
      }));
      withDist.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      setSpots(withDist);
    } catch (err) {
      toast.error('Recalibration failed');
    }
    setLoading(false);
  };

  const handleGetDirections = (spot) => {
    const [lng, lat] = spot.location.coordinates;
    if (!userLocation) {
      toast.error('GPS Lock Required');
      return;
    }
    setIsManual(true);
    setRoutingTo([lat, lng]);
    setView('map');
  };

  const handleMoveEnd = (center) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setIsManual(false);
      setMapCenter(center);
    }, 500);
  };

  return (
    <div className="pt-28 h-screen flex flex-col bg-surface-950 selection:bg-primary-500 overflow-hidden relative">
      <div className="absolute inset-0 map-grid opacity-10 pointer-events-none" />

      {/* High-Fidelity Technical Top Bar */}
      <div className="relative z-[100] px-8 py-5 flex items-center justify-between gap-10 border-b border-white/5 bg-surface-950/80 backdrop-blur-3xl shadow-2xl">
        <div className="flex items-center gap-6">
           <div className="flex -space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-primary-600/20 border border-primary-500/30 flex items-center justify-center shadow-glow">
                 <Navigation className="w-6 h-6 text-primary-400 rotate-45" />
              </div>
              <div className="w-12 h-12 rounded-2xl bg-accent-600/10 border border-accent-500/20 flex items-center justify-center translate-y-2">
                 <Activity className="w-6 h-6 text-accent-500" />
              </div>
           </div>
           <div>
              <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none mb-1.5 flex items-center gap-3">
                 Infrastructure Scan
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </h1>
              <div className="flex items-center gap-4">
                 <span className="text-[10px] font-black text-surface-500 uppercase tracking-widest">{spots.length} Active Nodes Linked</span>
                 <div className="h-3 w-px bg-white/10" />
                 <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">Network: STABLE</span>
              </div>
           </div>
        </div>

        {routingTo && (
           <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
             onClick={() => setRoutingTo(null)} 
             className="px-6 py-3 rounded-2xl glass-dark border border-primary-500/40 text-primary-400 text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3 hover:bg-primary-500/10 transition-all shadow-glow"
           >
              <ArrowLeft className="w-4 h-4" /> Relinquish Path
           </motion.button>
        )}

        <div className="flex items-center gap-5">
           <button onClick={() => setShowFilters(!showFilters)} className={`p-4 rounded-2xl border transition-all ${showFilters ? 'bg-primary-500/20 border-primary-500/40 text-primary-400 shadow-glow' : 'border-white/10 text-surface-400 hover:bg-white/5'}`}>
              <Filter className="w-5 h-5" />
           </button>
           <div className="flex rounded-2xl glass-dark border border-white/10 p-1.5 shadow-2xl">
              <button onClick={() => setView('map')} className={`flex items-center gap-3 px-6 py-2.5 rounded-xl transition-all text-xs font-black uppercase tracking-widest ${view === 'map' ? 'bg-primary-600 text-white shadow-glow' : 'text-surface-500 hover:text-white'}`}>
                 <MapIcon className="w-4 h-4" /> Terminal
              </button>
              <button onClick={() => setView('list')} className={`flex items-center gap-3 px-6 py-2.5 rounded-xl transition-all text-xs font-black uppercase tracking-widest ${view === 'list' ? 'bg-primary-600 text-white shadow-glow' : 'text-surface-500 hover:text-white'}`}>
                 <List className="w-4 h-4" /> Telemetry
              </button>
           </div>
        </div>
      </div>

      {/* Immersive Search Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="relative z-50 px-8 py-5 border-b border-white/5 bg-surface-900/40 backdrop-blur-3xl flex items-center gap-10 overflow-hidden"
          >
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                   <IndianRupee className="w-5 h-5 text-primary-400" />
                </div>
                <div className="flex items-center gap-2">
                   <input type="number" placeholder="Min" value={filters.minPrice} onChange={e => setFilters({...filters, minPrice: e.target.value})}
                     className="w-28 h-12 px-5 rounded-2xl bg-white/[0.03] border border-white/10 text-white text-sm font-bold focus:ring-2 focus:ring-primary-500/30 outline-none" />
                   <span className="text-surface-600 font-black">→</span>
                   <input type="number" placeholder="Max" value={filters.maxPrice} onChange={e => setFilters({...filters, maxPrice: e.target.value})}
                     className="w-28 h-12 px-5 rounded-2xl bg-white/[0.03] border border-white/10 text-white text-sm font-bold focus:ring-2 focus:ring-primary-500/30 outline-none" />
                </div>
             </div>
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                   <Globe className="w-5 h-5 text-accent-400" />
                </div>
                <select value={filters.radius} onChange={e => setFilters({...filters, radius: e.target.value})}
                  className="h-12 px-6 rounded-2xl bg-white/[0.03] border border-white/10 text-white text-sm font-bold outline-none cursor-pointer hover:bg-white/10 transition-all">
                   <option value={2000} className="bg-surface-900">2 KM Range</option>
                   <option value={5000} className="bg-surface-900">5 KM Range</option>
                   <option value={10000} className="bg-surface-900">10 KM Range</option>
                </select>
             </div>
             <Button variant="primary" onClick={() => fetchSpots(mapCenter[0], mapCenter[1])} className="px-12 !rounded-2xl font-black uppercase tracking-[0.2em] shadow-glow flex items-center gap-3">
                <SearchIcon className="w-4 h-4" /> Refresh Scan
             </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex overflow-hidden">
        {/* Deep Black High-Contrast Map Wrapper */}
        <div className={`${view === 'map' ? 'flex-1' : 'hidden md:block md:w-1/2'} relative group overflow-hidden`}>
          <div className="absolute inset-0 z-10 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]" />
          <MapContainer center={mapCenter} zoom={14} className="h-full w-full dark-map-tiles" zoomControl={false}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapUpdater center={mapCenter} isManual={isManual} />
            <MapEventHandler onMoveEnd={handleMoveEnd} />
            
            {userLocation && <Marker position={userLocation} icon={userIcon} />}
            
            {routingTo && userLocation && (
              <RoutingMachine start={userLocation} end={routingTo} />
            )}
            
            {!routingTo && spots.map(spot => (
              <Marker
                key={spot._id}
                position={[spot.location.coordinates[1], spot.location.coordinates[0]]}
                icon={createPriceIcon(spot.pricePerHour, spot.availableSlots)}
                eventHandlers={{ click: () => navigate(`/spots/${spot._id}`) }}
              >
                <Popup className="tech-popup">
                   <div className="p-5 bg-surface-950 border border-white/10 rounded-3xl min-w-[280px] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/10 blur-2xl pointer-events-none" />
                    <h3 className="text-lg font-black text-white italic uppercase tracking-tighter leading-none mb-2">{spot.title}</h3>
                    <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest leading-none mb-4 line-clamp-1 opacity-80">{spot.address}</p>
                    
                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                      <div className="flex flex-col gap-1">
                         <span className="text-[9px] font-black text-surface-400 uppercase tracking-widest opacity-60">Rate_H</span>
                         <span className="text-primary-400 font-black text-base italic tracking-tighter">₹{spot.pricePerHour}</span>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                         <span className="text-[9px] font-black text-surface-400 uppercase tracking-widest opacity-60">Infrastructure</span>
                         <Badge variant={spot.availableSlots > 0 ? 'success' : 'danger'} className="!rounded-lg px-2 text-[10px] font-black uppercase text-glow">
                           {spot.availableSlots} SLOTS
                         </Badge>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-5">
                      <button onClick={() => navigate(`/spots/${spot._id}`)} className="flex-1 text-[11px] font-black bg-primary-600 text-white py-3 rounded-2xl hover:shadow-glow transition-all uppercase tracking-widest">
                         Initialize Node
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleGetDirections(spot); }} className="flex items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white">
                        <Navigation className="w-5 h-5 rotate-45" />
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          
          <div className="absolute bottom-8 right-8 z-[1000] flex flex-col gap-4">
             <button onClick={() => {
                 setIsManual(true);
                 setMapCenter(userLocation || [12.9716, 77.5946]);
               }}
               className="p-5 glass-dark rounded-[1.5rem] border border-white/20 shadow-glow text-primary-400 hover:text-white transition-all transform hover:scale-110 active:scale-95">
               <Navigation className="w-7 h-7" />
             </button>
          </div>
        </div>

        {/* Telemetry Sidebar: High-Visibility Result Stream */}
        <div className={`${view === 'list' ? 'flex-1' : 'hidden md:block md:w-[480px]'} bg-surface-950 border-l border-white/5 overflow-y-auto custom-scrollbar relative z-20`}>
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between px-2">
               <h4 className="text-[10px] font-black text-surface-400 uppercase tracking-[0.5em] opacity-60">System Results</h4>
               <div className="flex items-center gap-2 text-[10px] font-black text-primary-500 uppercase tracking-widest">
                  Live Feed <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-ping" />
               </div>
            </div>

            {spots.length === 0 && !loading && (
              <div className="text-center py-32 px-10 glass-dark border border-white/5 rounded-[3rem] relative overflow-hidden">
                 <div className="absolute inset-0 bg-primary-500/5 opacity-20 pointer-events-none animate-pulse" />
                 <div className="w-24 h-24 rounded-[2rem] bg-white/5 flex items-center justify-center mx-auto mb-8 border border-white/10">
                    <Shield className="w-10 h-10 text-surface-400 opacity-60" />
                 </div>
                 <p className="text-2xl font-black text-white italic uppercase tracking-tighter">Infrastructural Void</p>
                 <p className="text-sm font-medium text-surface-400 mt-3 leading-relaxed opacity-70">No active nodes detected in current coordinate range.</p>
                 <Button variant="outline" className="mt-10 !rounded-2xl w-full text-xs font-black py-4 uppercase tracking-widest border-primary-500/20 text-primary-400" onClick={() => setFilters({...filters, radius: 20000})}>Authorize Wider Scan</Button>
              </div>
            )}
            
            <div className="grid gap-6">
               {spots.map((spot, i) => (
                 <motion.div key={spot._id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                   onClick={() => navigate(`/spots/${spot._id}`)} 
                   className="group cursor-pointer glass-dark rounded-[2.5rem] border border-white/5 hover:border-primary-500/30 transition-all p-7 hover:bg-white/[0.02] relative overflow-hidden"
                 >
                   <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/[0.03] blur-3xl group-hover:bg-primary-500/[0.08] transition-all" />

                   <div className="flex justify-between items-start relative z-10">
                     <div className="flex-1 min-w-0 pr-6">
                       <h3 className="text-xl font-black text-white italic uppercase tracking-tighter truncate group-hover:text-primary-400 transition-colors leading-none mb-2">{spot.title}</h3>
                       <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-primary-600" />
                          <p className="text-[10px] font-black text-surface-400 tracking-widest uppercase truncate opacity-80">{spot.address}</p>
                       </div>
                     </div>
                     <Badge variant={spot.availableSlots > 0 ? 'success' : 'danger'} className="!rounded-xl px-4 py-1.5 font-black uppercase text-[10px] border-none shadow-glow">
                       {spot.availableSlots} UNITS
                     </Badge>
                   </div>

                   <div className="grid grid-cols-2 gap-8 py-6 my-6 border-y border-white/5 relative z-10">
                      <div className="space-y-2">
                         <div className="flex items-center gap-1.5 grayscale opacity-50">
                            <IndianRupee className="w-3 h-3 text-white" />
                            <p className="text-[9px] font-black text-surface-400 uppercase tracking-widest opacity-60">Rate Per Cycle</p>
                         </div>
                         <p className="text-2xl font-black text-primary-400 italic tracking-tighter">₹{spot.pricePerHour}</p>
                      </div>
                      <div className="space-y-2 text-right">
                         <div className="flex items-center gap-1.5 justify-end grayscale opacity-50">
                            <Navigation className="w-3 h-3 text-white rotate-45" />
                            <p className="text-[9px] font-black text-surface-400 uppercase tracking-widest opacity-60">Calculated Proximity</p>
                         </div>
                         <p className="text-2xl font-black text-white italic tracking-tighter">{spot.distance !== null ? formatDistance(spot.distance) : '---'}</p>
                      </div>
                   </div>

                   <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-4">
                         {spot.averageRating > 0 && (
                           <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-warning-500/10 border border-warning-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                             <Star className="w-3.5 h-3.5 fill-warning-400 text-warning-400" />
                             <span className="text-xs font-black text-warning-500">{spot.averageRating}</span>
                           </div>
                         )}
                         <div className="flex -space-x-3">
                           {[1,2,3].map(j => (
                             <div key={j} className="w-8 h-8 rounded-full border-2 border-surface-950 bg-surface-900 flex items-center justify-center overflow-hidden">
                               <img src={`https://i.pravatar.cc/100?img=${j+30}`} alt="User" />
                             </div>
                           ))}
                         </div>
                      </div>
                      <Button size="sm" variant="ghost" className="!rounded-2xl group-hover:bg-primary-600 group-hover:text-white transition-all text-xs font-black uppercase tracking-[0.2em] px-8 py-5 border border-white/5" onClick={(e) => { e.stopPropagation(); handleGetDirections(spot); }}>
                         Execute Path <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                   </div>
                 </motion.div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
