import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { topic, type, meetingNumber, password, joinUrlZoom, joinUrlJitsi, startTime, classId } = body;

    if (!topic) {
  return NextResponse.json({ error: "Missing topic" }, { status: 400 });
}


    const client = await clientPromise;
    const db = client.db("meetingsDB");
    const collection = db.collection("meetings");

    const meeting = {
  title: topic,
  type: type || (joinUrlZoom ? "zoom" : "jitsi"),
  meetingNumber: meetingNumber || null,
  password: password || null,
  joinUrlZoom: joinUrlZoom || null,
  joinUrlJitsi: joinUrlJitsi || null,
  classId,
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