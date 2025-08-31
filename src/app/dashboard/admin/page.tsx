//dashboard/admin

"use client";

import AssignmentUpload from "@/components/AssignmentUpload";
import { useEffect, useState } from "react";

type User = {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "teacher" | "student";
  classId?: string;
  teacherId?: string;
  schedule?: ScheduleItem[];
};
type ScheduleItem = {
  day: string; // "Mon", "Tue", ..., "Sun"
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
};
type Meeting = {
  _id: string;
  classId: string;
  topic?: string;
  date: string;
  time: string;
  joinUrlZoom?: string;
  joinUrlJitsi?: string;
  createdBy?: string;
  createdAt?: string;
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

  const [selectedStudentDetail, setSelectedStudentDetail] = useState<any>(null);
  const [teacherStudents, setTeacherStudents] = useState<User[]>([]);

  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<string>("Mon");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");

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

  useEffect(() => {
    if (!selectedClassId && classes[0]?._id) {
      setSelectedClassId(classes[0]._id);
    }
  }, [classes, selectedClassId]);

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
    try {
      const res = await fetch(`/api/users/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: user.role, classId: user.classId }),
      });
      if (!res.ok) throw new Error("Update failed");

      const data = await res.json();
      alert(data.message);

      setUsers(users.map(u => u._id === user._id ? user : u));
    } catch (err) {
      console.error(err);
      alert("User update failed");
    }
  };

  // ---------------- Assign Teacher ----------------
  const handleTeacherAssign = async (studentId: string, teacherId: string) => {
    try {
      const res = await fetch("/api/users/assign-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, teacherId }),
      });
      if (!res.ok) throw new Error("Failed to assign teacher");

      const data = await res.json();
      setUsers(users.map(u => u._id === studentId ? { ...u, teacherId } : u));
      alert(data.message);
    } catch (err) {
      console.error(err);
      alert("Teacher assignment failed");
    }
  };

  const assignTeacherWithSchedule = async (studentId: string) => {
    if (!selectedTeacherId || !selectedDay || !startTime || !endTime) {
      alert("Select teacher, day, and time");
      return;
    }

    try {
      const res = await fetch("/api/users/assign-teacher-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          teacherId: selectedTeacherId,
          schedule: {
            day: selectedDay,
            time: `${startTime}-${endTime}`,
          },
        }),
      });
      if (!res.ok) throw new Error("Failed to assign");

      const data = await res.json();
      alert(data.message);

      setUsers(users.map(u => 
        u._id === studentId 
          ? { ...u, teacherId: selectedTeacherId, schedule: [...(u.schedule||[]), {day: selectedDay, time:`${startTime}-${endTime}`, teacherId: selectedTeacherId, studentId}] } 
          : u
      ));
    } catch (err) {
      console.error(err);
      alert("Assignment failed");
    }
  };

  // ---------------- Save New Meeting ----------------
  const saveMeeting = async () => {
    if (!newMeeting.topic) return alert("Please enter meeting topic.");
    if (newMeeting.platform === "zoom" && !newMeeting.joinUrlZoom.trim()) return alert("Please enter Zoom join link.");
    if (newMeeting.platform === "jitsi" && !newMeeting.joinUrlJitsi.trim()) return alert("Please enter Jitsi join link.");

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

  // ---------------- Manage Classes ----------------
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
    if (!confirm("Are you sure you want to delete this class?")) return;
    await fetch("/api/classes/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadClasses();
  };

  // ---------------- Load Student Detail & Merge Teachers ----------------
  const loadStudentDetail = async (studentId: string) => {
    const res = await fetch(`/api/admin/students/${studentId}`);
    const data = await res.json();
    setSelectedStudentDetail(data);

    // merge teacherStudents based on schedule
    const scheduleTeachersIds = data.schedule?.map((s: ScheduleItem) => s.teacherId) || [];
    const mergedTeachers = users.filter(u => u.role === "teacher" && scheduleTeachersIds.includes(u._id));
    setTeacherStudents(mergedTeachers);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>

      {/* ---------------- Teachers ---------------- */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <h2 className="text-xl font-semibold p-4 border-b">Teachers</h2>
        <table className="w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">Name</th>
              <th className="border p-2 text-left">Email</th>
              <th className="border p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.filter(u => u.role === "teacher").map((teacher) => (
              <tr key={teacher._id}>
                <td className="border p-2">{teacher.name}</td>
                <td className="border p-2">{teacher.email}</td>
                <td className="border p-2">
                  <button
                    onClick={() => loadStudentDetail(teacher._id)}
                    className="text-blue-600 underline"
                  >
                    View Students
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---------------- Student Portal (Consolidated) ---------------- */}
      {selectedStudentDetail && (
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <h2 className="text-xl font-semibold mb-4">{selectedStudentDetail.name}'s Portal</h2>

          {/* Assigned Teachers & Schedule */}
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Assigned Teachers & Schedule</h3>
            {teacherStudents.length === 0 ? (
              <p>No teachers assigned yet.</p>
            ) : (
              <ul className="list-disc pl-5">
                {teacherStudents.map((t) => (
                  <li key={t._id}>
                    {t.name} ({t.email}) - Schedule:{" "}
                    {selectedStudentDetail.schedule
                      ?.filter((s: ScheduleItem) => s.teacherId === t._id)
                      .map((s: ScheduleItem, idx: number) => (
                        <span key={idx}>
                          {s.day} {s.time};{" "}
                        </span>
                      ))}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Assign Teacher with Schedule */}
          <div className="border p-2 mb-4">
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="border p-1 rounded"
            >
              <option value="">Not Assigned</option>
              {users.filter(u => u.role === "teacher").map((teacher) => (
                <option key={teacher._id} value={teacher._id}>{teacher.name}</option>
              ))}
            </select>

            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="border p-1 rounded ml-2"
            >
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="border p-1 rounded ml-2"
            />

            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="border p-1 rounded ml-2"
            />

            <button
              onClick={() => assignTeacherWithSchedule(selectedStudentDetail._id)}
              className="ml-2 bg-blue-600 text-white px-2 py-1 rounded"
            >
              Assign
            </button>
          </div>

          {/* Assignments */}
          <div>
            <h3 className="font-semibold mb-2">Assignments</h3>
            {selectedStudentDetail.assignments?.length === 0 ? (
              <p>No assignments given yet.</p>
            ) : (
              <table className="w-full border rounded">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2">Subject</th>
                    <th className="border p-2">Teacher</th>
                    <th className="border p-2">File</th>
                    <th className="border p-2">Uploaded At</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStudentDetail.assignments.map((a: any) => (
                    <tr key={a._id} className="hover:bg-gray-50">
                      <td className="border p-2">{a.subject}</td>
                      <td className="border p-2">
                        {teacherStudents.find(t => t._id === a.teacherId)?.name || "Unknown"}
                      </td>
                      <td className="border p-2">
                        <a href={a.url} target="_blank" className="text-blue-600 underline">
                          {a.filename || "View"}
                        </a>
                      </td>
                      <td className="border p-2">{new Date(a.uploadedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ---------------- The rest of your dashboard (Users, Classes, Meetings, Attendance) ---------------- */}
      {/* Keep all your existing code for Users Table, Class Management, AssignmentUpload, Meetings, Attendance here */}
    </div>
  );
}