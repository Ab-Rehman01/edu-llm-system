//src/app/api/assignments/upload/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getGridFSBucket } from "@/lib/gridfs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("assignment") as File | null;
  let classId = formData.get("classId") as string | null;

  // Teacher → auto assign from session
  if (session.user.role === "teacher") {
    classId = session.user.classId || null;
  }

  if (!file || !classId) {
    return NextResponse.json(
      { error: "File and classId required" },
      { status: 400 }
    );
  }

  const bucket = await getGridFSBucket();

  const uploadStream = bucket.openUploadStream(file.name, {
    metadata: {
      uploadedBy: session.user.email,
      role: session.user.role,
      classId,
    },
  });

  const arrayBuffer = await file.arrayBuffer();
  uploadStream.end(Buffer.from(arrayBuffer));

  return NextResponse.json({ filename: file.name });
}

