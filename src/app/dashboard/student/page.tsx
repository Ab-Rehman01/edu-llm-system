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
  filename?: string;
  uploadedAt?: string; // ✅ Added
  subject?: string;    // ✅ Added (agar tum subject show karna chahte ho)
};
export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait until session is authenticated
    if (status === "loading") return;
    if (status !== "authenticated") {
      console.warn("User not authenticated");
      return;
    }
    if (!session?.user?.classId) {
      console.warn("No classId found in session");
      return;
    }

    console.log("Fetching assignments for classId:", session.user.classId);
    setLoading(true);

    fetch(`/api/assignments/list?classId=${session.user.classId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Assignments API Response:", data);
        setAssignments(data.assignments || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching assignments:", err);
        setLoading(false);
      });
  }, [status, session]);

  if (loading) return <p>Loading assignments...</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Student Dashboard</h1>
      <h2 className="mb-4">Assignments for your class</h2>
      <ul>
  {assignments.length === 0 && <li>No assignments found.</li>}
{assignments.map((a) => (
  <li key={a._id} className="mb-2">
    <a
      href={a.url} // ✅ Cloudinary ya file ka direct URL
      target="_blank"
      rel="noreferrer"
      className="text-blue-600 hover:underline"
    >
      {a.subject || a.filename || "Assignment"} 
      {a.uploadedAt && (
        <span className="text-gray-500 text-sm ml-2">
          ({new Date(a.uploadedAt).toLocaleDateString()})
        </span>
      )}
    </a>
  </li>
))}

</ul>
    </div>
  );
}