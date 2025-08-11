//src/app/api/users/list/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  const client = await clientPromise;
  const db = client.db("education-system");
  const classes = await db.collection("classes").find({}).toArray();

  // Response ko object me wrap kar rahe hain, jisse frontend me data.classes mile
  return NextResponse.json({ classes });
}
