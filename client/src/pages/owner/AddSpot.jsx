import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { spotAPI } from '../../api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { MapPin, Upload, Image, X, ChevronLeft } from 'lucide-react';
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
    <div className="pt-20 min-h-screen bg-surface-50">
      <div className="max-w-3xl mx-auto px-4 pb-12">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-surface-500 hover:text-surface-700 mb-4">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-2xl font-bold text-surface-900 mb-6">Add Parking Spot</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card><div className="p-6 space-y-4">
            <h2 className="font-semibold text-surface-800">Basic Information</h2>
            <Input label="Spot Title" placeholder="e.g., MG Road Secure Parking" value={form.title} onChange={set('title')} required />
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Description</label>
              <textarea className="w-full rounded-xl border border-surface-200 px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/30 outline-none resize-none" rows={3}
                placeholder="Describe your parking space..." value={form.description} onChange={set('description')} />
            </div>
            <Input label="Address" icon={MapPin} placeholder="Full address" value={form.address} onChange={set('address')} required />
            <div className="grid grid-cols-1 gap-4">
              <Input label="Total Slots" type="number" placeholder="10" value={form.totalSlots} onChange={set('totalSlots')} required min="1" />
            </div>
          </div></Card>

          {/* Location */}
          <Card><div className="p-6 space-y-4">
            <h2 className="font-semibold text-surface-800">Location (Click to drop pin)</h2>
            <div className="h-64 rounded-xl overflow-hidden border border-surface-200 relative">
              <MapContainer center={[12.9716, 77.5946]} zoom={13} className="h-full w-full">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationPicker position={position} setPosition={setPosition} />
                <MapRecenter position={position} />
              </MapContainer>
              
              <button type="button" onClick={handleUseMyLocation} disabled={locating}
                className="absolute bottom-4 right-4 z-[1000] p-3 bg-white hover:bg-surface-50 text-primary-600 rounded-full shadow-lg border border-surface-200 transition-all active:scale-95 disabled:opacity-50">
                {locating ? <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" /> : <MapPin className="w-5 h-5" />}
              </button>
            </div>
            {position && (
              <p className="text-xs text-surface-500">📍 {position[0].toFixed(6)}, {position[1].toFixed(6)}</p>
            )}
          </div></Card>

          {/* Photos */}
          <Card><div className="p-6 space-y-4">
            <h2 className="font-semibold text-surface-800">Photos</h2>
            <div className="flex flex-wrap gap-3">
              {previews.map((p, i) => (
                <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-surface-200">
                  <img src={p} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removePhoto(i)} className="absolute top-1 right-1 p-1 bg-surface-900/60 rounded-full text-white">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-24 h-24 rounded-xl border-2 border-dashed border-surface-300 flex flex-col items-center justify-center text-surface-400 hover:border-primary-400 hover:text-primary-500 transition-all">
                <Upload className="w-5 h-5 mb-1" />
                <span className="text-[10px]">Upload</span>
              </button>
            </div>
            <input ref={fileRef} type="file" multiple accept="image/*" onChange={handlePhotos} className="hidden" />
          </div></Card>

          {/* Extras */}
          <Card><div className="p-6 space-y-4">
            <h2 className="font-semibold text-surface-800">Additional Details</h2>
            <Input label="Amenities (comma separated)" placeholder="CCTV, Covered, Security Guard" value={form.amenities} onChange={set('amenities')} />
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">Vehicle Types</label>
              <div className="flex flex-wrap gap-2">
                {['car', 'bike', 'suv', 'truck'].map(v => (
                  <button key={v} type="button"
                    onClick={() => setForm({ ...form, vehicleTypes: form.vehicleTypes.includes(v) ? form.vehicleTypes.filter(x => x !== v) : [...form.vehicleTypes, v] })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${form.vehicleTypes.includes(v) ? 'bg-primary-100 text-primary-700 border border-primary-200' : 'bg-surface-100 text-surface-500 border border-surface-200'}`}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div></Card>

          <Button type="submit" loading={loading} className="w-full" size="lg">Add Parking Spot</Button>
        </form>
      </div>
    </div>
  );
}
