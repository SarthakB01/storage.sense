import { MongoClient } from 'mongodb';

// Check for the MongoDB URI
if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing WFVERVGQERVERVERVQEREVV environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // Use a global variable in development to preserve client
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // Create a new client for production
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export the client promise
export default clientPromise;
