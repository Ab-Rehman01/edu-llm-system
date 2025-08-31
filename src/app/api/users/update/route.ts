//api/users/update/route
// src/app/api/users/update/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const { userId, role, classId, teacherId } = await req.json();

    if (!userId) {
      return NextResponse.json({ message: "Missing userId" }, { status: 400 });
    }

    const updateFields: any = {};

    // role validation
    if (role) {
      if (!["student", "teacher", "admin"].includes(role)) {
        return NextResponse.json({ message: "Invalid role" }, { status: 400 });
      }
      updateFields.role = role;
    }

    // classId update
    if (classId !== undefined) {
      updateFields.classId = classId || null; // null means no class
    }

    // teacherId update
    if (teacherId !== undefined) {
      updateFields.teacherId = teacherId ? new ObjectId(teacherId) : null;
    }

    const client = await clientPromise;
    const db = client.db("education-system");

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateFields }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { message: "User not found or no changes made" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ message: "Error updating user" }, { status: 500 });
  }
}