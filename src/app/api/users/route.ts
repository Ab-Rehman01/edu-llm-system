//src/app/api/users/route.ts
// /src/app/api/users/route.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import clientPromise from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    const res = new NextResponse();

    const session = await getServerSession(req as any, res as any, authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("education-system");

    const users = await db.collection("users").find({}, { projection: { password: 0 } }).toArray();

    return NextResponse.json(users);
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
