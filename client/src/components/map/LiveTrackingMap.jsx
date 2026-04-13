import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, Clock, Gauge, MapPin, Radio, X, ChevronUp } from 'lucide-react';
import { formatETA, formatDistance, formatSpeed, interpolatePosition, calculateBearing } from '../../lib/utils';
import 'leaflet/dist/leaflet.css';

// ─── Animated Car Icon (rotates based on heading) ───
const createCarIcon = (heading = 0) => {
  return L.divIcon({
    className: 'car-marker-icon',
    html: `
      <div style="
        transform: rotate(${heading}deg);
        transition: transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1);
        width: 48px; height: 48px;
        display: flex; align-items: center; justify-content: center;
        filter: drop-shadow(0 0 20px rgba(59,130,246,0.6));
      ">
        <div style="
          width: 40px; height: 40px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid rgba(255,255,255,0.9);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 30px rgba(59,130,246,0.5), inset 0 0 10px rgba(255,255,255,0.2);
        ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white" style="transform: rotate(45deg);">
            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
};

// ─── Pulsing Destination Icon ───
const destinationIcon = L.divIcon({
  className: 'destination-marker-icon',
  html: `
    <div style="position: relative; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center;">
      <div style="
        position: absolute; width: 56px; height: 56px; border-radius: 50%;
        background: rgba(16,185,129,0.15); border: 2px solid rgba(16,185,129,0.3);
        animation: destinationPulse 2s ease-in-out infinite;
      "></div>
      <div style="
        width: 28px; height: 28px; border-radius: 50%;
        background: linear-gradient(135deg, #10b981, #059669);
        border: 3px solid white;
        box-shadow: 0 0 30px rgba(16,185,129,0.6);
        display: flex; align-items: center; justify-content: center;
        z-index: 1;
      ">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>
    </div>
  `,
  iconSize: [56, 56],
  iconAnchor: [28, 28],
});

// ─── Map auto-fit component ───
function MapFitter({ driverPos, destination }) {
  const map = useMap();
  const fittedRef = useRef(false);

  useEffect(() => {
    if (driverPos && destination && !fittedRef.current) {
      const bounds = L.latLngBounds(
        [driverPos.lat, driverPos.lng],
        [destination.lat, destination.lng]
      );
      map.fitBounds(bounds.pad(0.3), { duration: 1.5 });
      fittedRef.current = true;
    }
  }, [driverPos, destination, map]);

  return null;
}

// ─── Smooth marker updater ───
function AnimatedMarker({ position, heading }) {
  const map = useMap();
  const markerRef = useRef(null);
  const prevPos = useRef(position);
  const animFrame = useRef(null);

  useEffect(() => {
    if (!markerRef.current || !position) return;

    const startPos = prevPos.current || position;
    const startTime = performance.now();
    const duration = 800; // ms

    const animate = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const interp = interpolatePosition(startPos, position, eased);

      if (markerRef.current) {
        markerRef.current.setLatLng([interp.lat, interp.lng]);
        markerRef.current.setIcon(createCarIcon(heading));
      }

      if (progress < 1) {
        animFrame.current = requestAnimationFrame(animate);
      } else {
        prevPos.current = position;
      }
    };

    if (animFrame.current) cancelAnimationFrame(animFrame.current);
    animFrame.current = requestAnimationFrame(animate);

    return () => {
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, [position, heading]);

  if (!position) return null;

  return (
    <Marker
      ref={markerRef}
      position={[position.lat, position.lng]}
      icon={createCarIcon(heading)}
    />
  );
}

// ─── Main LiveTrackingMap Component ───
export default function LiveTrackingMap({
  destination,          // { lat, lng, title, address }
  onClose,              // callback when user closes tracker
  initialPosition,      // { lat, lng } starting position
  bookingId,            // for socket subscription
  spotId,               // for socket events
  isNavigating = false, // true when just navigating (no booking yet)
}) {
  const [driverPos, setDriverPos] = useState(initialPosition || null);
  const [heading, setHeading] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [eta, setEta] = useState(null);       // { duration, distance }
  const [routeLine, setRouteLine] = useState([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [gpsActive, setGpsActive] = useState(false);
  const watchIdRef = useRef(null);
  const etaTimerRef = useRef(null);
  const lastETAFetch = useRef(0);

  // ─── Start GPS watch for live position ───
  useEffect(() => {
    if (!navigator.geolocation) return;

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, heading: h, speed: s } = pos.coords;
        const newPos = { lat: latitude, lng: longitude };

        setDriverPos(prev => {
          if (prev) {
            const bearing = calculateBearing(prev, newPos);
            setHeading(h || bearing);
          }
          return newPos;
        });

        setSpeed(s || 0);
        setGpsActive(true);

        // Fetch ETA every 5 seconds (throttled)
        const now = Date.now();
        if (destination && now - lastETAFetch.current > 5000) {
          lastETAFetch.current = now;
          fetchETA(latitude, longitude);
        }
      },
      (err) => {
        console.warn('GPS error:', err.message);
        setGpsActive(false);
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );

    watchIdRef.current = id;

    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [destination]);

  // ─── Fetch ETA from OSRM directly (client-side for navigation mode) ───
  const fetchETA = useCallback(async (lat, lng) => {
    if (!destination) return;
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${lng},${lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.code === 'Ok' && data.routes?.[0]) {
        const route = data.routes[0];
        setEta({ duration: Math.round(route.duration), distance: Math.round(route.distance) });

        // Convert GeoJSON to Leaflet format [lat, lng]
        if (route.geometry?.coordinates) {
          setRouteLine(route.geometry.coordinates.map(c => [c[1], c[0]]));
        }
      }
    } catch (err) {
      console.warn('ETA fetch error:', err.message);
    }
  }, [destination]);

  // Initial ETA fetch
  useEffect(() => {
    if (driverPos && destination) {
      fetchETA(driverPos.lat, driverPos.lng);
    }
  }, [destination]);

  // ─── Countdown timer for ETA ───
  useEffect(() => {
    if (!eta?.duration) return;

    etaTimerRef.current = setInterval(() => {
      setEta(prev => {
        if (!prev || prev.duration <= 0) return prev;
        return { ...prev, duration: prev.duration - 1 };
      });
    }, 1000);

    return () => {
      if (etaTimerRef.current) clearInterval(etaTimerRef.current);
    };
  }, [eta?.distance]); // Reset countdown when distance changes (new OSRM response)

  if (!destination) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-[9999] flex flex-col bg-surface-950"
      >
        {/* ─── Inject keyframes ─── */}
        <style>{`
          @keyframes destinationPulse {
            0%, 100% { transform: scale(1); opacity: 0.6; }
            50% { transform: scale(1.4); opacity: 0.2; }
          }
          @keyframes etaGlow {
            0%, 100% { text-shadow: 0 0 20px rgba(59,130,246,0.4); }
            50% { text-shadow: 0 0 40px rgba(59,130,246,0.8); }
          }
        `}</style>

        {/* ─── Map ─── */}
        <div className="flex-1 relative">
          <div className="absolute inset-0 z-10 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.7)]" />

          <MapContainer
            center={driverPos ? [driverPos.lat, driverPos.lng] : [destination.lat, destination.lng]}
            zoom={15}
            className="h-full w-full dark-map-tiles"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapFitter driverPos={driverPos} destination={destination} />

            {/* Route line */}
            {routeLine.length > 0 && (
              <Polyline
                positions={routeLine}
                pathOptions={{
                  color: '#3b82f6',
                  weight: 5,
                  opacity: 0.8,
                  dashArray: null,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
            )}

            {/* Animated driver marker */}
            {driverPos && (
              <AnimatedMarker position={driverPos} heading={heading} />
            )}

            {/* Destination marker */}
            <Marker
              position={[destination.lat, destination.lng]}
              icon={destinationIcon}
            />
          </MapContainer>

          {/* ─── Close button ─── */}
          <button
            onClick={onClose}
            className="absolute top-6 left-6 z-[1000] w-12 h-12 rounded-2xl glass-dark border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-all shadow-2xl"
          >
            <X className="w-6 h-6" />
          </button>

          {/* ─── GPS status indicator ─── */}
          <div className="absolute top-6 right-6 z-[1000] flex items-center gap-3 px-5 py-3 rounded-2xl glass-dark border border-white/10 shadow-2xl">
            <div className={`w-2.5 h-2.5 rounded-full ${gpsActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">
              {gpsActive ? 'GPS Active' : 'Acquiring GPS'}
            </span>
          </div>

          {/* ─── Speed display ─── */}
          {gpsActive && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-44 left-6 z-[1000] glass-dark rounded-[2rem] border border-white/10 p-6 shadow-2xl"
            >
              <div className="text-center">
                <p className="text-[9px] font-black text-surface-500 uppercase tracking-widest mb-1">Speed</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white italic tracking-tighter">
                    {formatSpeed(speed)}
                  </span>
                  <span className="text-xs font-bold text-surface-500">km/h</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── Re-center button ─── */}
          <button
            onClick={() => {
              // The map will be re-centered by MapFitter on next render
              // Force a re-render by toggling state is tricky; instead let's just
              // rely on the auto-fit behavior
            }}
            className="absolute bottom-44 right-6 z-[1000] w-14 h-14 rounded-2xl glass-dark border border-white/20 flex items-center justify-center text-primary-400 hover:text-white transition-all shadow-2xl hover:scale-110"
          >
            <Navigation className="w-6 h-6" />
          </button>
        </div>

        {/* ─── ETA Info Panel ─── */}
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="relative z-[1001] bg-surface-950 border-t border-white/10 shadow-[0_-20px_60px_rgba(0,0,0,0.5)]"
        >
          <div className="px-8 py-7">
            {/* Drag handle */}
            <div className="flex justify-center mb-5">
              <div className="w-12 h-1.5 rounded-full bg-white/10" />
            </div>

            <div className="flex items-center justify-between gap-8">
              {/* ETA */}
              <div className="flex-1">
                <p className="text-[9px] font-black text-primary-500 uppercase tracking-[0.4em] mb-2 flex items-center gap-2">
                  <Radio className="w-3 h-3 animate-pulse" /> Estimated Arrival
                </p>
                <div className="flex items-baseline gap-3">
                  <span
                    className="text-5xl font-black text-white italic tracking-tighter"
                    style={{ animation: 'etaGlow 3s ease-in-out infinite' }}
                  >
                    {eta ? formatETA(eta.duration) : '—'}
                  </span>
                  {eta && (
                    <span className="text-lg font-bold text-surface-500 italic">
                      {formatDistance(eta.distance)}
                    </span>
                  )}
                </div>
              </div>

              {/* Destination info */}
              <div className="text-right shrink-0 max-w-[200px]">
                <p className="text-[9px] font-black text-surface-500 uppercase tracking-widest mb-2 flex items-center justify-end gap-2">
                  <MapPin className="w-3 h-3 text-emerald-500" /> Destination
                </p>
                <h3 className="text-lg font-black text-white italic uppercase tracking-tighter truncate leading-none mb-1">
                  {destination.title || 'Parking Spot'}
                </h3>
                <p className="text-[10px] font-bold text-surface-500 uppercase tracking-wider truncate">
                  {destination.address || ''}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            {eta && (
              <div className="mt-5">
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                    initial={{ width: '5%' }}
                    animate={{
                      width: `${Math.max(5, Math.min(95, 100 - (eta.distance / (eta.distance + 100)) * 100))}%`
                    }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
