import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { classId, date, time, topic, createdBy } = await req.json();
    const client = await clientPromise;
    const db = client.db("education-system");

    // 🔑 1. Zoom OAuth Access Token generate karo
    const tokenRes = await fetch("https://zoom.us/oauth/token", {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(
            process.env.ZOOM_CLIENT_ID + ":" + process.env.ZOOM_CLIENT_SECRET
          ).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body:
        "grant_type=account_credentials&account_id=" +
        process.env.ZOOM_ACCOUNT_ID,
    });

    const { access_token } = await tokenRes.json();

    // 🔑 2. Zoom Meeting Create karo
    const zoomRes = await fetch(`https://api.zoom.us/v2/users/me/meetings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic: topic || "Class Meeting",
        type: 2, // scheduled
        start_time: `${date}T${time}:00`,
        duration: 60,
        timezone: "Asia/Karachi",
        settings: {
          host_video: true,
          participant_video: true,
        },
      }),
    });

    const zoomData = await zoomRes.json();

    if (!zoomData.id) {
      throw new Error("Zoom meeting create failed: " + JSON.stringify(zoomData));
    }

    // 🔑 3. Save meeting in MongoDB
    const result = await db.collection("meetings").insertOne({
      classId,
      date,
      time,
      meetingId: zoomData.id,
      joinUrl: zoomData.join_url,
      password: zoomData.password,
      createdBy,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      id: result.insertedId,
      zoom: zoomData,
    });
  } catch (error) {
    console.error("Create meeting error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create meeting" },
      { status: 500 }
    );
  }
}