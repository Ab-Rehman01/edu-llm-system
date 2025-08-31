//app/api/admin/students/route.ts
import { NextResponse } from "next/server"

// GET /api/admin/students → get all students with admin view
export async function GET() {
  try {
    const students = [
      { id: 1, name: "Ali", class: "10th", email: "ali@example.com" },
      { id: 2, name: "Sara", class: "9th", email: "sara@example.com" },
    ]

    return NextResponse.json(students, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Admin: Failed to fetch students" }, { status: 500 })
  }
}

// POST /api/admin/students → add student (admin only)
export async function POST(req: Request) {
  try {
    const body = await req.json()
    return NextResponse.json(
      { message: "Admin: Student created", student: body },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json({ error: "Admin: Failed to create student" }, { status: 500 })
  }
}