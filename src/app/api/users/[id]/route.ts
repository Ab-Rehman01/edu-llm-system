// src/app/api/users/[id]/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { role, classId, selectedDays } = body; // 👈 multiple fields catch kar liye

    const client = await clientPromise;
    const db = client.db("education-system");

    const updateFields: any = {};
    if (role !== undefined) updateFields.role = role;
    if (classId !== undefined) updateFields.classId = classId;
    if (selectedDays !== undefined) updateFields.selectedDays = selectedDays; // 👈 days bhi update

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateFields }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { message: "No changes were made (user not found or same data)" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "User updated successfully", updateFields });
  } catch (err) {
    console.error("PUT /api/users/[id] error:", err);
    return NextResponse.json(
      { message: "Error updating user", error: String(err) },
      { status: 500 }
    );
  }
}
