"use client";

import AssignmentUpload from "@/components/AssignmentUpload";
import { useEffect, useState } from "react";

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  classId?: string;
};

type ClassItem = {
  _id: string;
  name: string;
};

type Meeting = {
  _id: string;
  classId: string;
  date: string;
  time: string;
  topic: string;
  joinUrl: string;
};

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  const [meetings, setMeetings] = useState<Meeting[]>([]);

  const [newMeeting, setNewMeeting] = useState({
    topic: "",
    joinUrl: "",
    date: "",
    time: "",
  });

  // Fetch users
  useEffect(() => {
    fetch("/api/users/list")
      .then((res) => res.json())
      .then((data) => setUsers(data.users || data));
  }, []);

  // Fetch classes
  useEffect(() => {
    fetch("/api/classes/list")
      .then((res) => res.json())
      .then((data) => setClasses(data.classes || []));
  }, []);

  // Fetch meetings for selected class
  useEffect(() => {
    if (!selectedClassId && classes[0]?._id) {
      setSelectedClassId(classes[0]._id);
    }
    if (!selectedClassId) return;

    fetch("/api/meetings/list?classId=" + selectedClassId)
      .then((res) => res.json())
      .then((data) => setMeetings(data.meetings || []));
  }, [selectedClassId, classes]);

  // Update user role or class
  const updateUser = async (
    userId: string,
    updates: Partial<{ role: string; classId: string }>
  ) => {
    await fetch("/api/users/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...updates }),
    });

    setUsers(
      users.map((u) => (u._id === userId ? { ...u, ...updates } : u))
    );
  };

  // Save new Zoom meeting link
  const saveMeeting = async () => {
    if (!newMeeting.topic || !newMeeting.joinUrl) {
      alert("Please enter topic and join link.");
      return;
    }

    await fetch("/api/meetings/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newMeeting, classId: selectedClassId }),
    });

    setNewMeeting({ topic: "", joinUrl: "", date: "", time: "" });

    // Refresh meetings
    const res = await fetch("/api/meetings/list?classId=" + selectedClassId);
    const data = await res.json();
    setMeetings(data.meetings || []);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {/* Users Table */}
      <table className="border w-full mb-6">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Role</th>
            <th className="border p-2">Class</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td className="border p-2">{user.name}</td>
              <td className="border p-2">{user.email}</td>
              <td className="border p-2">
                <select
                  value={user.role}
                  onChange={(e) =>
                    updateUser(user._id, { role: e.target.value })
                  }
                  className="border p-1"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td className="border p-2">
                <select
                  value={user.classId || ""}
                  onChange={(e) =>
                    updateUser(user._id, { classId: e.target.value })
                  }
                  className="border p-1"
                >
                  <option value="">No Class</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </td>
              <td className="border p-2">Update</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Assignment Upload */}
      <AssignmentUpload
        role="admin"
        classId={selectedClassId || classes[0]?._id || ""}
      />

      {/* Select Class */}
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-2">Select Class</h2>
        <select
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          className="border p-2 w-full mb-4"
        >
          {classes.map((cls) => (
            <option key={cls._id} value={cls._id}>
              {cls.name}
            </option>
          ))}
        </select>
      </div>

      {/* Add Zoom Meeting Link */}
      <div className="mt-6 border p-4 rounded">
        <h2 className="text-xl font-bold mb-2">Add Zoom Meeting Link</h2>
        <input
          type="text"
          placeholder="Meeting Topic"
          className="border p-2 mb-2 w-full"
          value={newMeeting.topic}
          onChange={(e) =>
            setNewMeeting({ ...newMeeting, topic: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Zoom Join URL"
          className="border p-2 mb-2 w-full"
          value={newMeeting.joinUrl}
          onChange={(e) =>
            setNewMeeting({ ...newMeeting, joinUrl: e.target.value })
          }
        />
        <input
          type="date"
          className="border p-2 mb-2 w-full"
          value={newMeeting.date}
          onChange={(e) =>
            setNewMeeting({ ...newMeeting, date: e.target.value })
          }
        />
        <input
          type="time"
          className="border p-2 mb-2 w-full"
          value={newMeeting.time}
          onChange={(e) =>
            setNewMeeting({ ...newMeeting, time: e.target.value })
          }
        />
        <button
          onClick={saveMeeting}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save Meeting
        </button>
      </div>

      {/* Meetings List */}
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-2">Meetings</h2>
        <ul>
          {meetings.map((m) => (
            <li key={m._id} className="mb-2">
              <span className="font-semibold">{m.topic}</span> - {m.date}{" "}
              {m.time} -{" "}
              <a
                href={m.joinUrl}
                target="_blank"
                className="text-blue-600 underline"
              >
                Join Link
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}