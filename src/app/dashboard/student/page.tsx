//dashboard/student/page.tsx


// import RoleProtectedRoute from "@/components/RoleProtectedRoute";

// export default function StudentDashboard() {
//   return (
//     <RoleProtectedRoute allowedRoles={["student"]}>
//       <div className="p-6">
//         <h1 className="text-3xl font-bold">Student Dashboard</h1>
//         <p>Yahan apke assignments show honge.</p>
//       </div>
//     </RoleProtectedRoute>
//   );
// }

//dashboard/student/page.tsx
"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

type Assignment = {
  _id: string;
  url: string;
  filename?: string;
  subject: string;
  uploadedAt: string;
};

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (status !== "authenticated") return;
    if (!session?.user?.classId) return;

    fetch(`/api/assignments/list?classId=${session.user.classId}`)
      .then(res => res.json())
      .then(data => {
        setAssignments(data.assignments || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [status, session]);

  if (loading) return <p>Loading assignments...</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Student Dashboard</h1>
      <h2 className="mb-4">Assignments for your class</h2>
      <ul>
        {assignments.length === 0 && <li>No assignments found.</li>}
        {assignments.map((a) => (
          <li key={a._id} className="mb-3 border-b pb-2">
            <strong>Subject:</strong> {a.subject} <br />
            <strong>Uploaded At:</strong> {new Date(a.uploadedAt).toLocaleString()} <br />
            <a href={a.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
              {a.filename || "View Assignment"}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}