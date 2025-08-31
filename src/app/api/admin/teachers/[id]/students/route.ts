// src/app/api/admin/teachers/[id]/students/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET all students under a teacher
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db("edu-llm");

    const students = await db
      .collection("students")
      .find({ teacherId: new ObjectId(params.id) })
      .toArray();

    return NextResponse.json(students);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch teacher's students" }, { status: 500 });
  }
}