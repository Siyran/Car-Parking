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
    <div className="pt-36 min-h-screen bg-surface-950 selection:bg-primary-500 relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 map-grid opacity-10 pointer-events-none" />
      
      <div className="max-w-[1240px] mx-auto px-8 w-full pb-24 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 border-b border-white/5 pb-10">
          <div className="space-y-4">
             <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary-600/10 border border-primary-500/20 text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] w-fit">
                <MapPin className="w-3.5 h-3.5" />
                Space Management
             </div>
             <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter leading-none">
                My <span className="gradient-text italic text-glow">Listings</span>.
             </h1>
          </div>
          <Link to="/owner/add-spot">
             <Button size="lg" className="!rounded-[1.5rem] px-8 py-5 text-sm font-black uppercase tracking-widest shadow-glow flex items-center gap-3">
                <Plus className="w-5 h-5" /> List My Space
             </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : spots.length === 0 ? (
          <div className="text-center py-24 glass-dark border border-white/5 rounded-[3rem]">
            <Settings className="w-20 h-20 mx-auto mb-8 text-surface-600 opacity-20 animate-pulse" />
            <p className="text-2xl font-black text-white italic uppercase tracking-tighter mb-4">No Spaces Found</p>
            <p className="text-xs font-bold text-surface-500 uppercase tracking-[0.2em] mb-8">No parking infrastructure linked to your account.</p>
            <Link to="/owner/add-spot"><Button variant="primary">Initialize First Space</Button></Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {spots.map(s => (
              <Card key={s._id} className="group glass-dark border border-white/5 hover:border-primary-500/20 rounded-[2.5rem] overflow-hidden transition-all hover:bg-white/[0.02]">
                <div className="h-48 relative overflow-hidden bg-surface-900">
                  {s.photos?.[0] ? (
                    <img src={s.photos[0]} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-10"><MapPin className="w-12 h-12" /></div>
                  )}
                  <div className="absolute top-5 right-5">
                     <Badge variant={statusVariant[s.status]} className="!rounded-lg px-3 py-1 text-[8px] font-black uppercase text-glow backdrop-blur-md">
                        {s.status}
                     </Badge>
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter leading-none group-hover:text-primary-400 transition-colors truncate pr-4">{s.title}</h3>
                  </div>
                  <div className="flex items-center gap-3 mb-6">
                    <MapPin className="w-3.5 h-3.5 text-surface-600 group-hover:text-primary-400 transition-colors" />
                    <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest truncate">{s.address}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mb-8 pt-6 border-t border-white/5">
                    <div className="flex flex-col gap-1">
                       <span className="text-[10px] font-black text-surface-600 uppercase tracking-widest leading-none">Rate / Pulse</span>
                       <span className="text-2xl font-black text-white italic tracking-tighter">{formatCurrency(s.pricePerHour).split('.')[0]}<span className="text-xs font-bold text-surface-500 uppercase tracking-widest ml-1">/hr</span></span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                       <span className="text-[10px] font-black text-surface-600 uppercase tracking-widest leading-none">Occupancy</span>
                       <span className="text-sm font-black text-white italic uppercase tracking-tighter">{s.availableSlots} / {s.totalSlots} Slots</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Link to={`/spots/${s._id}`} className="flex-1">
                       <Button variant="secondary" className="w-full !rounded-xl py-4 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-white/5">
                          <Settings className="w-4 h-4 mr-2" /> Interface
                       </Button>
                    </Link>
                    <Button variant="danger" className="!rounded-xl p-4 transition-all hover:bg-danger-500/20" onClick={() => handleDelete(s._id)}>
                       <Trash2 className="w-4 h-4" />
                    </Button>
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
