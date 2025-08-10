//src/app/api/admin/users/route.tsx
// src/app/api/admin/users/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db("education-system");

  const users = await db.collection("users").find({}, { projection: { password: 0 } }).toArray();

  return NextResponse.json(users);
}
