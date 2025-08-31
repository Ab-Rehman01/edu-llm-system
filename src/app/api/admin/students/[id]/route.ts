// app/api/admin/students/[id]/route.ts
// app/api/admin/students/[id]/route.ts
import { NextResponse } from "next/server"

type Params = {
  params: { id: string }
}

// GET /api/admin/students/[id]
export async function GET(req: Request, { params }: Params) {
  try {
    const student = {
      id: params.id,
      name: "Ali",
      class: "10th",
      email: "ali@example.com",
    }

    return NextResponse.json(student, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: "Admin: Failed to fetch student" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/students/[id]
export async function DELETE(req: Request, { params }: Params) {
  try {
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