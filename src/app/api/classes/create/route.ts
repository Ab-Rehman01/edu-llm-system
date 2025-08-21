// src/app/api/classes/create/route.ts
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Class name is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("education-system");

    const result = await db.collection("classes").insertOne({
      name,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (err) {
    console.error("Error creating class:", err);
    return NextResponse.json({ error: "Failed to create class" }, { status: 500 });
  }
}