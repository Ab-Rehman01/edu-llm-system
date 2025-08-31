//app/api/admin/assign/route.tsx

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { studentId, teacherIds = [], scheduleDays = [], rollNumber } = await req.json();

    if (!studentId || !Array.isArray(teacherIds)) {
      return NextResponse.json({ error: "studentId & teacherIds required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("education-system");

    await db.collection("users").updateOne(
      { _id: new ObjectId(studentId), role: "student" },
      {
        $set: {
          teacherIds: teacherIds.map((id: string) => new ObjectId(id)),
          scheduleDays,
          ...(rollNumber ? { rollNumber } : {}),
        },
      }
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("admin/assign error", e);
    return NextResponse.json({ error: "Failed to assign" }, { status: 500 });
  }
}