import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { spotAPI } from '../../api';
import { useSocket } from '../../context/SocketContext';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import RoutingMachine from '../../components/map/RoutingMachine';
import LiveTrackingMap from '../../components/map/LiveTrackingMap';
import { MapPin, Star, Navigation, List, Map as MapIcon, Filter, X, IndianRupee, ArrowLeft, Search as SearchIcon, SlidersHorizontal, ChevronRight, Activity, Cpu, Shield, Radio, Globe } from 'lucide-react';
import { formatCurrency, getDistance, formatDistance, formatETA } from '../../lib/utils';
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

// Animated user location icon with pulse
const createUserIcon = () => {
  return L.divIcon({
    className: 'custom-icon',
    html: `
      <div style="position:relative;width:32px;height:32px;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;width:32px;height:32px;background:rgba(59,130,246,0.15);border-radius:50%;animation:userPulse 2s ease-in-out infinite;"></div>
        <div style="width:18px;height:18px;background:#3b82f6;border-radius:50%;border:3px solid white;box-shadow:0 0 20px rgba(59,130,246,0.6);z-index:1;"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

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

// ─── Smooth user marker that animates position changes ───
function AnimatedUserMarker({ position }) {
  const markerRef = useRef(null);
  const prevPos = useRef(position);

  useEffect(() => {
    if (!markerRef.current || !position) return;

    const start = prevPos.current || position;
    const startTime = performance.now();
    const duration = 1000;
    let frameId;

    const animate = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const lat = start[0] + (position[0] - start[0]) * eased;
      const lng = start[1] + (position[1] - start[1]) * eased;

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      }

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
        prevPos.current = position;
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => { if (frameId) cancelAnimationFrame(frameId); };
  }, [position]);

  if (!position) return null;

  return (
    <Marker
      ref={markerRef}
      position={position}
      icon={createUserIcon()}
    />
  );
}

export default function Search() {
  const navigate = useNavigate();
  const { onSpotUpdate } = useSocket();
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([34.0837, 74.7973]); // Srinagar default
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('map');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ minPrice: '', maxPrice: '', radius: 5000 });
  const [isManual, setIsManual] = useState(true);
  const [routingTo, setRoutingTo] = useState(null);
  const [routingSpot, setRoutingSpot] = useState(null);
  const [showLiveNav, setShowLiveNav] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const searchTimeout = useRef(null);
  const watchIdRef = useRef(null);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `@keyframes userPulse { 0%,100% { transform:scale(1); opacity:0.5; } 50% { transform:scale(1.8); opacity:0.1; } }`;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(loc);
        setIsManual(true);
        setMapCenter(loc);
      },
      () => {},
      { enableHighAccuracy: true }
    );

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
    );
    watchIdRef.current = id;

    return () => {
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  useEffect(() => {
    const unsub = onSpotUpdate((data) => {
      setSpots(prev => prev.map(s =>
        s._id === data.spotId ? { ...s, availableSlots: data.availableSlots } : s
      ));
    });
    return unsub;
  }, [onSpotUpdate]);

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
      toast.error(`Search failed: ${err.message}`);
    }
    setLoading(false);
  };

  const requestUserLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = [pos.coords.latitude, pos.coords.longitude];
          setUserLocation(loc);
          resolve(loc);
        },
        (err) => {
          toast.error('GPS Lock Failed');
          reject(err);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  };

  const handleGetDirections = async (spot) => {
    const [lng, lat] = spot.location.coordinates;
    let currentPos = userLocation;
    if (!currentPos) {
      try {
        currentPos = await requestUserLocation();
      } catch (err) {
        return;
      }
    }
    setIsManual(true);
    setRoutingTo([lat, lng]);
    setRoutingSpot(spot);
    setView('map');
  };

  const handleOpenLiveNav = () => {
    if (!routingSpot) return;
    setShowLiveNav(true);
  };

  const handleMoveEnd = (center) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setIsManual(false);
      setMapCenter(center);
    }, 500);
  };

  return (
    <div className="pt-24 h-screen flex flex-col bg-surface-950 overflow-hidden relative font-sans">
      <div className="absolute inset-0 map-grid opacity-5 pointer-events-none" />

      {showLiveNav && routingSpot && (
        <LiveTrackingMap
          destination={{
            lat: routingSpot.location.coordinates[1],
            lng: routingSpot.location.coordinates[0],
            title: routingSpot.title,
            address: routingSpot.address
          }}
          onClose={() => setShowLiveNav(false)}
          initialPosition={userLocation ? { lat: userLocation[0], lng: userLocation[1] } : null}
          isNavigating={true}
        />
      )}

      {/* Modern Top Bar */}
      <div className="relative z-40 px-8 py-4 flex items-center justify-between border-b border-white/5 bg-surface-950/80 backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 rounded-xl bg-primary-600/10 border border-primary-500/20 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white tracking-tight leading-tight">Nearby Parking</h1>
            <p className="text-[10px] font-medium text-surface-500 uppercase tracking-widest">{spots.length} spaces discovered</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {routingTo && (
            <div className="flex items-center gap-2 mr-4">
              <Button size="sm" onClick={handleOpenLiveNav} className="h-9 px-4 rounded-lg bg-primary-600 text-white text-[11px] font-semibold uppercase tracking-wider flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 animate-pulse" /> Live Track
              </Button>
              <Button size="sm" variant="secondary" onClick={() => { setRoutingTo(null); setRoutingSpot(null); setRouteInfo(null); }} className="h-9 px-4 rounded-lg text-[11px] font-semibold uppercase tracking-wider">
                Cancel
              </Button>
            </div>
          )}

          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
            <button onClick={() => setView('map')} className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${view === 'map' ? 'bg-white/10 text-white' : 'text-surface-500 hover:text-white'}`}>Map</button>
            <button onClick={() => setView('list')} className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${view === 'list' ? 'bg-white/10 text-white' : 'text-surface-500 hover:text-white'}`}>List</button>
          </div>
          
          <button onClick={() => setShowFilters(!showFilters)} className={`p-2.5 rounded-xl border transition-all ${showFilters ? 'bg-primary-500/10 border-primary-500/20 text-primary-400' : 'border-white/10 text-surface-400 hover:bg-white/5'}`}>
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Simplified Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="relative z-30 px-8 py-4 border-b border-white/5 bg-surface-900/40 backdrop-blur-xl flex items-center gap-6"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-surface-500">Price Range</span>
              <div className="flex items-center gap-2">
                <input type="number" placeholder="Min" value={filters.minPrice} onChange={e => setFilters({...filters, minPrice: e.target.value})}
                  className="w-20 h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-primary-500/50 transition-all" />
                <span className="text-surface-600">-</span>
                <input type="number" placeholder="Max" value={filters.maxPrice} onChange={e => setFilters({...filters, maxPrice: e.target.value})}
                  className="w-20 h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-primary-500/50 transition-all" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-surface-500">Radius</span>
              <select value={filters.radius} onChange={e => setFilters({...filters, radius: e.target.value})}
                className="h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none cursor-pointer">
                <option value={2000} className="bg-surface-900">2 KM</option>
                <option value={5000} className="bg-surface-900">5 KM</option>
                <option value={10000} className="bg-surface-900">10 KM</option>
              </select>
            </div>
            <Button size="sm" onClick={() => fetchSpots(mapCenter[0], mapCenter[1])} className="h-9 rounded-lg">Apply</Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex overflow-hidden">
        {/* Map Area */}
        <div className={`${view === 'map' ? 'flex-1' : 'hidden md:block md:w-1/2'} relative`}>
          <MapContainer center={mapCenter} zoom={14} className="h-full w-full dark-map-tiles" zoomControl={false}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapUpdater center={mapCenter} isManual={isManual} />
            <MapEventHandler onMoveEnd={handleMoveEnd} />
            {userLocation && <AnimatedUserMarker position={userLocation} />}
            {routingTo && userLocation && (
              <RoutingMachine
                start={userLocation}
                end={routingTo}
                onRouteFound={(route) => {
                  if (route?.summary) setRouteInfo({ totalTime: route.summary.totalTime || 0, totalDistance: route.summary.totalDistance || 0 });
                }}
              />
            )}
            {!routingTo && spots.map(spot => (
              <Marker
                key={spot._id}
                position={[spot.location.coordinates[1], spot.location.coordinates[0]]}
                icon={createPriceIcon(spot.pricePerHour, spot.availableSlots)}
                eventHandlers={{ click: () => navigate(`/spots/${spot._id}`) }}
              >
                <Popup className="tech-popup">
                  <div className="p-4 bg-surface-950 border border-white/10 rounded-2xl min-w-[240px] shadow-2xl">
                    <h3 className="text-sm font-semibold text-white mb-1">{spot.title}</h3>
                    <p className="text-[10px] text-surface-500 mb-3 line-clamp-1">{spot.address}</p>
                    <div className="flex justify-between items-center py-3 border-y border-white/5 mb-3">
                      <span className="text-primary-400 font-bold">₹{spot.pricePerHour}<span className="text-[10px] font-medium text-surface-500 ml-1">/hr</span></span>
                      <Badge variant={spot.availableSlots > 0 ? 'success' : 'danger'}>{spot.availableSlots} Left</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 h-9 rounded-lg text-[11px]" onClick={() => navigate(`/spots/${spot._id}`)}>View Details</Button>
                      <button onClick={(e) => { e.stopPropagation(); handleGetDirections(spot); }} className="p-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10"><Navigation className="w-4 h-4" /></button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          
          <button onClick={() => { setIsManual(true); setMapCenter(userLocation || [34.0837, 74.7973]); }}
            className="absolute bottom-6 right-6 z-20 p-3.5 glass-dark rounded-xl border border-white/10 text-primary-400 hover:text-white transition-all shadow-xl">
            <Navigation className="w-6 h-6" />
          </button>
        </div>

        {/* List / Telemetry Sidebar */}
        <div className={`${view === 'list' ? 'flex-1' : 'hidden md:block md:w-[420px]'} bg-surface-950 border-l border-white/5 overflow-y-auto custom-scrollbar`}>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-surface-500 uppercase tracking-widest">Available Spots</span>
              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-primary-500 uppercase tracking-widest">
                Live <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
              </span>
            </div>

            {spots.map((spot) => (
              <Card key={spot._id} hover onClick={() => navigate(`/spots/${spot._id}`)} className="p-5 border-white/5 hover:bg-white/[0.02]">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="text-base font-semibold text-white truncate">{spot.title}</h3>
                    <div className="flex items-center gap-1.5 mt-1 opacity-60">
                      <MapPin className="w-3 h-3" />
                      <p className="text-[10px] text-surface-400 truncate">{spot.address}</p>
                    </div>
                  </div>
                  <Badge variant={spot.availableSlots > 0 ? 'success' : 'danger'}>{spot.availableSlots} Slots</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5 my-4">
                  <div>
                    <p className="text-[9px] text-surface-500 uppercase tracking-wider mb-1">Hourly Rate</p>
                    <p className="text-lg font-bold text-primary-400">₹{spot.pricePerHour}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-surface-500 uppercase tracking-wider mb-1">Distance</p>
                    <p className="text-lg font-bold text-white">{spot.distance !== null ? formatDistance(spot.distance) : '---'}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {spot.averageRating > 0 && (
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-warning-500/10 border border-warning-500/20">
                        <Star className="w-3 h-3 fill-warning-400 text-warning-400" />
                        <span className="text-[11px] font-bold text-warning-500">{spot.averageRating}</span>
                      </div>
                    )}
                  </div>
                  <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleGetDirections(spot); }} className="h-8 px-4 rounded-lg text-[10px] font-semibold uppercase tracking-wider">
                    Get Directions <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
