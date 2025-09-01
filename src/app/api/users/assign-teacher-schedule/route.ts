// src/app/api/users/assign-teacher-sch/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const { studentId, teacherId, schedule } = await req.json();

    const client = await clientPromise;
    const db = client.db("education-system");

    // Schedule ek array ke form me save hoga
   await db.collection("users").updateOne(
  { _id: new ObjectId(studentId) },
  { $push: { schedule: { $each: schedule } }, $set: { teacherId: new ObjectId(teacherId) } }
);

    return NextResponse.json({ message: "Teacher + Schedule assigned successfully" });
  } catch (err) {
    console.error("Error assigning schedule:", err);
    return NextResponse.json({ message: "Error assigning schedule" }, { status: 500 });
  }
}