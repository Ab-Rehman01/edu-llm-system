"use client";

import AssignmentUpload from "@/components/AssignmentUpload";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetch("/api/users/list")
      .then(res => res.json())
      .then(data => setUsers(data.users || data)); // Fallback agar API directly array bhejti hai
  }, []);

  const updateRole = async (userId: string, role: string) => {
    await fetch("/api/users/update-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role }),
    });

    setUsers(users.map(u => (u._id === userId ? { ...u, role } : u)));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <table className="border w-full">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Role</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td className="border p-2">{user.name}</td>
              <td className="border p-2">{user.email}</td>
              <td className="border p-2">{user.role}</td>
              <td className="border p-2">
                <select
                  value={user.role}
                  onChange={(e) => updateRole(user._id, e.target.value)}
                  className="border p-1"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Assignment Upload - role dynamically from session */}
      <AssignmentUpload role={session?.user?.role || ""} />
    </div>
  );
}
