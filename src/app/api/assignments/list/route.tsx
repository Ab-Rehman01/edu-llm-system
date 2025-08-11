// src/app/api/assignments/list/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  const client = await clientPromise;
  const db = client.db("education-system");
  const classes = await db.collection("classes").find({}).toArray();
  return NextResponse.json(classes);
}
