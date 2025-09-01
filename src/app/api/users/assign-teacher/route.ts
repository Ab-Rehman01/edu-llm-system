import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const { studentId, teacherId } = await req.json();

    const client = await clientPromise;
    const db = client.db("education-system");

    await db.collection("users").updateOne(
      { _id: new ObjectId(studentId) },
      { $set: { teacherId: new ObjectId(teacherId) } }
    );

    return NextResponse.json({ message: "Teacher assigned successfully" });
  } catch (err) {
    console.error("Error assigning teacher:", err);
    return NextResponse.json({ message: "Error assigning teacher" }, { status: 500 });
  }
}