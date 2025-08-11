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

import { useState } from "react";

export default function AssignmentUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [classId, setClassId] = useState(""); // NEW
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !classId) {
      setMessage("Please select a file and class first");
      return;
    }

    const formData = new FormData();
    formData.append("assignment", file);
    formData.append("classId", classId); // NEW

    const res = await fetch("/api/assignments/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (res.ok) {
      setMessage("Upload successful: " + data.filename);
    } else {
      setMessage("Upload failed: " + data.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded max-w-md space-y-4">
      <select
        value={classId}
        onChange={(e) => setClassId(e.target.value)}
        className="border p-2 rounded w-full"
      >
        <option value="">-- Select Class --</option>
        <option value="class1">Class 1</option>
        <option value="class2">Class 2</option>
        {/* TODO: Dynamically fetch class list */}
      </select>

      <input
        type="file"
        onChange={(e) => {
          if (e.target.files?.[0]) setFile(e.target.files[0]);
        }}
        className="w-full"
      />

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Upload Assignment
      </button>

      {message && <p className="mt-2">{message}</p>}
    </form>
  );
}
