//api/auth/signup/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.collection("users").insertOne({
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
