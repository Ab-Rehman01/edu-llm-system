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
    console.log("ZOOM TOKEN RESPONSE ===>", tokenData);  // 👈 debug

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
        type: 2,
        start_time: `${date}T${time}:00Z`,
        duration: 60,
        settings: {
          host_video: true,
          participant_video: true,
        },
      }),
    });

    const meetingData = await meetingRes.json();
    console.log("ZOOM MEETING RESPONSE ===>", meetingData);  // 👈 debug

    if (!meetingData.join_url) {
      throw new Error("Failed to create Zoom meeting");
    }

    // 3. Save in MongoDB
   const result = await db.collection("meetings").insertOne({
  classId,
  date,
  time,
  meetingId: String(meetingData.id),   // 👈 convert to string
  joinUrl: meetingData.join_url,
  startUrl: meetingData.start_url,
  createdBy,
  createdAt: new Date(),
});

    return NextResponse.json({ success: true, id: result.insertedId, meetingData });
  } catch (error: any) {
    console.error("MEETING CREATE ERROR ===>", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create meeting" },
      { status: 500 }
    );
  }
}