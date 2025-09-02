//src/app/api/users/list/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// ✅ Get all users
export async function GET() {
  const client = await clientPromise;
  const db = client.db("education-system");

  const users = await db.collection("users").find({}).toArray();
  return NextResponse.json({ users });
}

// ✅ Add new user (agar zaroorat ho)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const client = await clientPromise;
    const db = client.db("education-system");

    const result = await db.collection("users").insertOne(body);

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (err) {
    console.error("POST /api/users/list error:", err);
    return NextResponse.json(
      { success: false, message: "Error creating user" },
      { status: 500 }
    );
  }
}
//src/app/api/users/list/route.ts
// import { NextResponse } from "next/server";
// import clientPromise from "@/lib/mongodb";

// export async function GET() {
//   try {
//     const client = await clientPromise;
//     const db = client.db("education-system");
//     const users = await db.collection("users").find().toArray();

//     return NextResponse.json({ users });
//   } catch {
//     return NextResponse.json({ message: "Failed to fetch users" }, { status: 500 });
//   }
// }