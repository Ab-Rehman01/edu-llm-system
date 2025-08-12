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
  classId: string;
  title?: string;
};

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return; // wait for session load
    if (!session?.user?.classId) {
      setLoading(false);
      return;
    }

    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/assignments/list?classId=${session.user.classId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch assignments");
        }

        setAssignments(data.assignments || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [session, status]);

  if (loading) return <p>Loading assignments...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Student Dashboard</h1>
      <h2 className="mb-4">Assignments for your class</h2>

      <ul>
        {assignments.length === 0 && <li>No assignments found.</li>}
        {assignments.map((a) => (
          <li key={a._id} className="mb-2">
            <a href={a.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">
              {a.title || "Assignment Document"}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}