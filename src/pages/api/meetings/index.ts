

// pages/api/meetings/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = await clientPromise;
  const db = client.db("llms-system");

  if (req.method === "GET") {
    try {
      const { classId } = req.query;

      let query = {};
      if (classId) {
        query = { classId }; // sirf us class ke meetings
      }

      const meetings = await db.collection("meetings").find(query).toArray();
      res.status(200).json({ meetings });
    } catch (error) {
      res.status(500).json({ message: "Error fetching meetings", error });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}