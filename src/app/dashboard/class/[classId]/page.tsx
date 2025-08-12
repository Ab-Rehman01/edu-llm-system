//dashboard/class/[classid]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Assignment {
  _id: string;
  url: string;
  fileName?: string;
  classId: string;
}

interface ClassItem {
  _id: string;
  name: string;
}

export default function ClassDashboard() {
  const params = useParams();
  const classId = params?.classId || "";
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [className, setClassName] = useState<string>("");

  // Fetch assignments for the class
  useEffect(() => {
    if (!classId) return;

    async function fetchAssignments() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/assignments/list?classId=${classId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch assignments");
        }

        setAssignments(data.assignments || data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAssignments();
  }, [classId]);

  // Fetch class name for heading
  useEffect(() => {
    if (!classId) return;

    async function fetchClassName() {
      try {
        const res = await fetch(`/api/classes/list`);
        const data = await res.json();
        const cls = data.classes.find((c: ClassItem) => c._id === classId);
        setClassName(cls?.name || "");
      } catch {
        setClassName("");
      }
    }

    fetchClassName();
  }, [classId]);

  if (loading) return <p>Loading assignments...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Assignments for Class: {className || classId}
      </h1>

      {assignments.length === 0 && <p>No assignments found for this class.</p>}

      <ul>
        {assignments.map((assignment) => (
          <li key={assignment._id} className="mb-2">
            <a
              href={assignment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {assignment.fileName || "View Assignment"}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}