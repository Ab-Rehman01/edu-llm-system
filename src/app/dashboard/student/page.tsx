"use client";
import RoleProtectedRoute from "@/components/RoleProtectedRoute";

export default function StudentDashboard() {
  return (
    <RoleProtectedRoute allowedRoles={["student"]}>
      <div className="p-6">
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <p>Yahan apke assignments show honge.</p>
      </div>
    </RoleProtectedRoute>
  );
}
