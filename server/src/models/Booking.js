import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  spot: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingSpot', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  duration: { type: Number, default: 0 }, // in minutes
  totalAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  isPaid: { type: Boolean, default: false },
  billingMonth: { type: String } // format: "2026-03"
}, { timestamps: true });

bookingSchema.index({ driver: 1, status: 1 });
bookingSchema.index({ spot: 1, status: 1 });
bookingSchema.index({ billingMonth: 1 });

export default mongoose.model('Booking', bookingSchema);
