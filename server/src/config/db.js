import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mongod = null;

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;

    // Check if we can connect to an external MongoDB
    if (uri) {
      try {
        console.log(`📡 Testing connection to external MongoDB: ${uri}`);
        const conn = await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 2000, // Fail fast if external Mongo is down
        });
        console.log(`✅ External MongoDB connected: ${conn.connection.host}`);
        return conn;
      } catch (err) {
        console.log(`⚠️  External MongoDB (${uri}) unreachable: ${err.message}`);
        console.log('🔄 Falling back to local internal storage...');
        // Reset mongoose state for the next connection attempt
        await mongoose.disconnect();
      }
    }

    // Use MongoMemoryServer as a Replica Set for transaction support (ACID)
    const dbPath = path.resolve(__dirname, '..', '..', '.data', 'mongodb_repl');
    
    // Ensure the directory exists
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath, { recursive: true });
    }

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
      if (!fs.existsSync(standalonePath)) {
        fs.mkdirSync(standalonePath, { recursive: true });
      }

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
