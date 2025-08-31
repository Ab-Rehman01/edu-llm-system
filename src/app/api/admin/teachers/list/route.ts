import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// GET all teachers
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("edu-llm");

    const teachers = await db.collection("teachers").find({}).toArray();

    return NextResponse.json(teachers);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch teachers" }, { status: 500 });
  }
}