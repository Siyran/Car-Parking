import mongoose from 'mongoose';

const parkingSpotSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  address: { type: String, required: true, trim: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  photos: [{ type: String }],
  pricePerHour: { type: Number, required: true, min: 0 },
  totalSlots: { type: Number, required: true, min: 1 },
  availableSlots: { type: Number, required: true, min: 0 },
  availability: {
    monday: { open: { type: String, default: '00:00' }, close: { type: String, default: '23:59' }, isOpen: { type: Boolean, default: true } },
    tuesday: { open: { type: String, default: '00:00' }, close: { type: String, default: '23:59' }, isOpen: { type: Boolean, default: true } },
    wednesday: { open: { type: String, default: '00:00' }, close: { type: String, default: '23:59' }, isOpen: { type: Boolean, default: true } },
    thursday: { open: { type: String, default: '00:00' }, close: { type: String, default: '23:59' }, isOpen: { type: Boolean, default: true } },
    friday: { open: { type: String, default: '00:00' }, close: { type: String, default: '23:59' }, isOpen: { type: Boolean, default: true } },
    saturday: { open: { type: String, default: '00:00' }, close: { type: String, default: '23:59' }, isOpen: { type: Boolean, default: true } },
    sunday: { open: { type: String, default: '00:00' }, close: { type: String, default: '23:59' }, isOpen: { type: Boolean, default: true } }
  },
  amenities: [{ type: String }],
  vehicleTypes: [{ type: String, enum: ['car', 'bike', 'suv', 'truck'] }],
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  isActive: { type: Boolean, default: true },
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 }
}, { timestamps: true });

parkingSpotSchema.index({ location: '2dsphere' });
parkingSpotSchema.index({ owner: 1 });
parkingSpotSchema.index({ status: 1, isActive: 1 });

export default mongoose.model('ParkingSpot', parkingSpotSchema);
