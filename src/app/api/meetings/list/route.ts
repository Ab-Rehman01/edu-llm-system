//src/app/api/meetings/list/route.ts

import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("classId");

  const client = await clientPromise;
  const db = client.db("education-system");

  const meetings = await db
    .collection("meetings")
    .find(classId ? { classId } : {})
    .sort({ date: 1, time: 1 })
    .toArray();

  return NextResponse.json({ meetings });
}