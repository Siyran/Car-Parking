import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingAPI } from '../../api';
import { useSocket } from '../../context/SocketContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LiveTrackingMap from '../../components/map/LiveTrackingMap';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, Calendar, Timer, X, Navigation, Zap, Radio } from 'lucide-react';
import { formatCurrency, formatDate, formatTime, formatETA } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function MyBookings() {
  const navigate = useNavigate();
  const { startGPSBroadcast, stopGPSBroadcast, onETAUpdate, emitGPSStop } = useSocket();
  const [bookings, setBookings] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [showLiveMap, setShowLiveMap] = useState(false);
  const [liveETA, setLiveETA] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

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

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      () => {}
    );
  }, []);

  useEffect(() => {
    if (!activeSession?.spot?.location) return;
    const [lng, lat] = activeSession.spot.location.coordinates;
    startGPSBroadcast(activeSession._id, activeSession.spot._id, lat, lng);
    return () => stopGPSBroadcast();
  }, [activeSession?._id]);

  useEffect(() => {
    const unsub = onETAUpdate((data) => {
      if (data.bookingId === activeSession?._id) setLiveETA(data);
    });
    return unsub;
  }, [activeSession?._id, onETAUpdate]);

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
      toast.error('Failed to load bookings');
    }
    setLoading(false);
  };

  const handleEnd = async () => {
    if (!activeSession) return;
    setEnding(true);
    try {
      emitGPSStop(activeSession._id);
      const { data } = await bookingAPI.end(activeSession._id);
      toast.success(`Session Ended: ₹${data.booking.totalAmount} charged`);
      setActiveSession(null);
      setLiveETA(null);
      loadData();
    } catch (err) {
      toast.error('Failed to end session');
    }
    setEnding(false);
  };

  const handleCancel = async (id) => {
    try {
      if (activeSession?._id === id) emitGPSStop(id);
      await bookingAPI.cancel(id);
      toast.success('Reservation cancelled');
      setActiveSession(null);
      setLiveETA(null);
      loadData();
    } catch (err) {
      toast.error('Failed to cancel');
    }
  };

  const handleOpenLiveMap = async () => {
    if (!activeSession) return;
    setShowLiveMap(true);
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
    <div className="max-w-4xl mx-auto space-y-8">
      {showLiveMap && activeSession && (
        <LiveTrackingMap
          destination={{ lat: activeSession.spot.location.coordinates[1], lng: activeSession.spot.location.coordinates[0], title: activeSession.spot.title, address: activeSession.spot.address }}
          onClose={() => setShowLiveMap(false)}
          initialPosition={userLocation ? { lat: userLocation[0], lng: userLocation[1] } : null}
          bookingId={activeSession._id}
          spotId={activeSession.spot?._id}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Bookings</h1>
          <p className="text-surface-500 text-sm mt-1">Track your active and past parking sessions</p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
          {[{ v: '', l: 'All' }, { v: 'active', l: 'Active' }, { v: 'completed', l: 'Past' }].map(({ v, l }) => (
            <button key={v} onClick={() => setFilter(v)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === v ? 'bg-white/10 text-white' : 'text-surface-500 hover:text-white'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeSession && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="p-8 relative overflow-hidden bg-primary-600/5 border-primary-500/30 shadow-glow">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 blur-[100px] pointer-events-none" />
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-emerald-500 animate-pulse" />
                    </div>
                    <div>
                      <Badge className="mb-1 text-[10px]">Active Session</Badge>
                      <h2 className="text-xl font-bold text-white tracking-tight">{activeSession.spot?.title}</h2>
                      <p className="text-xs text-surface-500 mt-0.5">{activeSession.spot?.address}</p>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => handleCancel(activeSession._id)} className="h-10 w-10 p-0 rounded-lg"><X className="w-4 h-4" /></Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-white/5 rounded-2xl border border-white/5">
                  <div className="space-y-1">
                    <p className="text-[10px] text-surface-500 uppercase tracking-widest">Elapsed</p>
                    <p className="text-2xl font-mono font-bold text-primary-400">{fmtElapsed()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-surface-500 uppercase tracking-widest">Cost</p>
                    <p className="text-2xl font-bold text-white">₹{currentCost()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-surface-500 uppercase tracking-widest">Rate</p>
                    <p className="text-2xl font-bold text-surface-400">₹{activeSession.spot?.pricePerHour}/hr</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-primary-500 uppercase tracking-widest flex items-center gap-1.5"><Radio className="w-3 h-3 animate-pulse" /> ETA</p>
                    <p className="text-2xl font-bold text-emerald-400">{liveETA ? formatETA(liveETA.duration) : '--'}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <Button onClick={handleOpenLiveMap} className="flex-1 py-4 gap-3"><Navigation className="w-4 h-4" /> Track Live</Button>
                  <Button onClick={handleEnd} loading={ending} variant="secondary" className="flex-1 py-4 border-white/10 hover:bg-white/5">End Session</Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-surface-400 uppercase tracking-widest px-1">Booking History</h3>
        <div className="space-y-2">
          {bookings.length === 0 && !loading && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20 text-white" />
              <p className="text-surface-500">No bookings found</p>
            </div>
          )}
          {bookings.filter(b => b._id !== activeSession?._id).map((b) => (
            <Card key={b._id} onClick={() => navigate(`/spots/${b.spot?._id}`)} className="p-5 flex items-center gap-6 hover:bg-white/[0.02] cursor-pointer">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${b.status === 'completed' ? 'bg-emerald-500/10' : 'bg-surface-500/10'}`}>
                <Clock className={`w-6 h-6 ${b.status === 'completed' ? 'text-emerald-500' : 'text-surface-500'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-semibold text-white truncate">{b.spot?.title || 'Unknown Spot'}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-[11px] text-surface-500">{formatDate(b.startTime)}</p>
                  <span className="w-1 h-1 rounded-full bg-white/10" />
                  <p className="text-[11px] text-surface-500">{formatTime(b.startTime)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-base font-bold text-white mb-1">{b.totalAmount > 0 ? formatCurrency(b.totalAmount) : '—'}</p>
                <Badge variant={statusVariant[b.status]}>{b.status}</Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
