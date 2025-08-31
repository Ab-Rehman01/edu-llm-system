// app/api/admin/students/[id]/route.ts
// app/api/admin/students/[id]/route.ts
import { NextResponse } from "next/server"

// GET /api/admin/students/[id]
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const student = { id, name: "Ali", class: "10th", email: "ali@example.com" }

    return NextResponse.json(student, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: "Admin: Failed to fetch student" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/students/[id]
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    return NextResponse.json(
      { message: `Student with id ${id} deleted` },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: "Admin: Failed to delete student" },
      { status: 500 }
    )
  }
}