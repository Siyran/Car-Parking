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

    // Use MongoMemoryServer as a Replica Set for transaction support (ACID)
    const dbPath = path.resolve(__dirname, '..', '..', '.data', 'mongodb_repl');
    console.log(`🔧 Attempting to start local MongoDB Replica Set at ${dbPath}`);
    
    try {
      mongod = await MongoMemoryServer.create({
        instance: {
          dbPath,
          storageEngine: 'wiredTiger',
        },
        replSet: {
          count: 1,
          storageEngine: 'wiredTiger',
        }
      });
      uri = mongod.getUri();
      console.log('✅ Local MongoDB Replica Set started');
    } catch (replError) {
      console.warn(`⚠️  Replica Set failed to start: ${replError.message}. Falling back to standalone mode.`);
      console.warn('ℹ️  Note: Transactions will be disabled in standalone mode.');
      
      const standalonePath = path.resolve(__dirname, '..', '..', '.data', 'mongodb_standalone');
      mongod = await MongoMemoryServer.create({
        instance: {
          dbPath: standalonePath,
          storageEngine: 'wiredTiger',
        },
      });
      uri = mongod.getUri();
      console.log('✅ Local MongoDB Standalone started');
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000, // Faster timeout for better UX
    });
    console.log(`🚀 Connected to database: ${conn.connection.host}`);
    return conn;

  } catch (error) {
    console.error(`❌ MongoDB connection strategy failed: ${error.message}`);
    throw error; // Let the caller handle it (background process in app.js)
  }
};


export default connectDB;
