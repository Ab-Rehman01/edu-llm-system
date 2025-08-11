// src/app/api/assignments/list/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getGridFSBucket } from "@/lib/gridfs";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bucket = await getGridFSBucket();
  let query: Record<string, any> = {};

  if (session.user.role === "admin") {
    // Admin → sab files dekh sakta hai
    query = {};
  } else {
    // Teacher & Student → apni class ke assignments
    query = { "metadata.classId": session.user.classId };
  }

  const files = await bucket.find(query).toArray();
  return NextResponse.json(files);
}
