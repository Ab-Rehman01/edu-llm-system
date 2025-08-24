import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { meetingId, userId, action } = await req.json(); // action = "join" | "leave"
    const client = await clientPromise;
    const db = client.db("education-system");

    if (action === "join") {
      await db.collection("attendance").insertOne({
        meetingId,
        userId,
        joinTime: new Date(),
      });
    } else if (action === "leave") {
      await db.collection("attendance").updateOne(
        { meetingId, userId },
        { $set: { leaveTime: new Date() } }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Attendance error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}