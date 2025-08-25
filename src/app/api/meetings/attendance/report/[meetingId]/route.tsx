
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { meetingId: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db("education-system");

    const records = await db
      .collection("attendance")
      .find({ meetingId: params.meetingId })
      .toArray();

    const report = records.map((r: any) => {
      let duration = null;
      if (r.joinTime && r.leaveTime) {
        duration = Math.round(
          (new Date(r.leaveTime).getTime() - new Date(r.joinTime).getTime()) / 60000
        );
      }
      return {
        studentId: r.studentId,
        joinTime: r.joinTime,
        leaveTime: r.leaveTime,
        duration,
      };
    });

    return NextResponse.json(report);
  } catch (e: any) {  // 👈 fix
    console.error("Report Error:", e);
    return NextResponse.json(
      { error: e.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}