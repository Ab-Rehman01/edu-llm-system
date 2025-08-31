//app/api/admin/students/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// GET all students
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("edu-llm");

    const students = await db.collection("students").find().toArray();


    return NextResponse.json(students);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}

// CREATE a student
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const client = await clientPromise;
    const db = client.db("edu-llm");

    await db.collection("students").insertOne(body);

    return NextResponse.json({ message: "Student created successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 });
  }
}