import { NextResponse } from "next/server"

// GET /api/students → get all students
export async function GET() {
  try {
    const students = [
      { id: 1, name: "Ali", class: "10th" },
      { id: 2, name: "Sara", class: "9th" },
    ]

    return NextResponse.json(students, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 })
  }
}

// POST /api/students → add new student
export async function POST(req: Request) {
  try {
    const body = await req.json()
    return NextResponse.json(
      { message: "Student created", student: body },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 })
  }
}