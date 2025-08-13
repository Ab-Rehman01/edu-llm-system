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
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

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
      <h1 className="text-3xl font-bold mb-4">Student Dashboard</h1>
      <h2 className="mb-4">Assignments for your class</h2>

      {assignments.length === 0 && <p>No assignments found.</p>}

      <ul>
        {assignments.map(a => (
          <li key={a._id} className="mb-3 border-b pb-2">
            <strong>Subject:</strong> {a.subject} <br />
            <strong>Uploaded At:</strong> {new Date(a.uploadedAt).toLocaleString()} <br />
            <button
              onClick={() => setSelectedAssignment(a)}
              className="text-blue-600 hover:underline"
            >
              {a.filename || "View Assignment"}
            </button>
          </li>
        ))}
      </ul>

      {selectedAssignment && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">
            Viewing: {selectedAssignment.filename}
          </h2>
          <p className="text-gray-600 mb-2">
            <strong>Uploaded At:</strong>{" "}
            {new Date(selectedAssignment.uploadedAt).toLocaleString()}
          </p>

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
            <p>
              File type not supported for inline view.{" "}
              <a href={selectedAssignment.url} target="_blank" rel="noopener noreferrer">
                Download
              </a>
            </p>
          )}
        </div>
      )}
    </div>
  );
}