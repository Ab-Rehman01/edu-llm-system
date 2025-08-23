import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { classId, date, time, createdBy } = await req.json();
    const client = await clientPromise;
    const db = client.db("education-system");

    // 1. Access Token from Zoom
    const tokenRes = await fetch(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
      {
        method: "POST",
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              process.env.ZOOM_CLIENT_ID + ":" + process.env.ZOOM_CLIENT_SECRET
            ).toString("base64"),
        },
      }
    );

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      throw new Error("Failed to get Zoom access token");
    }
    const accessToken = tokenData.access_token;

    // 2. Create Meeting via Zoom API
    const meetingRes = await fetch("https://api.zoom.us/v2/users/me/meetings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic: `Class Meeting - ${date} ${time}`,
        type: 2, // scheduled meeting
        start_time: `${date}T${time}:00Z`, // UTC time format
        duration: 60, // default 1 hour
        settings: {
          host_video: true,
          participant_video: true,
        },
      }),
    });

    const meetingData = await meetingRes.json();
    if (!meetingData.join_url) {
      console.error("Zoom API error:", meetingData);
      throw new Error("Failed to create Zoom meeting");
    }

    // 3. Save in MongoDB
    // const result = await db.collection("meetings").insertOne({
    //   classId,
    //   date,
    //   time,
    //   meetingId: meetingData.id,
    //   joinUrl: meetingData.join_url,
    //   startUrl: meetingData.start_url,
    //   createdBy,
    //   createdAt: new Date(),
    // });

    const result = await db.collection("meetings").insertOne({
  classId: "test-class",
  date: "2025-08-24",
  time: "11:01",
  meetingLink: "https://zoom.us/j/123456",
  createdBy: "admin",
  createdAt: new Date(),
});

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Failed to create meeting" },
      { status: 500 }
    );
  }
}