// app/api/admin/students/[id]/route.ts
import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

type Params = { params: { id: string } }

export async function GET(req: Request, { params }: Params) {
  try {
    const client = await clientPromise
    const db = client.db("education-system")

    const student = await db
      .collection("students")
      .findOne({ _id: new ObjectId(params.id) })

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(student, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: "Admin: Failed to fetch student" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    const client = await clientPromise
    const db = client.db("education-system")

    const result = await db
      .collection("students")
      .deleteOne({ _id: new ObjectId(params.id) })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: `Student with id ${params.id} deleted` },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: "Admin: Failed to delete student" },
      { status: 500 }
    )
  }
}