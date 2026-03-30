import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { spotAPI, bookingAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import { MapPin, Star, Clock, Shield, Car, Navigation, ChevronLeft, Send } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

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

  useEffect(() => {
    loadSpot();
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

  const handleStartParking = async () => {
    if (!user) { navigate('/login'); return; }
    setStarting(true);
    try {
      await bookingAPI.start({ spotId: id });
      toast.success('Parking session started!');
      navigate('/bookings');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to start session');
    }
    setStarting(false);
  };

  const handleNavigate = () => {
    if (!spot) return;
    const [lng, lat] = spot.location.coordinates;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  const submitReview = async () => {
    try {
      const { data } = await spotAPI.addReview(id, reviewForm);
      setReviews([data.review, ...reviews]);
      setShowReview(false);
      setReviewForm({ rating: 5, comment: '' });
      toast.success('Review submitted!');
      loadSpot();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit review');
    }
  };

  if (loading) {
    return <div className="pt-20 flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" style={{ animation: 'spin 1s linear infinite' }} /></div>;
  }

  if (!spot) return null;
  const [lng, lat] = spot.location.coordinates;

  return (
    <div className="pt-16 min-h-screen bg-surface-50">
      {/* Header */}
      <div className="bg-white border-b border-surface-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-surface-500 hover:text-surface-700 mb-3">
            <ChevronLeft className="w-4 h-4" /> Back to search
          </button>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-surface-900">{spot.title}</h1>
              <p className="text-surface-500 mt-1 flex items-center gap-1"><MapPin className="w-4 h-4" /> {spot.address}</p>
              <div className="flex items-center gap-3 mt-2">
                {spot.averageRating > 0 && (
                  <span className="flex items-center gap-1 text-sm font-medium">
                    <Star className="w-4 h-4 fill-warning-400 text-warning-400" />
                    {spot.averageRating} ({spot.totalReviews} reviews)
                  </span>
                )}
                <Badge variant={spot.availableSlots > 0 ? 'success' : 'danger'}>
                  {spot.availableSlots} of {spot.totalSlots} available
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary-600">{formatCurrency(spot.pricePerHour)}</div>
              <div className="text-sm text-surface-400">per hour</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 grid md:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          {/* Map */}
          <Card className="overflow-hidden">
            <div className="h-64 relative">
              <MapContainer center={[lat, lng]} zoom={16} className="h-full w-full" zoomControl={false} scrollWheelZoom={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[lat, lng]} />
              </MapContainer>
            </div>
            <div className="p-4 flex gap-2">
              <Button onClick={handleNavigate} variant="secondary" size="sm" className="flex-1">
                <Navigation className="w-4 h-4" /> Navigate
              </Button>
            </div>
          </Card>

          {/* Description */}
          {spot.description && (
            <Card><div className="p-5">
              <h3 className="font-semibold text-surface-800 mb-2">About this spot</h3>
              <p className="text-sm text-surface-600 leading-relaxed">{spot.description}</p>
            </div></Card>
          )}

          {/* Amenities */}
          {spot.amenities?.length > 0 && (
            <Card><div className="p-5">
              <h3 className="font-semibold text-surface-800 mb-3">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {spot.amenities.map(a => (
                  <span key={a} className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-surface-50 rounded-lg text-surface-600 border border-surface-100">
                    <Shield className="w-3.5 h-3.5 text-primary-500" /> {a}
                  </span>
                ))}
              </div>
            </div></Card>
          )}

          {/* Vehicle Types */}
          {spot.vehicleTypes?.length > 0 && (
            <Card><div className="p-5">
              <h3 className="font-semibold text-surface-800 mb-3">Accepted Vehicles</h3>
              <div className="flex gap-2">
                {spot.vehicleTypes.map(v => (
                  <span key={v} className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-primary-50 rounded-lg text-primary-600 capitalize border border-primary-100">
                    <Car className="w-3.5 h-3.5" /> {v}
                  </span>
                ))}
              </div>
            </div></Card>
          )}

          {/* Reviews */}
          <Card>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-surface-800">Reviews ({reviews.length})</h3>
                {user?.role === 'driver' && (
                  <Button size="sm" variant="ghost" onClick={() => setShowReview(true)}>Write Review</Button>
                )}
              </div>
              {reviews.length === 0 ? (
                <p className="text-sm text-surface-400">No reviews yet</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map(r => (
                    <div key={r._id} className="flex gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {r.driver?.name?.[0] || '?'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-surface-800">{r.driver?.name}</span>
                          <div className="flex">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-3 h-3 fill-warning-400 text-warning-400" />)}</div>
                        </div>
                        <p className="text-sm text-surface-500 mt-0.5">{r.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="sticky top-20">
            <div className="p-5 space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-600">{formatCurrency(spot.pricePerHour)}</div>
                <div className="text-surface-400 text-sm mt-1">per hour</div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-surface-50">
                  <span className="text-surface-500">Available</span>
                  <span className="font-medium text-surface-800">{spot.availableSlots} / {spot.totalSlots} slots</span>
                </div>
                <div className="flex justify-between py-2 border-b border-surface-50">
                  <span className="text-surface-500">Rating</span>
                  <span className="font-medium flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-warning-400 text-warning-400" /> {spot.averageRating || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-surface-500">Owner</span>
                  <span className="font-medium text-surface-800">{spot.owner?.name}</span>
                </div>
              </div>
              {user?.role === 'driver' && spot.availableSlots > 0 && (
                <Button onClick={handleStartParking} loading={starting} className="w-full" size="lg">
                  <Clock className="w-4 h-4" /> Start Parking
                </Button>
              )}
              {(!user || !['driver'].includes(user.role)) && spot.availableSlots > 0 && (
                <Button onClick={() => navigate('/login')} className="w-full" size="lg">
                  Login to Park
                </Button>
              )}
              {spot.availableSlots === 0 && (
                <div className="text-center py-3 bg-danger-500/10 rounded-xl text-danger-500 font-medium text-sm">
                  No slots available
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Review Modal */}
      <Modal isOpen={showReview} onClose={() => setShowReview(false)} title="Write a Review">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">Rating</label>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setReviewForm({...reviewForm, rating: n})}>
                  <Star className={`w-8 h-8 ${n <= reviewForm.rating ? 'fill-warning-400 text-warning-400' : 'text-surface-200'} transition-colors`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">Comment</label>
            <textarea className="w-full rounded-xl border border-surface-200 px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/30 outline-none resize-none" rows={4} placeholder="Share your experience..."
              value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} />
          </div>
          <Button onClick={submitReview} className="w-full"><Send className="w-4 h-4" /> Submit Review</Button>
        </div>
      </Modal>
    </div>
  );
}
