// src/app/api/users/[id]/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

// ✅ UPDATE user
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !session.user.email.startsWith("admin")) {
      return new Response("Unauthorized", { status: 403 });
    }

    const body = await req.json();
    const { role, classId, teacherId, schedule } = body;

    const client = await clientPromise;
    const db = client.db("education-system");

    const updateFields: any = {};
    if (role !== undefined) updateFields.role = role;
    if (classId !== undefined) updateFields.classId = classId;
    if (teacherId !== undefined) updateFields.teacherId = new ObjectId(teacherId);

    let result;
    if (schedule && Array.isArray(schedule) && schedule.length > 0) {
      result = await db.collection("users").updateOne(
        { _id: new ObjectId(params.id) },
        { $set: updateFields, $push: { schedule: { $each: schedule } } }
      );
    } else {
      result = await db.collection("users").updateOne(
        { _id: new ObjectId(params.id) },
        { $set: updateFields }
      );
    }

    if (result.modifiedCount === 0) {
      return NextResponse.json({ message: "No changes were made" }, { status: 404 });
    }

    return NextResponse.json({ message: "User updated successfully" });
  } catch (err) {
    console.error("PUT /api/users/[id] error:", err);
    return NextResponse.json({ message: "Error updating user" }, { status: 500 });
  }
}

// ✅ DELETE user
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !session.user.email.startsWith("admin")) {
      return new Response("Unauthorized", { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db("education-system");

    const result = await db.collection("users").deleteOne({ _id: new ObjectId(params.id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/users/[id] error:", err);
    return NextResponse.json({ message: "Error deleting user" }, { status: 500 });
  }
}