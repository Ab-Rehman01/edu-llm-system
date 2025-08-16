// pages/api/attendance/checkin.ts
import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ msg: "Method not allowed" });

  try {
    const client = await clientPromise;
    const db = client.db("education-system");

    const { userId, classId } = req.body;
    const today = new Date().toISOString().split("T")[0]; // yyyy-mm-dd

    // Check if already checked in
    const existing = await db.collection("attendance").findOne({ userId, date: today });
    if (existing) return res.status(400).json({ msg: "Already checked in" });

    const record = {
      userId,
      classId,
      date: today,
      checkIn: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "Present",
      checkOut: null,
      totalHours: 0,
      remarks: "",
    };

    await db.collection("attendance").insertOne(record);

    res.status(200).json({ msg: "Checked in successfully", record });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}