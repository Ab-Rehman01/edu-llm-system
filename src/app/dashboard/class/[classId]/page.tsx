//dashboard/class/[classid]/page.tsx
//dashboard/class/[classid]/page.tsx

// "use client";

// import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";

// interface Assignment {
//   _id: string;
//   url: string;
//   fileName?: string;
//   classId: string;
// }

// interface ClassItem {
//   _id: string;
//   name: string;
// }

// export default function ClassDashboard() {
//   const params = useParams();
//   const classId = params?.classId || "";
//   const [assignments, setAssignments] = useState<Assignment[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [className, setClassName] = useState<string>("");

//   // Fetch assignments for the class
//   useEffect(() => {
//     if (!classId) return;

//     async function fetchAssignments() {
//       setLoading(true);
//       setError(null);

//       try {
//         const res = await fetch(`/api/assignments/list?classId=${classId}`);
//         const data = await res.json();

//         if (!res.ok) {
//           throw new Error(data.error || "Failed to fetch assignments");
//         }

//         setAssignments(data.assignments || data);
//       } catch (err: any) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchAssignments();
//   }, [classId]);

//   // Fetch class name for heading
//   useEffect(() => {
//     if (!classId) return;

//     async function fetchClassName() {
//       try {
//         const res = await fetch(`/api/classes/list`);
//         const data = await res.json();
//         const cls = data.classes.find((c: ClassItem) => c._id === classId);
//         setClassName(cls?.name || "");
//       } catch {
//         setClassName("");
//       }
//     }

//     fetchClassName();
//   }, [classId]);

//   if (loading) return <p>Loading assignments...</p>;
//   if (error) return <p className="text-red-600">Error: {error}</p>;

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">
//         Assignments for Class: {className || classId}
//       </h1>

//       {assignments.length === 0 && <p>No assignments found for this class.</p>}

//       <ul>
//         {assignments.map((assignment) => (
//           <li key={assignment._id} className="mb-2">
//             <a
//               href={assignment.url}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="text-blue-600 underline"
//             >
//               {assignment.fileName || "View Assignment"}
//             </a>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

//dashboard/class/[classid]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Assignment {
  _id: string;
  url: string;
  fileName?: string;
  classId: string;
  subject: string;
  uploadedAt: string;
}

interface ClassItem {
  _id: string;
  name: string;
}

export default function ClassDashboard() {
  const params = useParams();
  const classId = params?.classId as string;
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [className, setClassName] = useState<string>("");

  useEffect(() => {
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
  }, [classId]);

  useEffect(() => {
    if (!classId) return;

    async function fetchClassName() {
      try {
        const res = await fetch(`/api/classes/list`);
        const data = await res.json();
        const cls = data.classes.find((c: ClassItem) => c._id === classId);
        if (cls) setClassName(cls.name);
      } catch (err) {
        console.error(err);
      }
    }

    fetchClassName();
  }, [classId]);

  if (loading) return <p>Loading assignments...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  const getFileIcon = (url: string) => {
    if (url.endsWith(".pdf")) return "📄";
    if (url.match(/\.(jpg|jpeg|png|gif)$/)) return "🖼️";
    if (url.match(/\.(mp4|webm|ogg)$/)) return "🎬";
    return "📎";
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Assignments for Class: {className || `Class ID: ${classId}`}
      </h1>

      {assignments.length === 0 && <p>No assignments found.</p>}

      <ul className="space-y-2">
        {assignments.map(a => (
          <li key={a._id} className="border p-2 rounded flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getFileIcon(a.url)}</span>
              <div>
                <strong>Subject:</strong> {a.subject} <br />
                <strong>Uploaded:</strong> {new Date(a.uploadedAt).toLocaleString()} <br />
                <button
                  onClick={() => setSelectedAssignment(a)}
                  className="text-blue-600 hover:underline mt-1"
                >
                  {a.fileName || "View Assignment"}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {selectedAssignment && (
        <div className="mt-6 border-t pt-4">
          <h2 className="text-xl font-semibold mb-2">
            Viewing: {selectedAssignment.fileName}
          </h2>
          <p className="text-gray-600 mb-2">
            <strong>Uploaded At:</strong>{" "}
            {new Date(selectedAssignment.uploadedAt).toLocaleString()}
          </p>

          {selectedAssignment.url.endsWith(".pdf") && (
            <iframe
              src={selectedAssignment.url}
              className="w-full h-[600px] border"
              title={selectedAssignment.fileName}
            />
          )}

          {selectedAssignment.url.match(/\.(jpg|jpeg|png|gif)$/) && (
            <img
              src={selectedAssignment.url}
              alt={selectedAssignment.fileName}
              className="max-w-full h-auto border"
            />
          )}

          {selectedAssignment.url.match(/\.(mp4|webm|ogg)$/) && (
            <video controls className="w-full max-h-[600px] border">
              <source src={selectedAssignment.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}

          {!selectedAssignment.url.match(/\.(pdf|jpg|jpeg|png|gif|mp4|webm|ogg)$/) && (
            <p>
              File type not supported for inline view.{" "}
              <a
                href={selectedAssignment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Download
              </a>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
