import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, type, meetingNumber, password, joinUrl, startTime } = body;

    if (!title || !type) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("meetingsDB");
    const collection = db.collection("meetings");

    const meeting = {
      title,                 // Meeting topic
      type,                  // "zoom" | "jitsi"
      meetingNumber: meetingNumber || null,
      password: password || null,
      joinUrl: joinUrl || null,  // <---- Add this for Zoom/Jitsi links
      startTime: startTime || new Date(),
      createdAt: new Date(),
    };

    await collection.insertOne(meeting);

    return NextResponse.json({ success: true, meeting });
  } catch (error) {
    console.error("Error adding meeting:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}