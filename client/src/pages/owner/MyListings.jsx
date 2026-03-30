import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { spotAPI } from '../../api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { MapPin, Star, Plus, Settings, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function MyListings() {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const { data } = await spotAPI.getMy();
      setSpots(data.spots);
    } catch { toast.error('Failed to load'); }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this spot?')) return;
    try {
      await spotAPI.delete(id);
      toast.success('Deleted');
      load();
    } catch { toast.error('Failed'); }
  };

  const statusVariant = { pending: 'warning', approved: 'success', rejected: 'danger' };

  return (
    <div className="pt-20 min-h-screen bg-surface-50">
      <div className="max-w-4xl mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-surface-900">My Listings</h1>
          <Link to="/owner/add-spot"><Button><Plus className="w-4 h-4" /> Add Spot</Button></Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" style={{ animation: 'spin 1s linear infinite' }} /></div>
        ) : spots.length === 0 ? (
          <div className="text-center py-16 text-surface-400">
            <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium mb-2">No parking spots listed yet</p>
            <Link to="/owner/add-spot"><Button>Add Your First Spot</Button></Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {spots.map(s => (
              <Card key={s._id} className="overflow-hidden">
                {s.photos?.[0] && (
                  <div className="h-40 bg-surface-100">
                    <img src={s.photos[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-surface-800">{s.title}</h3>
                    <Badge variant={statusVariant[s.status]}>{s.status}</Badge>
                  </div>
                  <p className="text-xs text-surface-500 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" />{s.address}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-lg font-bold text-primary-600">{formatCurrency(s.pricePerHour)}<span className="text-xs font-normal text-surface-400">/hr</span></span>
                    <span className="text-sm text-surface-500">{s.availableSlots}/{s.totalSlots} slots</span>
                  </div>
                  {s.averageRating > 0 && (
                    <div className="flex items-center gap-1 mt-2 text-sm text-surface-500">
                      <Star className="w-3.5 h-3.5 fill-warning-400 text-warning-400" /> {s.averageRating} ({s.totalReviews})
                    </div>
                  )}
                  <div className="flex gap-2 mt-4">
                    <Link to={`/spots/${s._id}`} className="flex-1"><Button variant="secondary" size="sm" className="w-full"><Settings className="w-3.5 h-3.5" /> View</Button></Link>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(s._id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
