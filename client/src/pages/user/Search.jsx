import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { spotAPI } from '../../api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { MapPin, Star, Navigation, List, Map as MapIcon, Filter, X, IndianRupee } from 'lucide-react';
import { formatCurrency, getDistance, formatDistance } from '../../lib/utils';
import toast from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';

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
    html: `<div style="background:${available > 0 ? 'linear-gradient(135deg,#3b82f6,#8b5cf6)' : '#94a3b8'};color:white;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:700;font-family:Inter,sans-serif;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.2);border:2px solid white">₹${price}/h</div>`,
    iconSize: [60, 28],
    iconAnchor: [30, 28],
  });
};

const userIcon = L.divIcon({
  className: 'custom-icon',
  html: '<div style="width:16px;height:16px;background:#3b82f6;border-radius:50%;border:3px solid white;box-shadow:0 0 0 3px rgba(59,130,246,0.3),0 2px 8px rgba(0,0,0,0.2)"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 14, { duration: 1.5 });
  }, [center, map]);
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
  const searchTimeout = useRef(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const loc = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(loc);
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
      toast.error('Failed to load spots');
    }
    setLoading(false);
  };

  const handleMoveEnd = (center) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setMapCenter(center);
    }, 500);
  };

  return (
    <div className="pt-16 h-screen flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-surface-100 px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary-500" />
          <h1 className="font-semibold text-surface-800">Find Parking</h1>
          <Badge variant="primary">{spots.length} spots</Badge>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowFilters(!showFilters)} className={`p-2 rounded-lg transition-all ${showFilters ? 'bg-primary-100 text-primary-600' : 'text-surface-400 hover:bg-surface-100'}`}>
            <Filter className="w-4 h-4" />
          </button>
          <div className="flex rounded-lg bg-surface-100 p-0.5">
            <button onClick={() => setView('map')} className={`p-2 rounded-md transition-all ${view === 'map' ? 'bg-white shadow-sm text-primary-600' : 'text-surface-400'}`}>
              <MapIcon className="w-4 h-4" />
            </button>
            <button onClick={() => setView('list')} className={`p-2 rounded-md transition-all ${view === 'list' ? 'bg-white shadow-sm text-primary-600' : 'text-surface-400'}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border-b border-surface-100 px-4 py-3 flex items-center gap-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-surface-400" />
            <input type="number" placeholder="Min ₹" value={filters.minPrice} onChange={e => setFilters({...filters, minPrice: e.target.value})}
              className="w-20 text-sm px-3 py-1.5 rounded-lg border border-surface-200 focus:ring-2 focus:ring-primary-500/30 outline-none" />
            <span className="text-surface-400">—</span>
            <input type="number" placeholder="Max ₹" value={filters.maxPrice} onChange={e => setFilters({...filters, maxPrice: e.target.value})}
              className="w-20 text-sm px-3 py-1.5 rounded-lg border border-surface-200 focus:ring-2 focus:ring-primary-500/30 outline-none" />
          </div>
          <select value={filters.radius} onChange={e => setFilters({...filters, radius: e.target.value})}
            className="text-sm px-3 py-1.5 rounded-lg border border-surface-200 outline-none">
            <option value={2000}>2 km</option>
            <option value={5000}>5 km</option>
            <option value={10000}>10 km</option>
            <option value={20000}>20 km</option>
          </select>
          <Button size="sm" onClick={() => fetchSpots(mapCenter[0], mapCenter[1])}>Apply</Button>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        <div className={`${view === 'map' ? 'flex-1' : 'hidden md:block md:w-1/2'} relative`}>
          <MapContainer center={mapCenter} zoom={14} className="h-full w-full" zoomControl={false}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapUpdater center={mapCenter} />
            <MapEventHandler onMoveEnd={handleMoveEnd} />
            
            {userLocation && <Marker position={userLocation} icon={userIcon} />}
            
            {spots.map(spot => (
              <Marker
                key={spot._id}
                position={[spot.location.coordinates[1], spot.location.coordinates[0]]}
                icon={createPriceIcon(spot.pricePerHour, spot.availableSlots)}
                eventHandlers={{ click: () => navigate(`/spots/${spot._id}`) }}
              >
                <Popup>
                  <div className="p-3 min-w-[200px]">
                    <h3 className="font-semibold text-surface-800 text-sm">{spot.title}</h3>
                    <p className="text-xs text-surface-500 mt-1">{spot.address}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-primary-600 font-bold text-sm">{formatCurrency(spot.pricePerHour)}/hr</span>
                      <Badge variant={spot.availableSlots > 0 ? 'success' : 'danger'}>
                        {spot.availableSlots} slots
                      </Badge>
                    </div>
                    <button onClick={() => navigate(`/spots/${spot._id}`)} className="w-full mt-2 text-xs bg-primary-600 text-white py-1.5 rounded-lg hover:bg-primary-700 transition-colors">
                      View Details
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          
          {userLocation && (
            <button onClick={() => setMapCenter(userLocation)}
              className="absolute bottom-6 right-4 z-[1000] p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
              <Navigation className="w-5 h-5 text-primary-600" />
            </button>
          )}
        </div>

        {/* List view */}
        <div className={`${view === 'list' ? 'flex-1' : 'hidden md:block md:w-96'} bg-surface-50 overflow-y-auto border-l border-surface-100`}>
          <div className="p-4 space-y-3">
            {spots.length === 0 && !loading && (
              <div className="text-center py-12 text-surface-400">
                <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No parking spots found nearby</p>
                <p className="text-sm mt-1">Try expanding your search area</p>
              </div>
            )}
            {spots.map((spot, i) => (
              <Card key={spot._id} hover onClick={() => navigate(`/spots/${spot._id}`)} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-surface-800 truncate">{spot.title}</h3>
                      <p className="text-xs text-surface-500 mt-0.5 truncate">{spot.address}</p>
                    </div>
                    <Badge variant={spot.availableSlots > 0 ? 'success' : 'danger'} className="ml-2 shrink-0">
                      {spot.availableSlots}/{spot.totalSlots}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-lg font-bold text-primary-600">{formatCurrency(spot.pricePerHour)}<span className="text-xs font-normal text-surface-400">/hr</span></span>
                    <div className="flex items-center gap-3 text-xs text-surface-500">
                      {spot.averageRating > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-warning-400 text-warning-400" />
                          {spot.averageRating}
                        </span>
                      )}
                      {spot.distance !== null && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {formatDistance(spot.distance)}
                        </span>
                      )}
                    </div>
                  </div>
                  {spot.amenities?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {spot.amenities.slice(0, 3).map(a => (
                        <span key={a} className="text-[10px] px-2 py-0.5 bg-surface-100 text-surface-500 rounded-full">{a}</span>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
