// src/app/api/users/[id]/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { role, classId } = await req.json();
    const client = await clientPromise;
    const db = client.db("education-system");

    const updateFields: any = {};
    if (role) updateFields.role = role;
    if (classId) updateFields.classId = classId;

    await db.collection("users").updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateFields }
    );

    return NextResponse.json({ message: "User updated successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Error updating user" }, { status: 500 });
  }
}