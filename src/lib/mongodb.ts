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

// -------- Helper functions --------

// insert document
export async function insertDoc(collection: string, doc: any) {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB); // apna DB name env me rakho
  return db.collection(collection).insertOne(doc);
}

// get documents
export async function getDocs(collection: string, query: any = {}) {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);
  return db.collection(collection).find(query).toArray();
}