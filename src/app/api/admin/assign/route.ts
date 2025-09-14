//app/api/admin/assign/route.tsx
import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST(req: Request) {
  try {
    const client = await clientPromise
    const db = client.db("yourDBName")
    const body = await req.json()

    const { studentId, teacherId, days, startTime, endTime } = body

    // Save schedule in DB
    const result = await db.collection("studentSchedules").insertOne({
      studentId,
      teacherId,
      days,
      startTime,
      endTime,
      createdAt: new Date(),
    })

    return NextResponse.json({ message: "Schedule assigned", result }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to assign schedule" }, { status: 500 })
  }
}