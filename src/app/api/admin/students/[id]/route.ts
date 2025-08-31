// app/api/admin/students/[id]/route.ts
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params

    // Dummy fetch example
    const student = {
      id,
      name: "Ali Raza",
      class: "10th",
      email: "ali.raza@example.com",
    }

    return NextResponse.json({ success: true, data: student })
  } catch (error) {
    console.error("Error fetching student:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch student" },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params
    const body = await req.json()

    // Dummy update example
    const updatedStudent = { id, ...body }

    return NextResponse.json({ success: true, data: updatedStudent })
  } catch (error) {
    console.error("Error updating student:", error)
    return NextResponse.json(
      { success: false, message: "Failed to update student" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params

    // Dummy delete example
    return NextResponse.json({
      success: true,
      message: `Student with id ${id} deleted`,
    })
  } catch (error) {
    console.error("Error deleting student:", error)
    return NextResponse.json(
      { success: false, message: "Failed to delete student" },
      { status: 500 }
    )
  }
}