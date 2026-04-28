import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { spotAPI, bookingAPI, walletAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import RoutingMachine from '../../components/map/RoutingMachine';
import LiveTrackingMap from '../../components/map/LiveTrackingMap';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Star, Clock, Shield, Car, Navigation, ChevronLeft, Send, ArrowLeft, Activity, Info, Zap, IndianRupee, ChevronRight, MessageSquare, ShieldCheck, Cpu, Wallet, CreditCard, Smartphone, X, Radio, LocateFixed } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';
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

const RecenterButton = ({ userLocation, requestLocation }) => {
  const map = useMap();
  
  const handleCenter = async (e) => {
    e.stopPropagation();
    let pos = userLocation;
    if (!pos) {
       toast.loading('Acquiring GPS Lock...', { id: 'gps-lock' });
       try {
         pos = await requestLocation();
         toast.success('GPS Lock Established', { id: 'gps-lock' });
       } catch (err) {
         toast.dismiss('gps-lock');
         return;
       }
    }
    map.flyTo(pos, 16);
  };

  return (
    <div className="absolute right-4 bottom-4 z-[1000]">
      <button 
        onClick={handleCenter}
        className="w-12 h-12 bg-surface-950/80 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-primary-500 hover:text-white hover:border-primary-500/50 hover:bg-primary-600/20 shadow-glow transition-all"
        title="Center on my location"
      >
        <LocateFixed className="w-5 h-5" />
      </button>
    </div>
  );
};

