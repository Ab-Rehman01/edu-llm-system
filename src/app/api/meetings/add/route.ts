import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { meetingNumber, password, topic, date, time, classId } = body;

    if (!meetingNumber || !topic || !date || !time || !classId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("education-system");

    const result = await db.collection("meetings").insertOne({
      meetingNumber,
      password: password || "",
      topic,
      date,
      time,
      classId,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (err) {
    console.error("Error creating meeting:", err);
    return NextResponse.json(
      { error: "Failed to create meeting" },
      { status: 500 }
    );
  }
}