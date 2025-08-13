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
import { ObjectId } from "mongodb";

export async function GET(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("education-system");

    const url = new URL(req.url);
    const classId = url.searchParams.get("classId");

    let query: any = {};
    if (classId) {
      // ✅ Match both ObjectId and string values in DB
      try {
        query = {
          $or: [
            { classId: classId.toString() },
            { classId: new ObjectId(classId) }
          ]
        };
      } catch {
        // Agar classId invalid ObjectId ho, to sirf string compare kare
        query = { classId: classId.toString() };
      }
    }

    const assignments = await db.collection("assignments").find(query).toArray();

const formatted = assignments.map((a) => ({
  _id: a._id.toString(),
  classId: a.classId?.toString(),
  url: a.url,
  public_id: a.public_id,
  filename: a.filename,
  subject: a.subject || "", // ✅ Added
  uploadedAt: a.uploadedAt,
}));
//   uploadedAt: a.uploadedAt ? new Date(a.uploadedAt).toISOString() : null, // ✅ Always send string
// }));

    return NextResponse.json({ assignments: formatted });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 });
  }
}