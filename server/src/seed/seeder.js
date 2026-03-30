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
  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    ParkingSpot.deleteMany({}),
    Booking.deleteMany({}),
    Transaction.deleteMany({}),
    Review.deleteMany({})
  ]);

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

  const driver1 = await User.create({
    name: 'Amit Patel', email: 'amit@parkflow.com', phone: '9000000004',
    password, role: 'driver', isVerified: true
  });

  const driver2 = await User.create({
    name: 'Sneha Gupta', email: 'sneha@parkflow.com', phone: '9000000005',
    password, role: 'driver', isVerified: true
  });

  const spots = await ParkingSpot.insertMany([
    {
      owner: owner1._id, title: 'MG Road Secure Parking',
      description: 'Well-lit underground parking near MG Road metro station. 24/7 CCTV surveillance with trained security guards. Walking distance to Commercial Street and Brigade Road.',
      address: '45, MG Road, Bangalore 560001',
      location: { type: 'Point', coordinates: [77.6070, 12.9752] },
      pricePerHour: 40, totalSlots: 10, availableSlots: 7,
      amenities: ['CCTV', 'Covered', 'Security Guard', 'EV Charging'],
      vehicleTypes: ['car', 'bike'], status: 'approved', isActive: true,
      averageRating: 4.5, totalReviews: 12
    },
    {
      owner: owner1._id, title: 'Koramangala Hub Parking',
      description: 'Open parking lot in the heart of Koramangala. Walking distance to restaurants, cafes, and shopping centers. Well-lit at night.',
      address: '88, 4th Block, Koramangala, Bangalore 560034',
      location: { type: 'Point', coordinates: [77.6239, 12.9352] },
      pricePerHour: 30, totalSlots: 15, availableSlots: 12,
      amenities: ['Open Air', 'Night Lights', 'Wide Spaces'],
      vehicleTypes: ['car', 'bike', 'suv'], status: 'approved', isActive: true,
      averageRating: 4.0, totalReviews: 8
    },
    {
      owner: owner2._id, title: 'Indiranagar Premium Garage',
      description: 'Premium covered garage in Indiranagar with car wash facility. Valet service available on weekends. Air-conditioned waiting area.',
      address: '12, 100 Feet Road, Indiranagar, Bangalore 560038',
      location: { type: 'Point', coordinates: [77.6408, 12.9784] },
      pricePerHour: 60, totalSlots: 8, availableSlots: 5,
      amenities: ['Covered', 'CCTV', 'Car Wash', 'Valet', 'Restroom', 'AC Lounge'],
      vehicleTypes: ['car', 'suv'], status: 'approved', isActive: true,
      averageRating: 4.8, totalReviews: 25
    },
    {
      owner: owner2._id, title: 'HSR Layout Budget Parking',
      description: 'Budget-friendly parking near HSR Layout main road. Great for daily commuters. Easy access from Outer Ring Road.',
      address: '27th Main, HSR Layout Sector 1, Bangalore 560102',
      location: { type: 'Point', coordinates: [77.6369, 12.9116] },
      pricePerHour: 20, totalSlots: 20, availableSlots: 18,
      amenities: ['Open Air', 'Easy Access'],
      vehicleTypes: ['car', 'bike', 'suv', 'truck'], status: 'approved', isActive: true,
      averageRating: 3.8, totalReviews: 6
    },
    {
      owner: owner1._id, title: 'Whitefield IT Park Parking',
      description: 'Multi-level parking structure near ITPL. Ideal for office goers with monthly pass options. Shuttle service to nearby tech parks.',
      address: 'ITPL Main Road, Whitefield, Bangalore 560066',
      location: { type: 'Point', coordinates: [77.7480, 12.9698] },
      pricePerHour: 35, totalSlots: 50, availableSlots: 35,
      amenities: ['Covered', 'CCTV', 'Elevator', 'Security Guard', 'Shuttle'],
      vehicleTypes: ['car', 'bike'], status: 'approved', isActive: true,
      averageRating: 4.2, totalReviews: 18
    },
    {
      owner: owner2._id, title: 'Jayanagar Residential Parking',
      description: 'Quiet residential parking in Jayanagar 4th Block. Perfect for overnight stays. Gated with individual key access.',
      address: '11th Cross, 4th Block Jayanagar, Bangalore 560041',
      location: { type: 'Point', coordinates: [77.5820, 12.9250] },
      pricePerHour: 25, totalSlots: 6, availableSlots: 4,
      amenities: ['Covered', 'Gate Lock', 'Overnight'],
      vehicleTypes: ['car', 'bike'], status: 'approved', isActive: true,
      averageRating: 4.0, totalReviews: 3
    },
    {
      owner: owner1._id, title: 'Electronic City Phase 1',
      description: 'Large open parking space near Infosys campus. Ideal for tech professionals.',
      address: 'Electronic City Phase 1, Bangalore 560100',
      location: { type: 'Point', coordinates: [77.6600, 12.8500] },
      pricePerHour: 15, totalSlots: 30, availableSlots: 28,
      amenities: ['Open Air', 'Night Lights', 'Security Guard'],
      vehicleTypes: ['car', 'bike', 'suv'], status: 'pending', isActive: true
    }
  ]);

  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const booking1 = await Booking.create({
    driver: driver1._id, spot: spots[0]._id,
    startTime: new Date(now - 2 * 60 * 60 * 1000),
    endTime: new Date(now - 1 * 60 * 60 * 1000),
    duration: 60, totalAmount: 40, status: 'completed',
    isPaid: false, billingMonth: month
  });

  const booking2 = await Booking.create({
    driver: driver2._id, spot: spots[2]._id,
    startTime: new Date(now - 3 * 60 * 60 * 1000),
    endTime: new Date(now - 0.5 * 60 * 60 * 1000),
    duration: 150, totalAmount: 180, status: 'completed',
    isPaid: false, billingMonth: month
  });

  await Booking.create({
    driver: driver1._id, spot: spots[1]._id,
    startTime: new Date(now - 5 * 60 * 60 * 1000),
    endTime: new Date(now - 3 * 60 * 60 * 1000),
    duration: 120, totalAmount: 60, status: 'completed',
    isPaid: true, billingMonth: month
  });

  await Transaction.insertMany([
    {
      booking: booking1._id, driver: driver1._id, owner: owner1._id,
      amount: 40, ownerShare: 24, platformShare: 16,
      type: 'booking', status: 'completed', month,
      description: 'Parking at MG Road Secure Parking - 60 mins'
    },
    {
      booking: booking2._id, driver: driver2._id, owner: owner2._id,
      amount: 180, ownerShare: 108, platformShare: 72,
      type: 'booking', status: 'completed', month,
      description: 'Parking at Indiranagar Premium Garage - 150 mins'
    }
  ]);

  await Review.insertMany([
    { driver: driver1._id, spot: spots[0]._id, rating: 5, comment: 'Great parking spot! Well maintained and secure. Will use again.' },
    { driver: driver2._id, spot: spots[0]._id, rating: 4, comment: 'Good location, easy to find. Slightly narrow entrance.' },
    { driver: driver1._id, spot: spots[2]._id, rating: 5, comment: 'Premium service, totally worth the price. Car wash was a bonus!' },
    { driver: driver2._id, spot: spots[1]._id, rating: 4, comment: 'Decent open parking. Very affordable for daily use.' }
  ]);

  console.log('  📧 Test Accounts:');
  console.log('     Admin:  admin@parkflow.com / password123');
  console.log('     Owner:  rajesh@parkflow.com / password123');
  console.log('     Driver: amit@parkflow.com / password123');
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
