import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mongod = null;

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;

    // Check if we can connect to an external MongoDB
    if (uri) {
      try {
        const conn = await mongoose.connect(uri);
        console.log(`✅ MongoDB connected: ${conn.connection.host}`);
        return conn;
      } catch (err) {
        console.log('⚠️  External MongoDB unavailable. Falling back to local storage...');
      }
    }

    // Use MongoMemoryServer as a Replica Set for transaction support
    const dbPath = path.resolve(__dirname, '..', '..', '.data', 'mongodb');
    console.log(`🔧 Starting local MongoDB Replica Set at ${dbPath}`);
    
    mongod = await MongoMemoryServer.create({
      instance: {
        dbPath,
        storageEngine: 'wiredTiger',
      },
      replSet: {
        count: 1, // Single-node replica set is sufficient for transactions
        storageEngine: 'wiredTiger',
      }
    });
    uri = mongod.getUri();

    const conn = await mongoose.connect(uri);
    console.log(`✅ Local MongoDB Replica Set started: ${conn.connection.host}`);

    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
