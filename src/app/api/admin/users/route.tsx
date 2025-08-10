//src/app/api/admin/users/route.tsx
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import clientPromise from "@/lib/mongodb";
import { authOptions } from "@/lib/authOptions";

export const dynamic = "force-dynamic";

interface SessionUser {
  role?: string;
  [key: string]: unknown;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions, { req });

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
}
