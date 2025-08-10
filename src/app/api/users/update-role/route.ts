//src/app/api/users/update-role/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const { userId, role } = await req.json();

    if (!["student", "teacher", "admin"].includes(role)) {
      return NextResponse.json({ message: "Invalid role" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("education-system");

    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { role } }
    );

    return NextResponse.json({ message: "Role updated successfully" });
  } catch {
    return NextResponse.json({ message: "Error updating role" }, { status: 500 });
  }
}
