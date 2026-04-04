import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

import User from '../models/User.js';
import ParkingSpot from '../models/ParkingSpot.js';
import Booking from '../models/Booking.js';
import Transaction from '../models/Transaction.js';
import Review from '../models/Review.js';

export const seedData = async () => {
  // SAFETY: Only seed if the database is completely empty.
  // This prevents wiping user-created data on restart.
  const existingUsers = await User.countDocuments();
  if (existingUsers > 0) {
    console.log('  ℹ️  Database already has data. Skipping seed.');
    return;
  }

  console.log('  📦 Empty database detected. Seeding initial sample data...');

  const password = await bcrypt.hash('password123', 10);

  const admin = await User.create({
    name: 'Admin User', email: 'admin@parkflow.com', phone: '9000000001',
    password, role: 'admin', isVerified: true
  });

  const owner1 = await User.create({
    name: 'Rajesh Kumar', email: 'rajesh@parkflow.com', phone: '9000000002',
    password, role: 'owner', aadhaarNumber: '1234-5678-9012',
    upiId: 'rajesh@upi', isVerified: true
  });

  const owner2 = await User.create({
    name: 'Priya Sharma', email: 'priya@parkflow.com', phone: '9000000003',
    password, role: 'owner', aadhaarNumber: '2345-6789-0123',
    upiId: 'priya@upi', isVerified: true
  });

  const user1 = await User.create({
    name: 'Amit Patel', email: 'amit@parkflow.com', phone: '9000000004',
    password, role: 'user', isVerified: true
  });

  const user2 = await User.create({
    name: 'Sneha Gupta', email: 'sneha@parkflow.com', phone: '9000000005',
    password, role: 'user', isVerified: true
  });

  // Srinagar, J&K location spots
  const spots = await ParkingSpot.insertMany([
    {
      owner: owner1._id, title: 'Lal Chowk Secure Parking',
      description: 'Well-lit underground parking near Lal Chowk. 24/7 CCTV surveillance with trained security guards. Walking distance to major shops and markets.',
      address: 'Lal Chowk, Srinagar, J&K 190001',
      location: { type: 'Point', coordinates: [74.7973, 34.0837] },
      pricePerHour: 40, totalSlots: 10, availableSlots: 7,
      amenities: ['CCTV', 'Covered', 'Security Guard'],
      vehicleTypes: ['car', 'bike'], status: 'approved', isActive: true,
      averageRating: 4.5, totalReviews: 12
    },
    {
      owner: owner1._id, title: 'Dal Gate Parking Hub',
      description: 'Open parking near Dal Gate with scenic views. Walking distance to Boulevard Road, Nehru Park, and Dal Lake houseboats.',
      address: 'Dal Gate, Boulevard Road, Srinagar, J&K 190001',
      location: { type: 'Point', coordinates: [74.8560, 34.0902] },
      pricePerHour: 30, totalSlots: 15, availableSlots: 12,
      amenities: ['Open Air', 'Night Lights', 'Wide Spaces'],
      vehicleTypes: ['car', 'bike', 'suv'], status: 'approved', isActive: true,
      averageRating: 4.0, totalReviews: 8
    },
    {
      owner: owner2._id, title: 'Rajbagh Premium Garage',
      description: 'Premium covered garage in Rajbagh near Bund. Valet service available on weekends. Well-maintained and safe.',
      address: 'Rajbagh, Srinagar, J&K 190008',
      location: { type: 'Point', coordinates: [74.8196, 34.0762] },
      pricePerHour: 60, totalSlots: 8, availableSlots: 5,
      amenities: ['Covered', 'CCTV', 'Valet', 'Restroom'],
      vehicleTypes: ['car', 'suv'], status: 'approved', isActive: true,
      averageRating: 4.8, totalReviews: 25
    },
    {
      owner: owner2._id, title: 'Batmaloo Budget Parking',
      description: 'Budget-friendly parking near Batmaloo. Great for daily commuters heading to the city center.',
      address: 'Batmaloo, Srinagar, J&K 190009',
      location: { type: 'Point', coordinates: [74.7820, 34.0750] },
      pricePerHour: 20, totalSlots: 20, availableSlots: 18,
      amenities: ['Open Air', 'Easy Access'],
      vehicleTypes: ['car', 'bike', 'suv', 'truck'], status: 'approved', isActive: true,
      averageRating: 3.8, totalReviews: 6
    },
    {
      owner: owner1._id, title: 'Hazratbal Parking Zone',
      description: 'Spacious parking near Hazratbal Shrine and University of Kashmir campus. Perfect for visitors and students.',
      address: 'Hazratbal, Srinagar, J&K 190006',
      location: { type: 'Point', coordinates: [74.8393, 34.1260] },
      pricePerHour: 25, totalSlots: 30, availableSlots: 25,
      amenities: ['Open Air', 'Security Guard', 'Night Lights'],
      vehicleTypes: ['car', 'bike'], status: 'approved', isActive: true,
      averageRating: 4.2, totalReviews: 18
    },
    {
      owner: owner2._id, title: 'Sonwar Bagh Parking',
      description: 'Quiet residential parking in Sonwar area near Shankaracharya Hill. Perfect for overnight stays.',
      address: 'Sonwar Bagh, Srinagar, J&K 190001',
      location: { type: 'Point', coordinates: [74.8156, 34.0850] },
      pricePerHour: 30, totalSlots: 6, availableSlots: 4,
      amenities: ['Covered', 'Gate Lock', 'Overnight'],
      vehicleTypes: ['car', 'bike'], status: 'approved', isActive: true,
      averageRating: 4.0, totalReviews: 3
    },
    {
      owner: owner1._id, title: 'Parimpora Commercial Parking',
      description: 'Large open parking space near Parimpora fruit market. Ideal for commercial visitors.',
      address: 'Parimpora, Srinagar, J&K 190015',
      location: { type: 'Point', coordinates: [74.7470, 34.0980] },
      pricePerHour: 15, totalSlots: 40, availableSlots: 35,
      amenities: ['Open Air', 'Night Lights', 'Security Guard'],
      vehicleTypes: ['car', 'bike', 'suv', 'truck'], status: 'pending', isActive: true
    }
  ]);

  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const booking1 = await Booking.create({
    user: user1._id, spot: spots[0]._id,
    startTime: new Date(now - 2 * 60 * 60 * 1000),
    endTime: new Date(now - 1 * 60 * 60 * 1000),
    duration: 60, totalAmount: 40, status: 'completed',
    isPaid: false, billingMonth: month
  });

  const booking2 = await Booking.create({
    user: user2._id, spot: spots[2]._id,
    startTime: new Date(now - 3 * 60 * 60 * 1000),
    endTime: new Date(now - 0.5 * 60 * 60 * 1000),
    duration: 150, totalAmount: 180, status: 'completed',
    isPaid: false, billingMonth: month
  });

  await Booking.create({
    user: user1._id, spot: spots[1]._id,
    startTime: new Date(now - 5 * 60 * 60 * 1000),
    endTime: new Date(now - 3 * 60 * 60 * 1000),
    duration: 120, totalAmount: 60, status: 'completed',
    isPaid: true, billingMonth: month
  });

  await Transaction.insertMany([
    {
      booking: booking1._id, user: user1._id, owner: owner1._id,
      amount: 40, ownerShare: 24, platformShare: 16,
      type: 'booking', status: 'completed', month,
      description: 'Parking at Lal Chowk Secure Parking - 60 mins'
    },
    {
      booking: booking2._id, user: user2._id, owner: owner2._id,
      amount: 180, ownerShare: 108, platformShare: 72,
      type: 'booking', status: 'completed', month,
      description: 'Parking at Rajbagh Premium Garage - 150 mins'
    }
  ]);

  await Review.insertMany([
    { user: user1._id, spot: spots[0]._id, rating: 5, comment: 'Great parking spot! Well maintained and secure. Will use again.' },
    { user: user2._id, spot: spots[0]._id, rating: 4, comment: 'Good location, easy to find. Close to Lal Chowk market.' },
    { user: user1._id, spot: spots[2]._id, rating: 5, comment: 'Premium service, totally worth the price. Very safe area.' },
    { user: user2._id, spot: spots[1]._id, rating: 4, comment: 'Decent parking near Dal Gate. Very affordable for daily use.' }
  ]);

  console.log('  📧 Test Accounts:');
  console.log('     Admin:  admin@parkflow.com / password123');
  console.log('     Owner:  rajesh@parkflow.com / password123');
  console.log('     User:   amit@parkflow.com / password123');
};

// Allow running directly
const isDirectRun = process.argv[1]?.includes('seeder');
if (isDirectRun) {
  const connectDB = (await import('../config/db.js')).default;
  await connectDB();
  await seedData();
  console.log('\n✅ Seed complete!');
  process.exit(0);
}
