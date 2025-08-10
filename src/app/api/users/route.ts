//src/app/api/users/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import clientPromise from "@/lib/mongodb";
import { authOptions } from "@/lib/authOptions";

interface UserWithRole {
  role?: string;
  [key: string]: any;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as UserWithRole;

  if (!session || user.role !== "admin") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db("education-system");

  const users = await db
    .collection("users")
    .find({}, { projection: { password: 0 } })
    .toArray();

  return new Response(JSON.stringify(users));
}
