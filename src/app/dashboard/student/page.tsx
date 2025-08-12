//dashboard/student/page.tsx

"use client";
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
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

type Assignment = {
  _id: string;
  url: string;
  classId: string;
  title: string;
};

export default function StudentDashboard() {
  const { data: session } = useSession();
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    if (!session?.user?.classId) return;

    fetch(`/api/assignments/list?classId=${session.user.classId}`)
      .then(res => res.json())
      .then(data => setAssignments(data));
  }, [session]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Student Dashboard</h1>
      <h2>Assignments for your class</h2>
      <ul>
        {assignments.length === 0 && <li>No assignments found.</li>}
        {assignments.map(a => (
          <li key={a._id}>
            <a href={a.url} target="_blank" rel="noreferrer">{a.title || "Assignment Document"}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}