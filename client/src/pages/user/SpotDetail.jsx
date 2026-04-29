import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
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
import { MapPin, Star, Clock, Car, Navigation, ChevronLeft, Send, Activity, Info, Zap, Smartphone, Wallet, Shield, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
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
    html: `<div style="background:${available > 0 ? '#3b82f6' : '#64748b'};color:white;padding:6px 12px;border-radius:12px;font-size:12px;font-weight:700;white-space:nowrap;box-shadow:0 4px 12px rgba(0,0,0,0.2)">₹${price}</div>`,
    iconSize: [60, 30],
    iconAnchor: [30, 30],
  });
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
      () => {}
    );
  }, [id]);

  const loadSpot = async () => {
    try {
      const { data } = await spotAPI.getById(id);
      setSpot(data.spot);
      setReviews(data.reviews || []);
    } catch (err) {
      toast.error('Spot not found');
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

  const submitReview = async () => {
    try {
      const { data } = await spotAPI.addReview(id, reviewForm);
      setReviews([data.review, ...reviews]);
      setShowReview(false);
      setReviewForm({ rating: 5, comment: '' });
      toast.success('Review added!');
      loadSpot();
    } catch (err) {
      toast.error('Failed to add review');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface-950">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-surface-500 font-medium tracking-widest uppercase">Loading spot details...</p>
      </div>
    );
  }

  if (!spot || !spot.location || !spot.location.coordinates) return null;
  const [lng, lat] = spot.location.coordinates;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-surface-500 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back to results</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="overflow-hidden p-0 border-white/5">
            <div className="h-[400px] relative">
              <MapContainer center={[lat, lng]} zoom={16} className="h-full w-full dark-map-tiles" zoomControl={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {!showRoute && <Marker position={[lat, lng]} icon={createPriceIcon(spot.pricePerHour, spot.availableSlots)} />}
                {showRoute && userLocation && <RoutingMachine start={userLocation} end={[lat, lng]} />}
              </MapContainer>
              <div className="absolute top-4 left-4 z-[1000] flex gap-2">
                <Badge variant={spot.availableSlots > 0 ? 'success' : 'danger'}>
                  {spot.availableSlots > 0 ? `${spot.availableSlots} Slots Available` : 'Fully Booked'}
                </Badge>
              </div>
            </div>
            <div className="p-8">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold text-white tracking-tight">{spot.title}</h1>
                  <div className="flex items-center gap-2 text-surface-400">
                    <MapPin className="w-4 h-4 text-primary-500" />
                    <span className="text-sm font-medium">{spot.address}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-surface-500 font-medium">Hourly Rate</p>
                    <p className="text-3xl font-bold text-white">₹{spot.pricePerHour}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-8 space-y-6">
              <h3 className="text-lg font-semibold text-white">About this spot</h3>
              <p className="text-surface-400 text-sm leading-relaxed">{spot.description || "No description provided."}</p>
              <div className="pt-4 space-y-4">
                <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-widest">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {spot.amenities?.map(a => (
                    <Badge key={a} variant="primary" className="bg-primary-500/10 text-primary-400 border-primary-500/20">{a}</Badge>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Reviews</h3>
                {spot.averageRating > 0 && (
                  <div className="flex items-center gap-1.5 text-warning-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-bold">{spot.averageRating}</span>
                  </div>
                )}
              </div>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {reviews.length === 0 ? (
                  <p className="text-surface-600 text-sm italic">No reviews yet.</p>
                ) : (
                  reviews.map(r => (
                    <div key={r._id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{r.user?.name}</span>
                        <div className="flex">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-3 h-3 fill-warning-500 text-warning-500" />)}</div>
                      </div>
                      <p className="text-xs text-surface-400 leading-relaxed">{r.comment}</p>
                    </div>
                  ))
                )}
              </div>
              <Button variant="secondary" onClick={() => setShowReview(true)} className="w-full text-xs py-3 border-white/10 hover:bg-white/5">Write a review</Button>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-8 sticky top-8 border-primary-500/20 bg-primary-600/5">
            <h3 className="text-xl font-bold text-white mb-6">Book this spot</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                    <Car className="w-5 h-5 text-primary-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-surface-500 uppercase font-bold tracking-widest">Supports</p>
                    <p className="text-xs font-bold text-white">{spot.vehicleTypes?.join(', ')}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-surface-500">Available Slots</span>
                  <span className="text-white font-bold">{spot.availableSlots} / {spot.totalSlots}</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-primary-600 transition-all duration-500" style={{ width: `${(spot.availableSlots / spot.totalSlots) * 100}%` }} />
                </div>
              </div>

              <Button onClick={openPaymentModal} disabled={spot.availableSlots === 0} className="w-full py-5 text-lg font-bold">
                {spot.availableSlots === 0 ? 'Spot Full' : 'Book Now'}
              </Button>
              <p className="text-[10px] text-center text-surface-600 font-medium uppercase tracking-widest">No commitment until next step</p>
            </div>
          </Card>

          <Card className="p-6 border-white/5 bg-surface-900/50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">ParkFlow Secure</p>
                <p className="text-[10px] text-surface-500 font-medium">Verified hosts and secure payments</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Modal isOpen={showReview} onClose={() => setShowReview(false)} title="Write a review">
        <div className="space-y-6 p-2">
          <div className="flex justify-center gap-3 py-4">
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setReviewForm({...reviewForm, rating: n})} className="transition-transform active:scale-90">
                <Star className={`w-10 h-10 ${n <= reviewForm.rating ? 'fill-warning-500 text-warning-500' : 'text-surface-700'}`} />
              </button>
            ))}
          </div>
          <textarea className="w-full rounded-2xl bg-white/5 border border-white/10 p-6 text-white text-sm outline-none focus:border-primary-500/50 min-h-[120px]" placeholder="Share your experience..."
            value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} />
          <Button onClick={submitReview} className="w-full py-4">Submit Review</Button>
        </div>
      </Modal>

      <Modal isOpen={showPayment} onClose={() => setShowPayment(false)} title="Complete Booking">
        <div className="space-y-8 p-2">
          <div className="space-y-4">
            <p className="text-xs font-bold text-surface-500 uppercase tracking-widest">Select Duration</p>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map(h => (
                <button key={h} onClick={() => setSelectedHours(h)} className={`py-4 rounded-xl border text-sm font-bold transition-all ${selectedHours === h ? 'bg-primary-600 border-primary-500 text-white shadow-glow' : 'bg-white/5 border-white/5 text-surface-400 hover:border-white/10'}`}>
                  {h}H
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
            <span className="text-sm font-medium text-surface-400">Estimated Total</span>
            <span className="text-3xl font-bold text-white">₹{selectedHours * (spot?.pricePerHour || 0)}</span>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-bold text-surface-500 uppercase tracking-widest">Payment Method</p>
            <div className="space-y-2">
              <button onClick={() => setPaymentMethod('wallet')} className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${paymentMethod === 'wallet' ? 'bg-primary-600/10 border-primary-500/30' : 'bg-white/5 border-white/5 opacity-60'}`}>
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                  <Wallet className={`w-5 h-5 ${paymentMethod === 'wallet' ? 'text-primary-400' : 'text-surface-500'}`} />
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-bold text-white">Wallet Balance</p>
                  <p className="text-[10px] text-surface-500">Available: ₹{(walletBalance || 0).toLocaleString()}</p>
                </div>
                {paymentMethod === 'wallet' && <CheckCircle2 className="w-5 h-5 text-primary-500" />}
              </button>
              <button onClick={() => setPaymentMethod('upi')} className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${paymentMethod === 'upi' ? 'bg-primary-600/10 border-primary-500/30' : 'bg-white/5 border-white/5 opacity-60'}`}>
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                  <Smartphone className={`w-5 h-5 ${paymentMethod === 'upi' ? 'text-primary-400' : 'text-surface-500'}`} />
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-bold text-white">UPI / GPay</p>
                  <p className="text-[10px] text-surface-500">Scan QR or Redirect</p>
                </div>
                {paymentMethod === 'upi' && <CheckCircle2 className="w-5 h-5 text-primary-500" />}
              </button>
            </div>
          </div>

          <Button onClick={handleStartParking} loading={starting} disabled={paymentMethod === 'wallet' && walletBalance < selectedHours * (spot?.pricePerHour || 0)} className="w-full py-5 text-lg font-bold">
            Confirm & Pay
          </Button>
        </div>
      </Modal>

      <Modal isOpen={showQR} onClose={() => setShowQR(false)} title="UPI Payment">
        <div className="p-6 text-center space-y-6">
          <div className="bg-white p-4 rounded-2xl inline-block">
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`} alt="QR" className="w-48 h-48" />
          </div>
          <h3 className="text-xl font-bold text-white">Scan to Pay ₹{selectedHours * (spot?.pricePerHour || 0)}</h3>
          <Button onClick={() => navigate('/bookings')} className="w-full">Done</Button>
        </div>
      </Modal>
    </div>
  );
}
