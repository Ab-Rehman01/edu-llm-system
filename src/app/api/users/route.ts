//src/app/api/users/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// ✅ GET: List all users
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("education-system");

    const users = await db.collection("users").find({}).toArray();

    return NextResponse.json({ users });
  } catch (err) {
    console.error("GET /api/users error:", err);
    return NextResponse.json({ message: "Error fetching users" }, { status: 500 });
  }
}

// ✅ POST: Create new user (signup)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, role = "student", classId, teacherId } = body;

    if (!name || !email) {
      return NextResponse.json({ message: "Name and email required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("education-system");

    const existing = await db.collection("users").findOne({ email });
    if (existing) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    const newUser = {
      name,
      email,
      role,
      classId: classId || null,
      teacherId: teacherId ? new ObjectId(teacherId) : null,
      schedule: [],
      createdAt: new Date(),
    };

    const result = await db.collection("users").insertOne(newUser);

    return NextResponse.json({ user: { ...newUser, _id: result.insertedId } });
  } catch (err) {
    console.error("POST /api/users error:", err);
    return NextResponse.json({ message: "Error creating user" }, { status: 500 });
  }
}


// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/authOptions";
// import clientPromise from "@/lib/mongodb";
// import { NextResponse } from "next/server";

// export async function GET() {
//   const session = await getServerSession(authOptions);

//   if (!session?.user?.email || !session.user.email.startsWith("admin")) {
//   return new Response("Unauthorized", { status: 403 });
// }

//   const client = await clientPromise;
//   const db = client.db("education-system");
//   const user = await db.collection("users").findOne({ email: session.user?.email });

//   return NextResponse.json(user);
// }
