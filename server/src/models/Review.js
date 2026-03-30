import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  spot: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingSpot', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, trim: true },
}, { timestamps: true });

reviewSchema.index({ spot: 1 });
reviewSchema.index({ user: 1, spot: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);
