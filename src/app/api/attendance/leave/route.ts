//app/api/attendance/leave/route.ts
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { meetingId, studentId } = body;

    if (!meetingId || !studentId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("education-system");

    const attendance = await db.collection("attendance").findOne({ meetingId, studentId });

    if (!attendance) {
      return NextResponse.json({ error: "Join record not found" }, { status: 404 });
    }

    const leaveTime = new Date();
    const durationMs = attendance.joinTime ? leaveTime.getTime() - new Date(attendance.joinTime).getTime() : null;

    const result = await db.collection("attendance").updateOne(
      { meetingId, studentId },
      { $set: { leaveTime, durationMs } }
    );

    return NextResponse.json({ message: "Leave recorded", result }, { status: 200 });
  } catch (error) {
    console.error("Leave Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}