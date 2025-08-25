///app/api/attendance/join/route.ts

import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { meetingId, studentId, studentName } = body;

    if (!meetingId || !studentId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("education-system");

    // Check if already joined (prevent duplicate join entries)
    const existing = await db.collection("attendance").findOne({ meetingId, studentId });

    if (existing) {
      return NextResponse.json({ message: "Already joined" }, { status: 200 });
    }

    const result = await db.collection("attendance").insertOne({
      meetingId,
      studentId,
      studentName: studentName || "Unknown",
      joinTime: new Date(),
      leaveTime: null,
      durationMs: null,
    });

    return NextResponse.json({ message: "Join recorded", result }, { status: 201 });
  } catch (error) {
    console.error("Join Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}