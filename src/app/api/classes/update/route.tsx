// /app/api/classes/update/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const { id, name } = await req.json();

    if (!id || !name) {
      return NextResponse.json({ error: "ID and name are required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("education-system");

    const result = await db.collection("classes").updateOne(
      { _id: new ObjectId(id) }, // ✅ ensure ObjectId conversion
      { $set: { name } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, updatedId: id });
  } catch (error) {
    console.error("Update class error:", error);
    return NextResponse.json({ error: "Failed to update class" }, { status: 500 });
  }
}