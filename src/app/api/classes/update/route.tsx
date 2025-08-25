// /app/api/classes/update/route.ts
// /api/classes/update/route.ts
// src/app/api/classes/update/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body; // id alag nikal lo, baki update data rehne do

    if (!id) {
      return NextResponse.json(
        { error: "Class ID is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("education-system");

    const result = await db.collection("classes").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Class updated successfully",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { error: "Failed to update class" },
      { status: 500 }
    );
  }
}