// src/lib/mongodb.ts

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env.local");
}

if (process.env.NODE_ENV === "development") {
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(uri, options);
    (global as any)._mongoClientPromise = client.connect();
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

// ✅ helper functions
export async function insertDoc(collection: string, doc: any) {
  const client = await clientPromise;
  const db = client.db("education-system");
  return await db.collection(collection).insertOne(doc);
}

export async function getDocs(collection: string, query: any = {}) {
  const client = await clientPromise;
  const db = client.db("education-system");
  return await db.collection(collection).find(query).toArray();
}

// import { MongoClient } from "mongodb";

// const client = new MongoClient(process.env.MONGODB_URI!);

// let clientPromise: Promise<MongoClient>;

// if (process.env.NODE_ENV === "development") {
  //   a   ts-expect-error
 // if (!global._mongoClientPromise) {
    // a     ts-expect-error
   // global._mongoClientPromise = client.connect();
  //}
  // a  the rate  ts-expect-error
 // clientPromise = global._mongoClientPromise;
//} else {
//  clientPromise = client.connect();
//}

//export default clientPromise;

// -------- Helper functions --------

// insert document
//export async function insertDoc(collection: string, doc: any) {
  //const client = await clientPromise;
  //const db = client.db(process.env.MONGODB_DB); // apna DB name env me rakho
  //return db.collection(collection).insertOne(doc);
//}

// get documents
//export async function getDocs(collection: string, query: any = {}) {
  //const client = await clientPromise;
  //const db = client.db(process.env.MONGODB_DB);
  //return db.collection(collection).find(query).toArray();
//}