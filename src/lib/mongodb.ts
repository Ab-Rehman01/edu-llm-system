// lib/mongodb.ts
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // @ts-ignore
  if (!global._mongoClientPromise) {
    // @ts-ignore
    global._mongoClientPromise = client.connect();
  }
  // @ts-ignore
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = client.connect();
}

export default clientPromise;
