// src/pages/api/attendance/report.ts
import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ msg: "Method not allowed" });

  try {
    const client = await clientPromise;
    const db = client.db("education-system");

    const { classId, month } = req.query;

    const filter: any = {};
    if (classId) filter.classId = classId;
    if (month) filter.date = { $regex: `^${month}` }; // e.g. "2025-08"

    const report = await db.collection("attendance").find(filter).toArray();

    res.status(200).json({ report });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}