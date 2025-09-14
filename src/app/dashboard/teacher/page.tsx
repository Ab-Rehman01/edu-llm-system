
//dashboard/teacher


"use client";

import { useEffect, useState } from "react";
import RoleProtectedRoute from "@/components/RoleProtectedRoute";




type User = {
  _id: string;
  name: string;
  email: string;
  role: "teacher" | "student" | "admin";
  classId?: string;
};

type Assignment = {
  _id: string;
  subject: string;
  studentId: string;
  teacherId: string;
  filename?: string;
  url: string;
  uploadedAt: string;
};

export default function TeacherDashboard() {
  const [students, setStudents] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);

  // Fetch students assigned to this teacher
  useEffect(() => {
    fetch("/api/teacher/students")
      .then((res) => res.json())
      .then((data) => setStudents(data || []));
  }, []);

  // Fetch assignments for selected student
  const loadStudentAssignments = async (studentId: string) => {
    const res = await fetch(`/api/teacher/students/${studentId}/assignments`);
    const data = await res.json();
    setAssignments(data || []);
    const student = students.find((s) => s._id === studentId) || null;
    setSelectedStudent(student);
  };

  return (
    <RoleProtectedRoute allowedRoles={["teacher"]}>
      <div className="p-6 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Teacher Dashboard</h1>

        {/* Students Table */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <h2 className="text-xl font-semibold mb-4">Your Students</h2>
          {students.length === 0 ? (
            <p>No students assigned.</p>
          ) : (
            <table className="w-full border rounded">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Email</th>
                  <th className="border p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-50">
                    <td className="border p-2">{s.name}</td>
                    <td className="border p-2">{s.email}</td>
                    <td className="border p-2">
                      <button
                        className="text-blue-600 underline"
                        onClick={() => loadStudentAssignments(s._id)}
                      >
                        View Portal
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Selected Student Portal */}
        {selectedStudent && (
          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <h2 className="text-xl font-semibold mb-4">{selectedStudent.name}'s Assignments</h2>

            {assignments.length === 0 ? (
              <p>No assignments yet.</p>
            ) : (
              <table className="w-full border rounded">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2">Subject</th>
                    <th className="border p-2">File</th>
                    <th className="border p-2">Uploaded At</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a) => (
                    <tr key={a._id} className="hover:bg-gray-50">
                      <td className="border p-2">{a.subject}</td>
                      <td className="border p-2">
                        <a
                          href={a.url}
                          target="_blank"
                          className="text-blue-600 underline"
                        >
                          {a.filename || "View"}
                        </a>
                      </td>
                      <td className="border p-2">{new Date(a.uploadedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </RoleProtectedRoute>
  );
}
// "use client";
// import RoleProtectedRoute from "@/components/RoleProtectedRoute";

// export default function TeacherDashboard() {
//   return (
//     <RoleProtectedRoute allowedRoles={["teacher"]}>
//       <div className="p-6">
//         <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
//         <p>Yahan se aap students ko assignments de sakte ho.</p>
//       </div>
//     </RoleProtectedRoute>
//   );
// }
