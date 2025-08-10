//src/app/api/users/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || !session.user.email.startsWith("admin")) {
  return new Response("Unauthorized", { status: 403 });
}

  const client = await clientPromise;
  const db = client.db("education-system");
  const user = await db.collection("users").findOne({ email: session.user?.email });

  return NextResponse.json(user);
}
