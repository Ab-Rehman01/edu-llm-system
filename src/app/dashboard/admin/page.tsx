// app/dashboard/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import AssignmentUpload from "@/components/AssignmentUpload";

type User = {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "teacher" | "student";
  classId?: string;
  teacherId?: string;
  schedule?: ScheduleItem[];
  assignments?: Assignment[];
    selectedDay?: string;
  startTime?: string;
  endTime?: string;
};

type ScheduleItem = {
  day: string;
  time: string; // "19:00-20:00"
  teacherId: string;
  studentId: string;
};

type ClassItem = {
  _id: string;
  name: string;
};

type Assignment = {
  _id: string;
  title: string;
  teacherId: string;
  studentId: string;
  uploadedAt: string;
  subject?: string;
  url?: string;
  filename?: string;
};

type Meeting = {
  _id: string;
  classId: string;
  topic?: string;
  date: string;
  time: string;
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

  const [selectedStudentDetail, setSelectedStudentDetail] = useState<User | null>(null);

  const [newMeeting, setNewMeeting] = useState({
    topic: "",
    platform: "zoom",
    joinUrlZoom: "",
    joinUrlJitsi: "",
    date: "",
    time: "",
  });

  const [newClassName, setNewClassName] = useState("");

  // ---------------- Fetch Users ----------------
  useEffect(() => {
    fetch("/api/users/list")
      .then((res) => res.json())
      .then((data) => setUsers(data.users || data));
  }, []);

  // ---------------- Fetch Classes ----------------
  const loadClasses = async () => {
    const res = await fetch("/api/classes/list");
    const data = await res.json();
    setClasses(data.classes || []);
  };

  useEffect(() => {
    loadClasses();
  }, []);

  // Default selected class
  useEffect(() => {
    if (!selectedClassId && classes[0]?._id) setSelectedClassId(classes[0]._id);
  }, [classes]);

  // ---------------- Fetch Meetings ----------------
  useEffect(() => {
    if (!selectedClassId) return;
    fetch("/api/meetings/list?classId=" + selectedClassId)
      .then((res) => res.json())
      .then((data) => setMeetings(data.meetings || []));
  }, [selectedClassId]);

  // ---------------- Fetch Attendance ----------------
  useEffect(() => {
    if (!selectedMeetingId) return;
    fetch(`/api/meetings/attendance/report/${selectedMeetingId}`)
      .then((res) => res.json())
      .then((data) => setAttendance(data || []));
  }, [selectedMeetingId]);

  // ---------------- Update User ----------------
  const handleUserUpdate = async (user: User) => {
    const res = await fetch(`/api/users/${user._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: user.role, classId: user.classId }),
    });
    const data = await res.json();
    alert(data.message);
  };

  // ---------------- Assign Teacher + Schedule ----------------
  const assignTeacherWithSchedule = async (
    studentId: string,
    teacherId: string,
    day: string,
    startTime: string,
    endTime: string
  ) => {
    if (!teacherId || !day || !startTime || !endTime) {
      alert("Select teacher, day and time");
      return;
    }

    const res = await fetch("/api/users/assign-teacher-schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId,
        teacherId,
        schedule: { day, time: `${startTime}-${endTime}` },
      }),
    });

    const data = await res.json();
    alert(data.message);

    // update UI
    setUsers((prev) =>
      prev.map((u) =>
        u._id === studentId
          ? {
              ...u,
              teacherId,
              schedule: [
                ...(u.schedule || []),
                { day, time: `${startTime}-${endTime}`, teacherId, studentId },
              ],
            }
          : u
      )
    );
  };

  // ---------------- Student Detail ----------------
  const loadStudentDetail = async (studentId: string) => {
    const res = await fetch(`/api/admin/students/${studentId}`);
    const data = await res.json();
    setSelectedStudentDetail(data);
  };

  // ---------------- Class CRUD ----------------
  const createClass = async () => {
    if (!newClassName.trim()) return;
    await fetch("/api/classes/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newClassName }),
    });
    setNewClassName("");
    loadClasses();
  };

  const updateClass = async (id: string, name: string) => {
    await fetch("/api/classes/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name }),
    });
    loadClasses();
  };

  const deleteClass = async (id: string) => {
    if (!confirm("Delete this class?")) return;
    await fetch("/api/classes/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadClasses();
  };

  // ---------------- Save Meeting ----------------
  const saveMeeting = async () => {
    await fetch("/api/meetings/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newMeeting, classId: selectedClassId }),
    });
    setNewMeeting({ topic: "", platform: "zoom", joinUrlZoom: "", joinUrlJitsi: "", date: "", time: "" });
    const res = await fetch("/api/meetings/list?classId=" + selectedClassId);
    const data = await res.json();
    setMeetings(data.meetings || []);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* ---------------- Students ---------------- */}
      <div className="bg-white shadow rounded p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">Students</h2>
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Assign Teacher & Schedule</th>
              <th className="border p-2">Portal</th>
            </tr>
          </thead>
          <tbody>
            {users.filter((u) => u.role === "student").map((student) => (
              <tr key={student._id}>
                <td className="border p-2">{student.name}</td>
                <td className="border p-2">{student.email}</td>
                <td className="border p-2">
                  <div className="flex flex-wrap gap-2">
                    <select
                      onChange={(e) => student.teacherId = e.target.value}
                      className="border p-1 rounded"
                      defaultValue={student.teacherId || ""}
                    >
                      <option value="">Select Teacher</option>
                      {users.filter((t) => t.role === "teacher").map((t) => (
                        <option key={t._id} value={t._id}>{t.name}</option>
                      ))}
                    </select>
                    <select className="border p-1 rounded" onChange={(e) => student["selectedDay"] = e.target.value}>
                      {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => <option key={d}>{d}</option>)}
                    </select>
                    <input type="time" className="border p-1 rounded" onChange={(e) => student["startTime"] = e.target.value} />
                    <input type="time" className="border p-1 rounded" onChange={(e) => student["endTime"] = e.target.value} />
                    <button
                      onClick={() =>
                        assignTeacherWithSchedule(
                          student._id,
                          student.teacherId!,
                          student["selectedDay"] || "Mon",
                          student["startTime"] || "09:00",
                          student["endTime"] || "10:00"
                        )
                      }
                      className="bg-blue-600 text-white px-2 py-1 rounded"
                    >
                      Assign
                    </button>
                  </div>
                </td>
                <td className="border p-2">
                  <button onClick={() => loadStudentDetail(student._id)} className="text-indigo-600 underline">
                    View Portal
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---------------- Selected Student Portal ---------------- */}
      {selectedStudentDetail && (
        <div className="bg-white shadow rounded p-4 mb-6">
          <h2 className="text-xl font-semibold mb-2">{selectedStudentDetail.name}'s Portal</h2>
          <h3 className="font-semibold">Schedule</h3>
          <ul>
            {selectedStudentDetail.schedule?.map((s, idx) => {
              const teacher = users.find((u) => u._id === s.teacherId);
              return (
                <li key={idx}>
                  {teacher?.name} → {s.day} {s.time}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* ---------------- Manage Classes ---------------- */}
      <div className="bg-white shadow rounded p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">Manage Classes</h2>
        <input
          type="text"
          value={newClassName}
          onChange={(e) => setNewClassName(e.target.value)}
          className="border p-2 mr-2"
        />
        <button onClick={createClass} className="bg-green-600 text-white px-3 py-1 rounded">Add</button>
        <ul className="mt-3">
          {classes.map((c) => (
            <li key={c._id} className="flex gap-2 items-center">
              <input
                value={c.name}
                onChange={(e) => setClasses(classes.map((x) => x._id === c._id ? { ...x, name: e.target.value } : x))}
                className="border p-1"
              />
              <button onClick={() => updateClass(c._id, c.name)} className="text-blue-600">Save</button>
              <button onClick={() => deleteClass(c._id)} className="text-red-600">Delete</button>
            </li>
          ))}
        </ul>
      </div>

      {/* ---------------- Assignment Upload ---------------- */}
      <AssignmentUpload role="admin" classId={selectedClassId || ""} />
    </div>
  );
}