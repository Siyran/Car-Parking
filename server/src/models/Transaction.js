import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, required: true },
  ownerShare: { type: Number, required: true }, // 60%
  platformShare: { type: Number, required: true }, // 40%
  type: { type: String, enum: ['booking', 'payout', 'withdrawal'], required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  month: { type: String }, // "2026-03"
  description: { type: String, trim: true },
  paymentMethod: { type: String, default: 'simulated' }
}, { timestamps: true });

transactionSchema.index({ driver: 1, month: 1 });
transactionSchema.index({ owner: 1, month: 1 });
transactionSchema.index({ type: 1, status: 1 });

export default mongoose.model('Transaction', transactionSchema);
