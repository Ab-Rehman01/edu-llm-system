//src/app/api/admin/users/route.tsx
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { unstable_getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await unstable_getServerSession(authOptions, req);
    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const client = await clientPromise;
    const users = await client.db("education-system").collection("users").find({}, { projection: { password: 0 } }).toArray();
    return NextResponse.json(users);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
