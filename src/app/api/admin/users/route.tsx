import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import clientPromise from "@/lib/mongodb";
import { authOptions } from "@/lib/authOptions";  // sirf ye import chahiye

export async function GET() {
  const session = await getServerSession(authOptions);  // authOptions use karein

  // Access check
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db("education-system");

  // Hide password field
  const users = await db
    .collection("users")
    .find({}, { projection: { password: 0 } })
    .toArray();

  return NextResponse.json(users);
}
