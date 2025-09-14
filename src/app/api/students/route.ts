//app/api/students/route.ts
import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("yourDBName")
    const students = await db.collection("students").find().toArray()

    return NextResponse.json(students, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 })
  }
}