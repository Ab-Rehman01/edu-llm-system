// src/app/api/assignment/[id]/route.ts
import { NextRequest } from "next/server";
import { getGridFSBucket } from "@/lib/gridfs";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const bucket = await getGridFSBucket();
  const stream = bucket.openDownloadStream(new ObjectId(params.id));

return new Response(stream as unknown as BodyInit, {

    headers: { "Content-Type": "application/octet-stream" },
  });
}
