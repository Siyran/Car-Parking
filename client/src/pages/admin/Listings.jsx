import { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { MapPin, Check, X } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function AdminListings() {
  const [spots, setSpots] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [filter]);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getSpots({ status: filter || undefined });
      setSpots(data.spots);
    } catch { toast.error('Failed'); }
    setLoading(false);
  };

  const handleApprove = async (id, action) => {
    try {
      await adminAPI.approveSpot(id, action);
      toast.success(`Spot ${action}d`);
      load();
    } catch { toast.error('Failed'); }
  };

  const statusVariant = { pending: 'warning', approved: 'success', rejected: 'danger' };

  return (
    <div className="pt-20 min-h-screen bg-surface-50">
      <div className="max-w-5xl mx-auto px-4 pb-12">
        <h1 className="text-2xl font-bold text-surface-900 mb-6">Parking Listings</h1>

        <div className="flex gap-2 mb-4">
          {['pending', 'approved', 'rejected', ''].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f ? 'bg-primary-100 text-primary-700' : 'text-surface-500 hover:bg-surface-100'}`}>
              {f || 'All'}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" style={{ animation: 'spin 1s linear infinite' }} /></div>
          ) : spots.length === 0 ? (
            <div className="text-center py-12 text-surface-400"><p>No listings found</p></div>
          ) : spots.map(s => (
            <Card key={s._id}>
              <div className="p-5 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-surface-800">{s.title}</h3>
                    <Badge variant={statusVariant[s.status]}>{s.status}</Badge>
                  </div>
                  <p className="text-xs text-surface-500 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" />{s.address}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-surface-500">
                    <span>{formatCurrency(s.pricePerHour)}/hr</span>
                    <span>{s.totalSlots} slots</span>
                    <span>Owner: {s.owner?.name}</span>
                  </div>
                  <p className="text-xs text-surface-400 mt-1">Listed {formatDate(s.createdAt)}</p>
                </div>
                {s.status === 'pending' && (
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="success" onClick={() => handleApprove(s._id, 'approve')}><Check className="w-4 h-4" /> Approve</Button>
                    <Button size="sm" variant="danger" onClick={() => handleApprove(s._id, 'reject')}><X className="w-4 h-4" /> Reject</Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
