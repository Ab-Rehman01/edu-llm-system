// src/app/api/meetings/list/route.ts
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");

    const client = await clientPromise;
    const db = client.db("education-system");

    const filter = classId ? { classId } : {};
    const meetings = await db
      .collection("meetings")
      .find(filter, {
        projection: {
          _id: 1,
          classId: 1,
          topic: 1,
          date: 1,
          time: 1,
          joinUrl: 1,
          joinUrlZoom: 1,
          joinUrlJitsi: 1,
          createdBy: 1,
          createdAt: 1,
        },
      })
      .sort({ date: 1, time: 1 })
      .toArray();

    return NextResponse.json({ meetings });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch meetings" },
      { status: 500 }
    );
  }
}