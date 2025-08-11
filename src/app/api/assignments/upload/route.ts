//src/app/api/assignments/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getGridFSBucket } from "@/lib/gridfs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !["admin", "teacher"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const classId = formData.get("classId")?.toString();

  if (!file || !classId) {
    return NextResponse.json({ error: "File and classId required" }, { status: 400 });
  }

  const bucket = await getGridFSBucket();
  const uploadStream = bucket.openUploadStream(file.name, {
    metadata: {
      uploaderId: session.user.id,
      classId,
      uploadedAt: new Date(),
    },
  });

  const buffer = Buffer.from(await file.arrayBuffer());
  uploadStream.end(buffer);

  return NextResponse.json({ message: "File uploaded successfully" });
}
