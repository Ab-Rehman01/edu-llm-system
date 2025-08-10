//src/app/api/admin/users/route.tsx
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import clientPromise from "@/lib/mongodb";

interface SessionUser {
  role?: string;
  [key: string]: unknown;
}

export async function GET(req: NextRequest) {
  try {
    // Next.js 15 compatible getServerSession call (pass req, authOptions)
    const session = await getServerSession(req, authOptions);
    const user = session?.user as SessionUser | undefined;

    if (!session || user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("education-system");

    const users = await db
      .collection("users")
      .find({}, { projection: { password: 0 } })
      .toArray();

    return NextResponse.json(users);
  } catch (error) {
    console.error("API /admin/users error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
