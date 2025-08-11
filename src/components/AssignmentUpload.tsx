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

export default function AssignmentUpload({ role }: { role: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [classId, setClassId] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setMessage("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("assignment", file);

    if (role === "admin") {
      formData.append("classId", classId);
    }

    const res = await fetch("/api/assignment/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("Uploaded: " + data.filename);
    } else {
      setMessage("Error: " + data.error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {role === "admin" && (
        <select value={classId} onChange={(e) => setClassId(e.target.value)}>
          <option value="">Select Class</option>
          <option value="class1">Class 1</option>
          <option value="class2">Class 2</option>
        </select>
      )}

      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button type="submit">Upload</button>
      {message && <p>{message}</p>}
    </form>
  );
}
