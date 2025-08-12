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

interface Assignment {
  _id: string;
  url: string;
  filename?: string;
  classId: string;
}

export default function StudentDashboard() {
  const { data: session } = useSession();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

useEffect(() => {
  const classId = session?.user?.classId ?? "";
  if (!classId) return;

  async function fetchAssignments() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/assignments/list?classId=${classId}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to fetch assignments");

      setAssignments(data.assignments || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  fetchAssignments();
}, [session]);

  if (loading) return <p>Loading assignments...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Assignments for Your Class</h1>

      {assignments.length === 0 && <p>No assignments found for your class.</p>}

      <ul>
        {assignments.map((assignment) => (
          <li key={assignment._id} className="mb-2">
            <button
              onClick={() => setSelectedAssignment(assignment)}
              className="text-blue-600 underline"
            >
              {assignment.filename || "View Assignment"}
            </button>
          </li>
        ))}
      </ul>

      {selectedAssignment && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">
            Viewing: {selectedAssignment.filename}
          </h2>

          {selectedAssignment.url.endsWith(".pdf") && (
            <iframe
              src={selectedAssignment.url}
              className="w-full h-[600px] border"
              title={selectedAssignment.filename}
            />
          )}

          {(selectedAssignment.url.endsWith(".jpg") ||
            selectedAssignment.url.endsWith(".jpeg") ||
            selectedAssignment.url.endsWith(".png") ||
            selectedAssignment.url.endsWith(".gif")) && (
            <img
              src={selectedAssignment.url}
              alt={selectedAssignment.filename}
              className="max-w-full h-auto border"
            />
          )}

          {(selectedAssignment.url.endsWith(".mp4") ||
            selectedAssignment.url.endsWith(".webm") ||
            selectedAssignment.url.endsWith(".ogg")) && (
            <video controls className="w-full max-h-[600px] border">
              <source src={selectedAssignment.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}

          {!selectedAssignment.url.match(/\.(pdf|jpg|jpeg|png|gif|mp4|webm|ogg)$/) && (
            <a href={selectedAssignment.url} target="_blank" rel="noopener noreferrer">
              Download File
            </a>
          )}
        </div>
      )}
    </div>
  );
}
