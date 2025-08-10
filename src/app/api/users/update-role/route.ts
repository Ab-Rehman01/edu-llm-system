import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";


export async function POST(req: Request) {
  try {
    const { userId, role } = await req.json();

    if (!["student", "teacher", "admin"].includes(role)) {
      return NextResponse.json({ message: "Invalid role" }, { status: 400 });
    }

    const client = await clientPromise;   // connection ko await karein
    const db = client.db("education-system");

    // MongoDB native driver se update karen
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { role } }
    );

    return NextResponse.json({ message: "Role updated successfully" });
  } catch (error) {
    return NextResponse.json({ message: "Error updating role" }, { status: 500 });
  }
}
