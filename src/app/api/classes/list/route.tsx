// src/app/api/classes/list/route.ts
// src/app/api/classes/list/route.ts
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("yourDatabaseName");
    const classes = await db.collection("classes").find({}).toArray();

    return Response.json({ classes });
  } catch (error) {
    console.error("Error fetching classes:", error);
    return Response.json({ error: "Failed to fetch classes" }, { status: 500 });
  }
}