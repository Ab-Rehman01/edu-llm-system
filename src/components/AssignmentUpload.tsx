"use client";

import { useState, useEffect } from "react";

interface ClassItem {
  _id: string;
  name: string;
}

interface AssignmentUploadProps {
  role: string;
  classId?: string; // optional prop from parent
}

export default function AssignmentUpload({ role, classId: propClassId }: AssignmentUploadProps) {
  const [classId, setClassId] = useState<string>(propClassId || "");
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subject, setSubject] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successUrl, setSuccessUrl] = useState<string | null>(null);

  // Update classId if prop changes
  useEffect(() => {
    if (propClassId) {
      setClassId(propClassId);
    }
  }, [propClassId]);

  // Fetch classes once
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

  async function handleUpload() {
    setError(null);
    setSuccessUrl(null);

    if (!classId) {
      setError("Please select a class.");
      return;
    }
    if (!subject.trim()) {
      setError("Please enter a subject.");
      return;
    }
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setUploading(true);

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append("file", file);
      formData.append("classId", classId);
      formData.append("subject", subject.trim());
      formData.append("role", role);

      // POST to your upload API route
      const res = await fetch("/api/assignments/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setSuccessUrl(data.url || null);
      setSubject("");
      setFile(null);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-4 border rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Upload Assignment {role && `(${role})`}</h2>

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

      <input
        type="text"
        placeholder="Enter Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />

      <input
        type="file"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
        }}
        className="w-full mb-4"
      />

      <button
        onClick={handleUpload}
        disabled={uploading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {error && <p className="mt-3 text-red-600">{error}</p>}

      {successUrl && (
        <p className="mt-3 text-green-600">
          Upload successful!{" "}
          <a href={successUrl} target="_blank" rel="noopener noreferrer" className="underline">
            View file
          </a>
        </p>
      )}
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
