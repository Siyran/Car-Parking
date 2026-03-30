import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod = null;

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;

    // If no external MongoDB URI or connection fails, use in-memory MongoDB
    if (!uri || uri.includes('localhost') || uri.includes('127.0.0.1')) {
      console.log('🔧 Starting built-in MongoDB (no installation needed)...');
      mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
    }

    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    // Fallback to in-memory if external connection fails
    if (!mongod) {
      console.log('⚠️  External MongoDB unavailable. Starting built-in database...');
      mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`✅ Built-in MongoDB started: ${conn.connection.host}`);
      return conn;
    }
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
