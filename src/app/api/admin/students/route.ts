//app/api/admin/students/route.ts
import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("education-system")

    const students = await db.collection("students").find({}).toArray()

    return NextResponse.json(students, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: "Admin: Failed to fetch students" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const client = await clientPromise
    const db = client.db("education-system")

    const body = await req.json()
    body.createdAt = new Date() // auto timestamp

    const result = await db.collection("students").insertOne(body)

    return NextResponse.json(
      { message: "Student created", student: { _id: result.insertedId, ...body } },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: "Admin: Failed to create student" },
      { status: 500 }
    )
  }
}