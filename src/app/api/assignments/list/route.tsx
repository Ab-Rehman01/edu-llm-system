// src/app/api/assignments/list/route.ts
import { NextResponse } from "next/server";
import { getGridFSBucket } from "@/lib/gridfs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const bucket = await getGridFSBucket();
  const cursor = bucket.find({ "metadata.classId": session.user.classId });
  const files = await cursor.toArray();

  return NextResponse.json(files);
}

