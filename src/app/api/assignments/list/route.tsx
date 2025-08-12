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
  if (ObjectId.isValid(classId)) {
    query = { $or: [{ classId }, { classId: new ObjectId(classId) }] };
  } else {
    query = { classId };
  }
}
    //       { classId: classId }, // string match
    //       ...(ObjectId.isValid(classId) ? [{ classId: new ObjectId(classId) }] : [])
    //     ]
    //   };
    // }

    const assignments = await db.collection("assignments").find(query).toArray();

    const formatted = assignments.map((a) => ({
      _id: a._id.toString(),
      classId: typeof a.classId === "string" ? a.classId : a.classId.toString(),
      url: a.url,
      public_id: a.public_id,
      filename: a.filename,
      uploadedAt: a.uploadedAt,
    }));

    return NextResponse.json({ assignments: formatted });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 });
  }
}