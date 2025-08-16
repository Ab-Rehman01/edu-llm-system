//src/app/api/meetings/create/route.ts

import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { classId, date, time, meetingLink, createdBy } = await req.json();
    const client = await clientPromise;
    const db = client.db("education-system");

    const result = await db.collection("meetings").insertOne({
      classId,
      date,
      time,
      meetingLink,
      createdBy,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Failed to create meeting" }, { status: 500 });
  }
}