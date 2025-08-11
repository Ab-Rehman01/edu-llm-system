// src/lib/gridfs.ts
// src/lib/gridfs.ts
import clientPromise from "@/lib/mongodb";
import { GridFSBucket } from "mongodb";

export async function getGridFSBucket() {
  const client = await clientPromise;
  const db = client.db(); // Default DB from MONGODB_URI
  return new GridFSBucket(db, { bucketName: "assignments" });
}
