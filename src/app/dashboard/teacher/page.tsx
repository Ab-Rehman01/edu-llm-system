
//dashboard/teacher
"use client";
import RoleProtectedRoute from "@/components/RoleProtectedRoute";

export default function TeacherDashboard() {
  return (
    <RoleProtectedRoute allowedRoles={["teacher"]}>
      <div className="p-6">
        <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
        <p>Yahan se aap students ko assignments de sakte ho.</p>
      </div>
    </RoleProtectedRoute>
  );
}
