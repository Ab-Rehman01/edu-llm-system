//src/app/api/users/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("education-system");

    // Password hata kar users list la rahe hain
    const users = await db.collection("users").find({}, { projection: { password: 0 } }).toArray();

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
