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
  joinUrlZoom?: string;
  joinUrlJitsi?: string;
};

type AttendanceRecord = {
  studentId: string;
  joinTime: string;
  leaveTime?: string;
  duration?: number | null;
};

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>("");

  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  const [newMeeting, setNewMeeting] = useState({
    topic: "",
    platform: "zoom",
    joinUrlZoom: "",
    joinUrlJitsi: "",
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

  // Set default selected class
  useEffect(() => {
    if (!selectedClassId && classes[0]?._id) {
      setSelectedClassId(classes[0]._id);
    }
  }, [classes, selectedClassId]);

  // Fetch meetings
  useEffect(() => {
    if (!selectedClassId) return;
    fetch("/api/meetings/list?classId=" + selectedClassId)
      .then((res) => res.json())
      .then((data) => setMeetings(data.meetings || []));
  }, [selectedClassId]);

  // Fetch attendance for selected meeting
  useEffect(() => {
    if (!selectedMeetingId) return;
    fetch(`/api/attendance/report/${selectedMeetingId}`)
      .then((res) => res.json())
      .then((data) => setAttendance(data || []));
  }, [selectedMeetingId]);

  // Update user role/class
  const updateUser = async (
    userId: string,
    updates: Partial<{ role: string; classId: string }>
  ) => {
    await fetch("/api/users/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...updates }),
    });

    setUsers(users.map((u) => (u._id === userId ? { ...u, ...updates } : u)));
  };

  // Save new meeting
  const saveMeeting = async () => {
    if (!newMeeting.topic) {
      alert("Please enter meeting topic.");
      return;
    }
    if (newMeeting.platform === "zoom" && !newMeeting.joinUrlZoom.trim()) {
      alert("Please enter Zoom join link.");
      return;
    }
    if (newMeeting.platform === "jitsi" && !newMeeting.joinUrlJitsi.trim()) {
      alert("Please enter Jitsi join link.");
      return;
    }

    await fetch("/api/meetings/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newMeeting, classId: selectedClassId }),
    });

    setNewMeeting({
      topic: "",
      platform: "zoom",
      joinUrlZoom: "",
      joinUrlJitsi: "",
      date: "",
      time: "",
    });

    // Refresh meetings
    const res = await fetch("/api/meetings/list?classId=" + selectedClassId);
    const data = await res.json();
    setMeetings(data.meetings || []);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Admin Dashboard
      </h1>

      {/* Users Table */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full border rounded-lg">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Class</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <tr
                  key={user._id}
                  className={`border-t ${
                    idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <td className="p-3">{user.name}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        updateUser(user._id, { role: e.target.value })
                      }
                      className="border rounded px-2 py-1"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <select
                      value={user.classId || ""}
                      onChange={(e) =>
                        updateUser(user._id, { classId: e.target.value })
                      }
                      className="border rounded px-2 py-1"
                    >
                      <option value="">No Class</option>
                      {classes.map((cls) => (
                        <option key={cls._id} value={cls._id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assignment Upload */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">Assignments</h2>
        <AssignmentUpload
          role="admin"
          classId={selectedClassId || classes[0]?._id || ""}
        />
      </div>

      {/* Select Class */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">Select Class</h2>
        <select
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          className="border p-2 rounded w-full"
        >
          {classes.map((cls) => (
            <option key={cls._id} value={cls._id}>
              {cls.name}
            </option>
          ))}
        </select>
      </div>

      {/* Add Meeting */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">Add Meeting</h2>
        <div className="grid gap-3">
          <input
            type="text"
            placeholder="Meeting Topic"
            className="border p-2 rounded"
            value={newMeeting.topic}
            onChange={(e) =>
              setNewMeeting({ ...newMeeting, topic: e.target.value })
            }
          />

          <select
            className="border p-2 rounded"
            value={newMeeting.platform}
            onChange={(e) =>
              setNewMeeting({ ...newMeeting, platform: e.target.value })
            }
          >
            <option value="zoom">Zoom</option>
            <option value="jitsi">Jitsi</option>
          </select>

          {newMeeting.platform === "zoom" && (
            <input
              type="text"
              placeholder="Zoom Join URL"
              className="border p-2 rounded"
              value={newMeeting.joinUrlZoom}
              onChange={(e) =>
                setNewMeeting({ ...newMeeting, joinUrlZoom: e.target.value })
              }
            />
          )}

          {newMeeting.platform === "jitsi" && (
            <input
              type="text"
              placeholder="Jitsi Join URL"
              className="border p-2 rounded"
              value={newMeeting.joinUrlJitsi}
              onChange={(e) =>
                setNewMeeting({ ...newMeeting, joinUrlJitsi: e.target.value })
              }
            />
          )}

          <div className="flex gap-2">
            <input
              type="date"
              className="border p-2 rounded w-1/2"
              value={newMeeting.date}
              onChange={(e) =>
                setNewMeeting({ ...newMeeting, date: e.target.value })
              }
            />
            <input
              type="time"
              className="border p-2 rounded w-1/2"
              value={newMeeting.time}
              onChange={(e) =>
                setNewMeeting({ ...newMeeting, time: e.target.value })
              }
            />
          </div>

          <button
            onClick={saveMeeting}
            className="bg-indigo-600 hover:bg-indigo-700 transition text-white px-4 py-2 rounded"
          >
            Save Meeting
          </button>
        </div>
      </div>

     {/* Meetings Table */}
<div className="bg-white shadow-md rounded-lg p-4 mb-6">
  <h2 className="text-xl font-semibold mb-4">Meetings</h2>
  {meetings.length === 0 ? (
    <p>No meetings scheduled.</p>
  ) : (
    <table className="w-full border rounded-lg overflow-hidden shadow-sm">
      <thead className="bg-gray-100">
        <tr>
          <th className="border p-2 text-left">Title</th>
          <th className="border p-2 text-left">Date</th>
          <th className="border p-2 text-left">Time</th>
          <th className="border p-2 text-left">Platform</th>
          <th className="border p-2 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        {meetings.map((m) => (
          <tr key={m._id} className="hover:bg-gray-50 transition">
            <td className="border p-2 font-semibold">{m.topic || "Class Meeting"}</td>
            <td className="border p-2">{m.date}</td>
            <td className="border p-2">{m.time}</td>
            <td className="border p-2 flex flex-col gap-1">
              {m.joinUrlZoom && (
                <a
                  href={m.joinUrlZoom}
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  Zoom
                </a>
              )}
              {m.joinUrlJitsi && (
                <a
                  href={m.joinUrlJitsi}
                  target="_blank"
                  className="text-green-600 underline"
                >
                  Jitsi
                </a>
              )}
              {!m.joinUrlZoom && !m.joinUrlJitsi && (
                <span className="text-red-500">No Link</span>
              )}
            </td>
            <td className="border p-2">
              <button
                onClick={() => setSelectedMeetingId(m._id)}
                className="text-indigo-600 underline text-sm"
              >
                View Attendance
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</div>
      {/* Attendance Report */}
      {selectedMeetingId && (
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Attendance Report</h2>
          <div className="overflow-x-auto">
            <table className="w-full border rounded-lg">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="p-3">Student</th>
                  <th className="p-3">Join Time</th>
                  <th className="p-3">Leave Time</th>
                  <th className="p-3">Duration (min)</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((r, idx) => {
                  const student = users.find((u) => u._id === r.studentId);
                  return (
                    <tr
                      key={idx}
                      className={`border-t ${
                        idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                      }`}
                    >
                      <td className="p-3">{student?.name || r.studentId}</td>
                      <td className="p-3">
                        {r.joinTime
                          ? new Date(r.joinTime).toLocaleTimeString()
                          : "-"}
                      </td>
                      <td className="p-3">
                        {r.leaveTime
                          ? new Date(r.leaveTime).toLocaleTimeString()
                          : "-"}
                      </td>
                      <td className="p-3">{r.duration ?? "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}