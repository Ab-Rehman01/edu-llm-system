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


"use client";

import { useEffect, useState } from "react";

type AssignmentUploadProps = {
  role: string;
};

export default function AssignmentUpload({ role }: AssignmentUploadProps) {
  const [classes, setClasses] = useState<{ _id: string; name: string }[]>([]);
  const [classId, setClassId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // Admin ke liye classes list fetch
  useEffect(() => {
    if (role === "admin") {
      fetch("/api/classes/list")
        .then((res) => res.json())
        .then((data) => setClasses(data.classes || []))
        .catch(() => setClasses([]));
    }
  }, [role]);

  const handleUpload = async () => {
    if (!file) {
      setStatus("❌ Please select a file");
      return;
    }

    if (role === "admin" && !classId) {
      setStatus("❌ Please select a class");
      return;
    }

    setLoading(true);
    setStatus("");

    const formData = new FormData();
    formData.append("file", file);

    if (role === "admin") {
      formData.append("classId", classId);
    }

    // Teacher ke liye classId backend assign karega
    try {
      const res = await fetch("/api/assignment/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setStatus("✅ Assignment uploaded successfully!");
        setFile(null);
        setClassId("");
      } else {
        setStatus(`❌ Upload failed: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      setStatus("❌ Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded mt-6">
      <h2 className="text-lg font-bold mb-2">Upload Assignment</h2>

      {/* Admin ke liye class dropdown */}
      {role === "admin" && (
        <div className="mb-3">
          <label className="block mb-1">Select Class</label>
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="border p-2 w-full"
          >
            <option value="">-- Select Class --</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-3 block"
      />

      <button
        onClick={handleUpload}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>

      {status && <p className="mt-3">{status}</p>}
    </div>
  );
}
