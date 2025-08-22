//src/app/api/meetings/attendance/route.ts

import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      meetingId, classId, userId,
      joinTime, leaveTime, durationMs
    } = body;

    if (!meetingId || !userId || !joinTime) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("education-system");

    await db.collection("meeting_attendance").insertOne({
      meetingId,
      classId,
      userId,
      joinTime: new Date(joinTime),
      leaveTime: leaveTime ? new Date(leaveTime) : null,
      durationMs: typeof durationMs === "number" ? durationMs : null,
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to save attendance" }, { status: 500 });
  }
}