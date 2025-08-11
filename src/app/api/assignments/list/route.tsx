// src/app/api/assignments/list/route.ts
// src/app/api/assignments/list/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("education-system");
    // Assignments collection se saare assignments fetch karo
    const assignments = await db.collection("assignments").find({}).toArray();
    
    return NextResponse.json(assignments);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 });
  }
}
