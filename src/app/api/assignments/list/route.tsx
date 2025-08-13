// src/app/api/assignments/list/route.ts
// src/app/api/assignments/list/route.ts
// import { NextResponse } from "next/server";
// import clientPromise from "@/lib/mongodb";

// export async function GET() {
//   try {
//     const client = await clientPromise;
//     const db = client.db("education-system");
//     // Assignments collection se saare assignments fetch karo
//     const assignments = await db.collection("assignments").find({}).toArray();
    
//     return NextResponse.json(assignments);
//   } catch (error) {
//     return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 });
//   }
// }
// src/app/api/assignments/list/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("education-system");

    const url = new URL(req.url);
    const classId = url.searchParams.get("classId");

    const query = classId ? { classId } : {};

    const assignments = await db.collection("assignments").find(query).toArray();

    const formatted = assignments.map(a => ({
      _id: a._id.toString(),
      classId: a.classId,
      url: a.url,
      filename: a.filename,
      subject: a.subject,
      uploadedAt: a.uploadedAt,
    }));

    return NextResponse.json({ assignments: formatted });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 });
  }
}