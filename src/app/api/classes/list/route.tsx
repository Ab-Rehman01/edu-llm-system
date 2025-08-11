// src/app/api/classes/list/route.ts
// src/app/api/classes/list/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("education-system");
    const classes = await db.collection("classes").find({}).toArray();

    return NextResponse.json({ classes }); // Notice this return shape
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 });
  }
}
