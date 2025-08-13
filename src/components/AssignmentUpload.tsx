"use client";

import { useState, useEffect } from "react";

interface ClassItem {
  _id: string;
  name: string;
}

interface Assignment {
  _id: string;
  url: string;
  filename: string;
  subject: string;
  uploadedAt: string;
}

interface AssignmentUploadProps {
  role?: string;
  classId?: string;
}

export default function AssignmentUpload({ role, classId: propClassId }: AssignmentUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [subject, setSubject] = useState("");
  const [classId, setClassId] = useState(propClassId || "");
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If propClassId changes, update classId state
  useEffect(() => {
    if (propClassId) setClassId(propClassId);
  }, [propClassId]);

  // Fetch list of classes from API
  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await fetch("/api/classes/list");
        const data = await res.json();
        setClasses(data.classes || []);
      } catch (err) {
        console.error("Error fetching classes:", err);
      }
    }
    fetchClasses();
  }, []);

  // Fetch assignments for selected class
  useEffect(() => {
    if (!classId) return;

    async function fetchAssignments() {
      try {
        const res = await fetch(`/api/assignments/list?classId=${classId}`);
        const data = await res.json();
        setAssignments(data.assignments || []);
      } catch (err) {
        console.error("Error fetching assignments:", err);
      }
    }

    fetchAssignments();
  }, [classId]);

  const handleUpload = async () => {
    if (!file || !classId || !subject.trim()) {
      setError("Please select a class, enter a subject, and choose a file.");
      return;
    }

    setUploading(true);
    setError(null);

    // Prepare form data for upload
    const formData = new FormData();
    formData.append("file", file);
    formData.append("classId", classId);
    formData.append("subject", subject.trim());
    formData.append("role", role || "");

    try {
      const res = await fetch("/api/assignments/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");

      // Clear input and reload assignments list after upload
      setSubject("");
      setFile(null);
      // Refresh assignments
      const refreshRes = await fetch(`/api/assignments/list?classId=${classId}`);
      const refreshData = await refreshRes.json();
      setAssignments(refreshData.assignments || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 border rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">
        Upload Assignment {role && `(${role})`}
      </h2>

      {/* Class Select Dropdown */}
      {!propClassId && (
        <select
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        >
          <option value="">Select Class</option>
          {classes.map((cls) => (
            <option key={cls._id} value={cls._id}>
              {cls.name}
            </option>
          ))}
        </select>
      )}

      {/* Subject Input */}
      <input
        type="text"
        placeholder="Enter subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />

      {/* File Upload */}
      <input
        type="file"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
        }}
        className="w-full p-2 border rounded mb-4"
      />

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {/* Error Message */}
      {error && <p className="text-red-500 mt-3">{error}</p>}

      {/* Assignments List */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Assignments List</h3>
        {assignments.length === 0 && <p>No assignments found.</p>}
        <ul>
          {assignments.map((a) => (
            <li key={a._id} className="mb-2">
              <a
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {a.subject} - {a.filename}
              </a>{" "}
              <span className="text-gray-500 text-sm">
                ({new Date(a.uploadedAt).toLocaleDateString()})
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
// "use client";

// import { useState } from "react";

// export default function AssignmentUpload() {
//   const [file, setFile] = useState<File | null>(null);
//   const [message, setMessage] = useState("");

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!file) {
//       setMessage("Please select a file first");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("assignment", file);

//     const res = await fetch("/api/assignments/upload", {
//       method: "POST",
//       body: formData,
//     });

//     const data = await res.json();

//     if (res.ok) {
//       setMessage("Upload successful: " + data.filename);
//     } else {
//       setMessage("Upload failed: " + data.error);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="p-4 border rounded max-w-md">
//       <input
//         type="file"
//         onChange={(e) => {
//           if (e.target.files?.[0]) setFile(e.target.files[0]);
//         }}
//         className="mb-2"
//       />
//       <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
//         Upload Assignment
//       </button>
//       {message && <p className="mt-2">{message}</p>}
//     </form>
//   );
// }
//components/AssignmentUpload.tsx

// "use client";

// import { useEffect, useState } from "react";

// type AssignmentUploadProps = {
//   role: string;
// };

// export default function AssignmentUpload({ role }: AssignmentUploadProps) {
//   const [classes, setClasses] = useState<{ _id: string; name: string }[]>([]);
//   const [classId, setClassId] = useState("");
//   const [file, setFile] = useState<File | null>(null);
//   const [status, setStatus] = useState("");
//   const [loading, setLoading] = useState(false);

//   // Admin ke liye classes list fetch
//   useEffect(() => {
//     if (role === "admin") {
//       fetch("/api/classes/list")
//         .then((res) => res.json())
//         .then((data) => setClasses(data.classes || []))  // Note: backend ab { classes: [...] } bhej raha hai
//         .catch(() => setClasses([]));
//     }
//   }, [role]);

//   const handleUpload = async () => {
//     if (!file) {
//       setStatus("❌ Please select a file");
//       return;
//     }

//     if (role === "admin" && !classId) {
//       setStatus("❌ Please select a class");
//       return;
//     }

//     setLoading(true);
//     setStatus("");

//     const formData = new FormData();
//     formData.append("file", file);

//     if (role === "admin") {
//       formData.append("classId", classId);
//     }

//     try {
//       const res = await fetch("/api/assignments/upload", {
//         method: "POST",
//         body: formData,
//       });

//       const data = await res.json();
//       if (res.ok) {
//         setStatus("✅ Assignment uploaded successfully!");
//         setFile(null);
//         setClassId("");
//       } else {
//         setStatus(`❌ Upload failed: ${data.error || "Unknown error"}`);
//       }
//     } catch {
//       setStatus("❌ Upload failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-4 border rounded mt-6">
//       <h2 className="text-lg font-bold mb-2">Upload Assignment</h2>

//       {/* Admin ke liye class dropdown */}
//       {role === "admin" && (
//         <div className="mb-3">
//           <label className="block mb-1">Select Class</label>
//           <select
//             value={classId}
//             onChange={(e) => setClassId(e.target.value)}
//             className="border p-2 w-full"
//           >
//             <option value="">-- Select Class --</option>
//             {classes.map((cls) => (
//               <option key={cls._id} value={cls._id}>
//                 {cls.name}
//               </option>
//             ))}
//           </select>
//         </div>
//       )}

//       <input
//         type="file"
//         onChange={(e) => setFile(e.target.files?.[0] || null)}
//         className="mb-3 block"
//       />

//       <button
//         onClick={handleUpload}
//         disabled={loading}
//         className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
//       >
//         {loading ? "Uploading..." : "Upload"}
//       </button>

//       {status && <p className="mt-3">{status}</p>}
//     </div>
//   );
// }
