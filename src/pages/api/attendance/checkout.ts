// src/pages/api/attendance/checkout.ts
import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ msg: "Method not allowed" });

  try {
    const client = await clientPromise;
    const db = client.db("education-system");

    const { userId } = req.body;
    const today = new Date().toISOString().split("T")[0];

    const record = await db.collection("attendance").findOne({ userId, date: today });
    if (!record) return res.status(404).json({ msg: "No check-in found" });

    const checkOutTime = new Date();
    const checkInTime = new Date(`${today}T${record.checkIn}:00`);

    const totalHours = Math.round((checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60));

    const update = {
      $set: {
        checkOut: checkOutTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        totalHours,
      },
    };

    await db.collection("attendance").updateOne({ _id: record._id }, update);

    res.status(200).json({ msg: "Checked out successfully", ...update.$set });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}