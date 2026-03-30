import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingAPI } from '../../api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Clock, MapPin, Calendar, Timer, X, Navigation } from 'lucide-react';
import { formatCurrency, formatDate, formatTime, formatDuration } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState(false);
  const [elapsed, setElapsed] = useState(0);

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

  const loadData = async () => {
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
      const { data } = await bookingAPI.end(activeSession._id);
      toast.success(`Session ended! ${formatCurrency(data.booking.totalAmount)} charged`);
      setActiveSession(null);
      loadData();
    } catch (err) {
      toast.error('Failed to end session');
    }
    setEnding(false);
  };

  const handleCancel = async (id) => {
    try {
      await bookingAPI.cancel(id);
      toast.success('Booking cancelled');
      setActiveSession(null);
      loadData();
    } catch (err) {
      toast.error('Failed to cancel');
    }
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
    <div className="pt-20 min-h-screen bg-surface-50">
      <div className="max-w-3xl mx-auto px-4 pb-12">
        <h1 className="text-2xl font-bold text-surface-900 mb-6">My Bookings</h1>

        {/* Active Session Card */}
        {activeSession && (
          <Card className="mb-6 border-2 border-primary-200 bg-gradient-to-r from-primary-50 to-accent-50 animate-pulse-glow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="primary" className="text-sm px-3 py-1">🔴 Active Session</Badge>
                <button onClick={() => handleCancel(activeSession._id)} className="text-surface-400 hover:text-danger-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <h2 className="text-xl font-bold text-surface-900">{activeSession.spot?.title}</h2>
              <p className="text-sm text-surface-500 flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4" /> {activeSession.spot?.address}
              </p>
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-3xl font-mono font-bold text-primary-600">{fmtElapsed()}</div>
                  <div className="text-xs text-surface-500 mt-1">Duration</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-surface-800">{formatCurrency(currentCost())}</div>
                  <div className="text-xs text-surface-500 mt-1">Current Cost</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-surface-600">{formatCurrency(activeSession.spot?.pricePerHour)}</div>
                  <div className="text-xs text-surface-500 mt-1">Per Hour</div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button onClick={handleEnd} loading={ending} variant="danger" className="flex-1" size="lg">
                  <Timer className="w-4 h-4" /> End Session
                </Button>
                <Button onClick={() => {
                  const [lng, lat] = activeSession.spot.location.coordinates;
                  window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
                }} variant="secondary" size="lg">
                  <Navigation className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4">
          {[{ v: '', l: 'All' }, { v: 'active', l: 'Active' }, { v: 'completed', l: 'Completed' }, { v: 'cancelled', l: 'Cancelled' }].map(({ v, l }) => (
            <button key={v} onClick={() => setFilter(v)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === v ? 'bg-primary-100 text-primary-700' : 'text-surface-500 hover:bg-surface-100'}`}>
              {l}
            </button>
          ))}
        </div>

        {/* Bookings list */}
        <div className="space-y-3">
          {bookings.length === 0 && !loading && (
            <div className="text-center py-12 text-surface-400">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No bookings found</p>
              <Button onClick={() => navigate('/search')} variant="ghost" className="mt-3">Find Parking</Button>
            </div>
          )}
          {bookings.filter(b => b._id !== activeSession?._id).map(b => (
            <Card key={b._id} hover onClick={() => navigate(`/spots/${b.spot?._id}`)}>
              <div className="p-4 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${b.status === 'completed' ? 'bg-success-500/10' : b.status === 'cancelled' ? 'bg-danger-500/10' : 'bg-primary-500/10'}`}>
                  <Clock className={`w-5 h-5 ${b.status === 'completed' ? 'text-success-500' : b.status === 'cancelled' ? 'text-danger-500' : 'text-primary-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-surface-800 truncate">{b.spot?.title || 'Unknown Spot'}</h3>
                  <p className="text-xs text-surface-500 mt-0.5">{formatDate(b.startTime)} • {formatTime(b.startTime)}{b.endTime ? ` — ${formatTime(b.endTime)}` : ''}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-surface-800">{b.totalAmount > 0 ? formatCurrency(b.totalAmount) : '—'}</div>
                  <Badge variant={statusVariant[b.status]} className="mt-1">{b.status}</Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
