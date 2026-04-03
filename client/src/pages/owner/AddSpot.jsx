import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { spotAPI } from '../../api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { MapPin, Upload, Image, X, ChevronLeft, Plus, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';

function LocationPicker({ position, setPosition }) {
  const map = useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    }
  });

  return position ? <Marker position={position} /> : null;
}

function MapRecenter({ position }) {
  const map = useMapEvents({});
  if (position) map.setView(position, 16);
  return null;
}

export default function AddSpot() {
  const navigate = useNavigate();
  const fileRef = useRef();
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', address: '', totalSlots: '',
    amenities: '', vehicleTypes: ['car']
  });
  const [locating, setLocating] = useState(false);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        setLocating(false);
        toast.success('Location detected!');
      },
      (err) => {
        setLocating(false);
        toast.error('Failed to get your location. Please check permissions.');
      }
    );
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setPhotos(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const removePhoto = (i) => {
    setPhotos(photos.filter((_, idx) => idx !== i));
    setPreviews(previews.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!position) { toast.error('Please drop a pin on the map'); return; }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('address', form.address);
      formData.append('latitude', position[0]);
      formData.append('longitude', position[1]);
      formData.append('totalSlots', form.totalSlots);
      formData.append('amenities', JSON.stringify(form.amenities.split(',').map(s => s.trim()).filter(Boolean)));
      formData.append('vehicleTypes', JSON.stringify(form.vehicleTypes));
      photos.forEach(p => formData.append('photos', p));

      await spotAPI.create(formData);
      toast.success('Parking spot added successfully!');
      navigate('/owner/listings');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add spot');
    }
    setLoading(false);
  };

  return (
    <div className="pt-36 min-h-screen bg-surface-950 relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 map-grid opacity-10 pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-8 w-full pb-24 relative z-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-surface-500 hover:text-white mb-8 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        
        <div className="flex items-center gap-4 mb-10">
           <div className="w-12 h-12 rounded-2xl bg-primary-600/10 border border-primary-500/20 flex items-center justify-center text-primary-400 shadow-glow">
              <Plus className="w-6 h-6" />
           </div>
           <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
              List My <span className="gradient-text italic text-glow">Space</span>.
           </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <Card className="glass-dark border-white/5 overflow-hidden">
            <div className="p-8 space-y-8">
              <h2 className="text-xs font-black text-surface-500 uppercase tracking-[0.4em] mb-4">Core Identification</h2>
              <Input label="Space Title" placeholder="e.g., MG Road Secure Parking" value={form.title} onChange={set('title')} required />
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-surface-500 mb-2.5 ml-1">Operational Description</label>
                <textarea className="w-full h-32 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-4 text-sm text-white placeholder:text-surface-600 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all duration-300 outline-none resize-none"
                  placeholder="Describe your parking space..." value={form.description} onChange={set('description')} />
              </div>
              <Input label="Geospatial Address" icon={MapPin} placeholder="Full physical address" value={form.address} onChange={set('address')} required />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input label="Space Capacity (Slots)" type="number" placeholder="10" value={form.totalSlots} onChange={set('totalSlots')} required min="1" />
                <Input label="Base Rate / Hour" type="number" placeholder="50" value={form.pricePerHour} onChange={set('pricePerHour')} required min="1" icon={IndianRupee} />
              </div>
            </div>
          </Card>

          {/* Location */}
          <Card className="glass-dark border-white/5">
            <div className="p-8 space-y-6">
              <h2 className="text-xs font-black text-surface-500 uppercase tracking-[0.4em] mb-2">Coordinate Calibration (Click to drop pin)</h2>
              <div className="h-80 rounded-[2rem] overflow-hidden border border-white/10 relative shadow-inner">
                <MapContainer center={[12.9716, 77.5946]} zoom={13} className="h-full w-full dark-map-tiles">
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationPicker position={position} setPosition={setPosition} />
                  <MapRecenter position={position} />
                </MapContainer>
                
                <button type="button" onClick={handleUseMyLocation} disabled={locating}
                  className="absolute bottom-6 right-6 z-[1000] p-4 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl shadow-glow border border-primary-500/30 transition-all active:scale-95 disabled:opacity-50">
                  {locating ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <MapPin className="w-6 h-6" />}
                </button>
              </div>
              {position && (
                <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/[0.03] border border-white/5 w-fit">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   <p className="text-[10px] font-mono font-black text-primary-400 uppercase tracking-widest leading-none">Lat: {position[0].toFixed(6)} | Lng: {position[1].toFixed(6)}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Photos */}
          <Card className="glass-dark border-white/5">
            <div className="p-8 space-y-6">
              <h2 className="text-xs font-black text-surface-500 uppercase tracking-[0.4em] mb-4">Visual Telemetry</h2>
              <div className="flex flex-wrap gap-5">
                {previews.map((p, i) => (
                  <div key={i} className="relative w-32 h-32 rounded-[1.5rem] overflow-hidden border border-white/10 shadow-2xl group">
                    <img src={p} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <button type="button" onClick={() => removePhoto(i)} className="absolute top-2 right-2 p-2 bg-danger-500/80 rounded-xl text-white backdrop-blur-md transition-all hover:bg-danger-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="w-32 h-32 rounded-[1.5rem] border-2 border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center text-surface-500 hover:border-primary-500/40 hover:text-primary-400 hover:bg-primary-500/5 transition-all group">
                  <Upload className="w-6 h-6 mb-2 group-hover:-translate-y-1 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Interface</span>
                </button>
              </div>
              <input ref={fileRef} type="file" multiple accept="image/*" onChange={handlePhotos} className="hidden" />
            </div>
          </Card>

          {/* Extras */}
          <Card className="glass-dark border-white/5">
            <div className="p-8 space-y-8">
              <h2 className="text-xs font-black text-surface-500 uppercase tracking-[0.4em] mb-4">Subsystem Capability</h2>
              <Input label="Advanced Amenities (comma separated)" placeholder="CCTV, Covered, Security Guard" value={form.amenities} onChange={set('amenities')} />
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-surface-500 mb-4 ml-1">Vehicle Protocol Compatibility</label>
                <div className="flex flex-wrap gap-3">
                  {['car', 'bike', 'suv', 'truck'].map(v => (
                    <button key={v} type="button"
                      onClick={() => setForm({ ...form, vehicleTypes: form.vehicleTypes.includes(v) ? form.vehicleTypes.filter(x => x !== v) : [...form.vehicleTypes, v] })}
                      className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${form.vehicleTypes.includes(v) ? 'bg-primary-600 border-primary-500 text-white shadow-glow' : 'bg-white/[0.02] border-white/10 text-surface-500 hover:text-white'}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Button type="submit" loading={loading} className="w-full !rounded-[2rem] py-6 text-sm font-black uppercase tracking-[0.3em] shadow-glow" size="lg">Confirm Space Listing</Button>
        </form>
      </div>
    </div>
  );
}
