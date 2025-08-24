// src/app/api/meetings/add/route.ts
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json(); // { classId, date, time, topic, joinUrl }
    const client = await clientPromise;
    const db = client.db("education-system");

    const result = await db.collection("meetings").insertOne({
      ...data,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, meetingId: result.insertedId });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Failed to save meeting" }, { status: 500 });
  }
}