export default function SpotDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [spot, setSpot] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [showRoute, setShowRoute] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedHours, setSelectedHours] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [walletBalance, setWalletBalance] = useState(0);

  const [showQR, setShowQR] = useState(false);
  const [upiLink, setUpiLink] = useState('');
  const [showLiveNav, setShowLiveNav] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    loadSpot();
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      () => console.log('Location access denied')
    );
  }, [id]);

  const loadSpot = async () => {
    try {
      const { data } = await spotAPI.getById(id);
      setSpot(data.spot);
      setReviews(data.reviews || []);
    } catch (err) {
      toast.error('Node offline or invalid link');
      navigate('/search');
    }
    setLoading(false);
  };

  const openPaymentModal = async () => {
    if (!user) { navigate('/login'); return; }
    setStarting(true);
    try {
      const { data } = await walletAPI.getBalance();
      setWalletBalance(data.balance);
      setShowPayment(true);
    } catch (err) {
      console.error('Wallet fetch failed:', err);
      toast.error('Secure Link Timing Out. Re-syncing...');
      setWalletBalance(0);
      // Still show payment modal so they can use UPI fallback
      setShowPayment(true);
    } finally {
      setStarting(false);
    }
  };


  const handleStartParking = async () => {
    setStarting(true);
    const totalAmount = selectedHours * (spot?.pricePerHour || 0);

    if (paymentMethod === 'wallet') {
      try {
        await bookingAPI.start({ spotId: id, paymentMethod: 'wallet', hours: selectedHours });
        toast.success('Parking session started!');
        navigate('/bookings');
      } catch (err) {
        toast.error(err.response?.data?.error || 'Payment failed');
      }
      setStarting(false);
      return;
    }

    // Direct UPI Flow
    try {
      const { data: keyData } = await walletAPI.getKeyId();
      const upiId = keyData.upiId || 'siyranabrar12345@okaxis';
      const uri = `upi://pay?pa=${upiId}&pn=ParkFlow&am=${totalAmount}&cu=INR&tn=ParkFlow_Booking_${id}`;
      setUpiLink(uri);

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = uri;
        setTimeout(() => setShowQR(true), 1500);
      } else {
        setShowQR(true);
      }
    } catch (err) {
      toast.error('Failed to initiate UPI payment');
    }
    setStarting(false);
  };

  const handleManualVerifyBooking = async () => {
    setStarting(true);
    try {
      // Record manual payment on backend (placeholder)
      await walletAPI.verifyManual({
        amount: selectedHours * (spot?.pricePerHour || 0),
        type: 'parking_payment',
        description: `Direct UPI for Spot: ${spot?.title}`
      });
      // Start the actual session
      await bookingAPI.start({ spotId: id, paymentMethod: 'upi', hours: selectedHours });
      toast.success('Payment recorded — parking started!');
      navigate('/bookings');
    } catch (err) {
      console.error('Session start failed error:', err.response?.data || err.message || err);
      toast.error(err.response?.data?.error || 'Session start failed');
    }
    setStarting(false);
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
          let msg = 'GPS Lock Failed';
          if (err.code === 1) msg = 'Location Access Denied. Please enable it in browser settings.';
          else if (err.code === 3) msg = 'Location Request Timed Out';
          toast.error(msg);
          reject(err);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  };

  const handleNavigate = async () => {
    let currentPos = userLocation;
    if (!currentPos) {
      toast.loading('Acquiring GPS Lock...', { id: 'gps-lock' });
      try {
        currentPos = await requestUserLocation();
        toast.success('GPS Lock Established', { id: 'gps-lock' });
      } catch (err) {
        toast.dismiss('gps-lock');
        return;
      }
    }
    setShowRoute(!showRoute);
  };

  const handleLiveTrack = async () => {
    let currentPos = userLocation;
    if (!currentPos) {
      toast.loading('Acquiring GPS Lock...', { id: 'gps-lock' });
      try {
        currentPos = await requestUserLocation();
        toast.success('GPS Lock Established', { id: 'gps-lock' });
      } catch (err) {
        toast.dismiss('gps-lock');
        return;
      }
    }
    setShowLiveNav(true);
  };

  const submitReview = async () => {
    try {
      const { data } = await spotAPI.addReview(id, reviewForm);
      setReviews([data.review, ...reviews]);
      setShowReview(false);
      setReviewForm({ rating: 5, comment: '' });
      toast.success('Telemetry updated!');
      loadSpot();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Sync failed');
    }
  };

  if (loading) {
    return (
      <div className="pt-40 flex flex-col items-center justify-center min-h-screen bg-surface-950">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin shadow-glow mb-6" />
        <p className="text-[10px] font-black text-primary-500 uppercase tracking-[0.5em] animate-pulse">Syncing Node Data...</p>
      </div>
    );
  }

  if (!spot) return null;
  const [lng, lat] = spot.location.coordinates;

  return (
    <div className="pt-32 min-h-screen bg-surface-950 selection:bg-primary-500 overflow-x-hidden relative flex flex-col">
      <div className="absolute inset-0 map-grid opacity-[0.07] pointer-events-none" />

      {/* Live Navigation Fullscreen Overlay */}
      {showLiveNav && spot && (
        <LiveTrackingMap
          destination={{
            lat: spot.location.coordinates[1],
            lng: spot.location.coordinates[0],
            title: spot.title,
            address: spot.address
          }}
          onClose={() => setShowLiveNav(false)}
          initialPosition={userLocation ? { lat: userLocation[0], lng: userLocation[1] } : null}
          isNavigating={true}
        />
      )}
      
      {/* Dynamic Technical Header */}
      <div className="relative z-20 px-8 py-8 md:py-12 border-b border-white/5 bg-surface-950/40 backdrop-blur-3xl">
        <div className="max-w-[1440px] mx-auto">
          <button onClick={() => navigate(-1)} className="group flex items-center gap-3 text-[10px] font-black text-surface-500 uppercase tracking-[0.3em] hover:text-primary-400 mb-8 transition-all">
            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary-500/30 transition-all">
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
            Back to Network
          </button>

          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                 <div className="flex -space-x-4">
                    <div className="w-14 h-14 rounded-3xl bg-primary-600/20 border border-primary-500/30 flex items-center justify-center shadow-glow">
                       <MapPin className="w-7 h-7 text-primary-400" />
                    </div>
                    <div className="w-14 h-14 rounded-3xl bg-accent-600/10 border border-accent-500/20 flex items-center justify-center translate-y-3">
                       <Cpu className="w-7 h-7 text-accent-500" />
                    </div>
                 </div>
                 <Badge variant={spot.availableSlots > 0 ? 'success' : 'danger'} className="!rounded-xl px-4 py-2 text-[10px] uppercase font-black tracking-widest animate-pulse border-none shadow-glow">
                    {spot.availableSlots > 0 ? 'Node Active' : 'Node Full'}
                 </Badge>
              </div>

              <div>
                <h1 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter leading-[0.9] mb-4">
                  {spot.title.split(' ').map((word, i) => i === spot.title.split(' ').length - 1 ? <span key={i} className="gradient-text italic text-glow">{word}</span> : word + ' ')}
                </h1>
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-3 text-surface-400">
                    <Navigation className="w-4 h-4 text-primary-500 rotate-45" />
                    <p className="text-xs font-black uppercase tracking-widest">{spot.address}</p>
                  </div>
                  {spot.averageRating > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-warning-500/10 border border-warning-500/20">
                      <Star className="w-4 h-4 fill-warning-400 text-warning-400" />
                      <span className="text-sm font-black text-warning-500">{spot.averageRating} <span className="opacity-50 font-medium ml-1">({spot.totalReviews} Logs)</span></span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="hidden xl:flex items-center gap-12 border-l border-white/5 pl-12 h-24">
               <div>
                  <p className="text-[10px] font-black text-surface-500 uppercase tracking-[0.4em] mb-2 text-right">Infrastructural Rate</p>
                  <p className="text-5xl font-black text-white italic tracking-tighter text-right">₹{spot.pricePerHour}<span className="text-xl text-surface-600 ml-2">/Cyc</span></p>
               </div>
               <div className="w-px h-full bg-white/5" />
               <div>
                  <p className="text-[10px] font-black text-surface-500 uppercase tracking-[0.4em] mb-2 text-right">Total Capacity</p>
                  <p className="text-5xl font-black text-primary-400 italic tracking-tighter text-right">{spot.availableSlots}<span className="text-xl text-surface-600 ml-2">Open</span></p>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-8 w-full py-12 flex-1 pb-32 flex flex-col xl:flex-row gap-12 relative z-10">
        {/* Immersive Terminal Viewport */}
        <div className="flex-1 space-y-12">
          {/* Enhanced Map Interface */}
          <div className="group relative">
             <div className="absolute -inset-1 bg-linear-to-r from-primary-500 to-accent-500 rounded-[3rem] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
             <div className="glass-dark rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl relative">
                <div className="h-[500px] relative">
                  <div className="absolute inset-0 z-10 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]" />
                  <MapContainer center={[lat, lng]} zoom={16} className="h-full w-full dark-map-tiles" zoomControl={false} scrollWheelZoom={false}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {!showRoute && <Marker position={[lat, lng]} icon={createPriceIcon(spot.pricePerHour, spot.availableSlots)} />}
                    {showRoute && userLocation && (
                      <RoutingMachine start={userLocation} end={[lat, lng]} />
                    )}
                    <RecenterButton userLocation={userLocation} requestLocation={requestUserLocation} />
                  </MapContainer>
                </div>
                <div className="p-8 bg-surface-950/80 backdrop-blur-2xl border-t border-white/5 flex items-center justify-between gap-8">
                   <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                         <div className="flex items-center gap-2 text-primary-500">
                            <Activity className="w-4 h-4 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Active Tracking Terminal</span>
                         </div>
                      </div>
                      <p className="text-xs text-surface-500 font-medium leading-relaxed max-w-xl">Precision GPS coordinates locked. Direct routing available via integrated navigation module.</p>
                   </div>
                   <div className="flex gap-3">
                     <Button onClick={handleNavigate} variant={showRoute ? 'primary' : 'secondary'} size="lg" className="!rounded-2xl px-8 py-7 font-black uppercase tracking-[0.2em] shadow-glow">
                       {showRoute ? <ArrowLeft className="w-5 h-5 mr-3" /> : <Navigation className="w-5 h-5 mr-3 rotate-45" />}
                       {showRoute ? 'Back to Terminal' : 'Execute Guidance'}
                     </Button>
                     {showRoute && (
                       <Button onClick={handleLiveTrack} variant="primary" size="lg" className="!rounded-2xl px-8 py-7 font-black uppercase tracking-[0.2em] shadow-glow bg-emerald-600 hover:bg-emerald-500">
                         <Radio className="w-5 h-5 mr-3 animate-pulse" /> Live Track
                       </Button>
                     )}
                   </div>
                </div>
             </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
             {/* Infrastructure Specs */}
             <div className="space-y-12">
                {spot.description && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                       <h3 className="text-xs font-black text-white uppercase tracking-[0.5em]">Node Description</h3>
                       <div className="h-px flex-1 bg-white/5" />
                    </div>
                    <p className="text-lg font-medium text-surface-400 italic leading-[1.6]">"{spot.description}"</p>
                  </div>
                )}

                {spot.amenities?.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                       <h3 className="text-xs font-black text-white uppercase tracking-[0.5em]">Network Amenities</h3>
                       <div className="h-px flex-1 bg-white/5" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {spot.amenities.map(a => (
                        <div key={a} className="group flex items-center gap-4 p-5 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-primary-500/30 transition-all">
                          <div className="w-10 h-10 rounded-xl bg-primary-600/10 flex items-center justify-center border border-primary-500/20 group-hover:bg-primary-600/20 transition-all">
                             <ShieldCheck className="w-5 h-5 text-primary-400" />
                          </div>
                          <span className="text-xs font-black text-surface-400 uppercase tracking-widest">{a}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
             </div>

             {/* Verification & Reviews */}
             <div className="space-y-12">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                     <h3 className="text-xs font-black text-white uppercase tracking-[0.5em]">Node Telemetry</h3>
                     <div className="h-px flex-1 bg-white/5" />
                  </div>
                  <div className="glass-dark rounded-[2.5rem] border border-white/5 p-8 space-y-8">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center">
                              <MessageSquare className="w-6 h-6 text-accent-500" />
                           </div>
                           <h4 className="text-sm font-black text-white uppercase tracking-widest">Performance Logs</h4>
                        </div>
                        {user?.role === 'user' && (
                          <button onClick={() => setShowReview(true)} className="text-[10px] font-black text-primary-500 uppercase tracking-widest hover:text-white transition-colors">Write Log</button>
                        )}
                     </div>

                     {reviews.length === 0 ? (
                        <div className="py-12 text-center space-y-4 rounded-3xl bg-white/[0.02] border border-dashed border-white/10">
                           <Info className="w-8 h-8 text-surface-600 mx-auto opacity-50" />
                           <p className="text-[10px] font-black text-surface-600 uppercase tracking-widest">No verified logs found for this node.</p>
                        </div>
                     ) : (
                        <div className="space-y-6">
                           {reviews.map(r => (
                              <div key={r._id} className="group p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                                 <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                       <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-black">
                                          {r.user?.name?.[0] || '?'}
                                       </div>
                                       <div>
                                          <p className="text-xs font-black text-white uppercase italic tracking-tighter">{r.user?.name}</p>
                                          <div className="flex mt-0.5">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-2.5 h-2.5 fill-warning-400 text-warning-400" />)}</div>
                                       </div>
                                    </div>
                                 </div>
                                 <p className="text-xs text-surface-400 italic leading-relaxed font-medium">"{r.comment}"</p>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
                </div>
             </div>
          </div>
        </div>

        {/* Technical Booking Sidebar */}
        <div className="xl:w-[420px]">
           <div className="sticky top-40 space-y-6">
              <div className="group relative">
                <div className="absolute -inset-1 bg-linear-to-r from-primary-500 to-accent-500 rounded-[3rem] blur-xl opacity-20 pointer-events-none" />
                <div className="glass-dark rounded-[3rem] border-2 border-white/10 p-10 space-y-10 shadow-2xl relative overflow-hidden text-center">
                   <div className="absolute top-0 right-0 w-40 h-40 bg-primary-600/10 blur-[100px] pointer-events-none" />
                   
                   <div className="space-y-4">
                      <div className="flex items-center justify-center gap-3">
                         <div className="h-px w-8 bg-primary-500/30" />
                         <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.5em]">Execution Hub</span>
                         <div className="h-px w-8 bg-primary-500/30" />
                      </div>
                      <div className="text-7xl font-black text-white italic tracking-tighter text-glow drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">₹{spot.pricePerHour}</div>
                      <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest opacity-60">Base Cycle Cost</p>
                   </div>

                   <div className="p-8 rounded-[2.5rem] bg-black/40 border border-white/5 space-y-6">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                         <span className="text-surface-500">Node Status</span>
                         <span className="text-emerald-500 shadow-glow">Available</span>
                      </div>
                      <div className="h-px bg-white/5" />
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                         <span className="text-surface-500">Infrastructure</span>
                         <span className="text-white">{spot.availableSlots} / {spot.totalSlots} Slots</span>
                      </div>
                      <div className="h-px bg-white/5" />
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                         <span className="text-surface-500">Security Index</span>
                         <span className="text-accent-500">High Reliability</span>
                      </div>
                   </div>

                   <div className="space-y-4">
                      {user?.role === 'user' && spot.availableSlots > 0 && (
                        <Button onClick={openPaymentModal} loading={starting} variant="primary" className="w-full !rounded-[2rem] py-10 text-lg font-black uppercase tracking-[0.3em] shadow-glow" size="lg">
                          <Zap className="w-6 h-6 mr-3 fill-white" /> Execute Entry
                        </Button>
                      )}
                     {(!user || !['user'].includes(user.role)) && spot.availableSlots > 0 && (
                       <Button onClick={() => navigate('/login')} variant="primary" className="w-full !rounded-[2rem] py-10 text-lg font-black uppercase tracking-[0.3em] shadow-glow" size="lg">
                         Initialize Node
                       </Button>
                     )}
                     {spot.availableSlots === 0 && (
                       <div className="w-full py-8 rounded-[2rem] bg-danger-500/10 border border-danger-500/30 text-danger-500 font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3">
                         <X className="w-5 h-5" /> Node Capacity At Peak
                       </div>
                     )}
                     <p className="text-[9px] font-medium text-surface-600 uppercase tracking-widest">Authorization required for terminal access.</p>
                   </div>
                </div>
              </div>

              {/* Compatibility Spec */}
              <div className="glass-dark rounded-[2.5rem] border border-white/5 p-8 flex items-center justify-between transition-all hover:bg-white/[0.02]">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                       <Car className="w-5 h-5 text-surface-400" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Support Profile</p>
                       <p className="text-xs font-black text-white uppercase tracking-widest mt-0.5">{spot.vehicleTypes?.join(' • ')}</p>
                    </div>
                 </div>
                 <Badge variant="primary" className="!rounded-lg px-2 py-1 text-[9px] font-black uppercase border-none text-glow">Verified</Badge>
              </div>
           </div>
        </div>
      </div>

      {/* Futuristic Log Modal */}
      <Modal isOpen={showReview} onClose={() => setShowReview(false)} title="Terminal Performance Log">
        <div className="space-y-10 p-4">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-surface-500 uppercase tracking-[0.4em] ml-2">Rating Index</label>
            <div className="flex gap-3 justify-center py-6 glass-dark rounded-3xl border border-white/5 shadow-inner">
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setReviewForm({...reviewForm, rating: n})} className="transition-all transform hover:scale-125">
                  <Star className={`w-10 h-10 ${n <= reviewForm.rating ? 'fill-warning-400 text-warning-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'text-surface-700'}`} />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-black text-surface-500 uppercase tracking-[0.4em] ml-2">Observations</label>
            <textarea className="w-full rounded-[2rem] bg-surface-900 border border-white/10 px-8 py-6 text-white text-sm font-medium focus:ring-2 focus:ring-primary-500/30 outline-none resize-none placeholder:text-surface-600 transition-all" rows={4} placeholder="Input terminal observation data..."
              value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} />
          </div>
          <div className="flex gap-4">
             <Button variant="ghost" onClick={() => setShowReview(false)} className="flex-1 !rounded-[1.5rem] font-black text-xs uppercase tracking-widest border border-white/5">Decline</Button>
             <Button onClick={submitReview} className="flex-2 !rounded-[1.5rem] py-6 font-black text-sm uppercase tracking-[0.2em] shadow-glow"><Send className="w-4 h-4 mr-3" /> Commit Log</Button>
          </div>
        </div>
      </Modal>

      {/* Payment Modal */}
      <Modal isOpen={showPayment} onClose={() => setShowPayment(false)} title="Payment Terminal">
        <div className="space-y-8 p-4">
          {/* Duration Selector */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-surface-500 uppercase tracking-[0.4em] ml-2">Parking Duration</label>
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map(h => (
                <button
                  key={h}
                  onClick={() => setSelectedHours(h)}
                  className={`py-5 rounded-2xl text-center font-black transition-all border ${
                    selectedHours === h
                      ? 'bg-primary-600 text-white border-primary-500 shadow-glow'
                      : 'bg-white/5 text-surface-300 border-white/10 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="text-2xl italic tracking-tighter">{h}H</div>
                  <div className="text-[9px] uppercase tracking-widest mt-1 opacity-60">₹{h * (spot?.pricePerHour || 0)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="glass-dark rounded-[2rem] border border-white/10 p-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-surface-500 uppercase tracking-[0.3em]">Total Charge</p>
              <p className="text-xs text-surface-400 mt-1">Refund for unused time</p>
            </div>
            <div className="text-4xl font-black text-white italic tracking-tighter text-glow">
              ₹{selectedHours * (spot?.pricePerHour || 0)}
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-surface-500 uppercase tracking-[0.4em] ml-2">Payment Method</label>
            <div className="space-y-3">
              {[
                { id: 'wallet', label: 'Wallet Balance', icon: Wallet, sub: `Available: ₹${walletBalance.toLocaleString('en-IN')}`, insufficient: walletBalance < selectedHours * (spot?.pricePerHour || 0) },
                { id: 'upi', label: 'UPI / Google Pay', icon: Smartphone, sub: 'Direct P2P Transfer' },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={`w-full flex items-center gap-4 p-5 rounded-2xl border transition-all ${
                    paymentMethod === m.id
                      ? 'bg-primary-600/10 border-primary-500/30 text-white'
                      : 'bg-white/5 border-white/10 text-surface-400 hover:text-white'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    paymentMethod === m.id ? 'bg-primary-500/20 border border-primary-500/30' : 'bg-white/5 border border-white/10'
                  }`}>
                    <m.icon className={`w-6 h-6 ${paymentMethod === m.id ? 'text-primary-400' : ''}`} />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm font-black uppercase tracking-wider">{m.label}</p>
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${
                      m.insufficient ? 'text-red-400' : 'text-surface-500'
                    }`}>{m.id === 'wallet' ? `Available: ₹${(walletBalance || 0).toLocaleString('en-IN')}` : m.sub}</p>
                  </div>

                  {m.insufficient && m.id === 'wallet' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate('/wallet'); }}
                      className="text-[10px] font-black text-primary-400 uppercase tracking-widest hover:text-white transition-colors px-3 py-2 rounded-xl bg-primary-500/10 border border-primary-500/20"
                    >
                      Top Up
                    </button>
                  )}
                  {paymentMethod === m.id && (
                    <div className="w-3 h-3 rounded-full bg-primary-500 shadow-glow" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Confirm */}
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => setShowPayment(false)} className="flex-1 !rounded-[1.5rem] font-black text-xs uppercase tracking-widest border border-white/5">Cancel</Button>
            <Button
              onClick={handleStartParking}
              loading={starting}
              disabled={paymentMethod === 'wallet' && walletBalance < selectedHours * (spot?.pricePerHour || 0)}
              className="flex-2 !rounded-[1.5rem] py-6 font-black text-sm uppercase tracking-[0.2em] shadow-glow disabled:opacity-40"
            >
              <Smartphone className="w-4 h-4 mr-2" /> Pay & Start
            </Button>
          </div>
        </div>
      </Modal>

      {/* UPI QR Modal */}
      <Modal isOpen={showQR} onClose={() => setShowQR(false)} title="UPI Payment Terminal">
        <div className="text-center space-y-8 p-6">
          <div className="relative inline-block group">
            <div className="absolute -inset-4 bg-linear-to-r from-primary-500 to-accent-500 rounded-[3rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative glass-dark p-6 rounded-[2.5rem] border border-white/10">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`}
                alt="Payment QR"
                className="w-64 h-64 mx-auto rounded-2xl border-4 border-white/5 shadow-2xl"
              />
            </div>
          </div>

          <div className="space-y-4">
              <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase underline decoration-primary-500/50 underline-offset-8 decoration-4">
                Scan & Pay ₹{(selectedHours * (spot?.pricePerHour || 0)).toLocaleString()}
              </h3>
              <p className="text-xs text-surface-400 font-medium max-w-xs mx-auto">
                Open GPay, PhonePe, or any UPI app to complete the transfer to the host.
              </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
             <button
               onClick={handleManualVerifyBooking}
               disabled={starting}
               className="w-full py-6 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-black uppercase tracking-[0.2em] transition-all shadow-glow flex items-center justify-center gap-3"
             >
               {starting ? (
                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
               ) : (
                 <>
                   <Zap className="w-5 h-5" />
                   I Have Paid
                 </>
               )}
             </button>
             <p className="text-[10px] font-black text-surface-600 uppercase tracking-widest italic">
               Confirm only after successful transaction
             </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
