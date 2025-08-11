// src/app/api/assignment/[id]/route.ts
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getGridFSBucket } from "@/lib/gridfs";
import { Readable } from "node:stream";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bucket = await getGridFSBucket();
  const fileId = new ObjectId(params.id);

  const file = await bucket.find({ _id: fileId }).next();
  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  // Access control
  if (
    session.user.role !== "admin" &&
    file.metadata?.classId !== session.user.classId
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const downloadStream = bucket.openDownloadStream(fileId);
  const webStream = Readable.toWeb(downloadStream) as ReadableStream<Uint8Array>;

  return new Response(webStream, {
    headers: {
      "Content-Type": file.contentType || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${file.filename}"`,
    },
  });
}
