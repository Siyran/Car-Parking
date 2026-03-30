import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'owner', 'admin'], default: 'user' },
  aadhaarNumber: { type: String, trim: true },
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    bankName: String
  },
  upiId: { type: String, trim: true },
  avatar: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.index({ role: 1 });

export default mongoose.model('User', userSchema);
