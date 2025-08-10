import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("education-system");

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
    const newUser = {
      name,
      email,
      password: hashedPassword,
      role: "user", // default role
      createdAt: new Date(),
    };

    await db.collection("users").insertOne(newUser);

    return NextResponse.json({ message: "Signup successful" }, { status: 201 });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
