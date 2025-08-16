

// pages/api/meetings/index.ts
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");

    const client = await clientPromise;
    const db = client.db("yourDB");

    const meetings = await db
      .collection("meetings")
      .find({ classId })
      .sort({ date: 1, time: 1 })
      .toArray();

    return NextResponse.json({ meetings });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch meetings" }, { status: 500 });
  }
}