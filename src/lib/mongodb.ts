// src/lib/mongodb.ts
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // @ts-expect-error
  if (!global._mongoClientPromise) {
    // @ts-expect-error
    global._mongoClientPromise = client.connect();
  }
  // @ts-expect-error
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = client.connect();
}

export default clientPromise;
