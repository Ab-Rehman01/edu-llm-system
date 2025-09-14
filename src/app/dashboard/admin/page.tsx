"use client";

import AssignmentUpload from "@/components/AssignmentUpload";
import { useEffect, useMemo, useState } from "react";

type ScheduleItem = {
  day: string; // "Mon", "Tue", ..., "Sun"
  time: string; // "19:00-20:00"
  teacherId: string;
  studentId: string;
};

type User = {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "teacher" | "student";
  classId?: string;
  teacherId?: string;
  schedule?: ScheduleItem[];
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
  url?: string;
  filename?: string;
  subject?: string;
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

  const [teacherStudents, setTeacherStudents] = useState<User[]>([]);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<any>(null);

  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");

  const [selectedTeacherDetail, setSelectedTeacherDetail] = useState<any>(null);

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
      .then((data) => setUsers(data.users || data))
      .catch(() => { });
  }, []);
  const loadUsers = async () => {
    const res = await fetch("/api/users/list", {

      cache: "no-store", // 🚫 koi cache nahi
    });
    const data = await res.json();
    setUsers(data.users || data);
  };

  useEffect(() => {
    loadUsers(); // ✅ yahan call karna zaroori hai
  }, []);
  // ---------------- Fetch Classes ----------------
  const loadClasses = async () => {
    try {
      const res = await fetch("/api/classes/list");
      const data = await res.json();
      setClasses(data.classes || []);
    } catch { }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  // Set default selected class
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
      .then((data) => setMeetings(data.meetings || []))
      .catch(() => { });
  }, [selectedClassId]);

  // ---------------- Fetch Attendance ----------------
  useEffect(() => {
    if (!selectedMeetingId) return;
    fetch(`/api/meetings/attendance/report/${selectedMeetingId}`)
      .then((res) => res.json())
      .then((data) => setAttendance(data || []))
      .catch(() => { });
  }, [selectedMeetingId]);

  // ---------------- Update User ----------------
  const handleUserUpdate = async (user: User) => {
    try {
      const res = await fetch(`/api/users/update-role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id, role: user.role }),
      });

      if (!res.ok) throw new Error("Update failed");

      const data = await res.json();
      alert(data.message);

      // state update
      setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, role: user.role } : u)));
    } catch (err) {
      console.error(err);
      alert("User update failed");
    }
  };

  // ---------------- Assign teacher (simple) ----------------
  const handleTeacherAssign = async (studentId: string, teacherId: string) => {
    try {
      const res = await fetch("/api/users/assign-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, teacherId }),
      });
      if (!res.ok) throw new Error("Failed to assign teacher");

      const data = await res.json();
      setUsers((prev) =>
        prev.map((u) => (u._id === studentId ? { ...u, teacherId } : u))
      );
      alert(data.message);
    } catch (err) {
      console.error(err);
      alert("Teacher assignment failed");
    }
  };

  // ---------------- Teacher -> Students pane helper ----------------
  const loadTeacherStudents = (teacherId: string) => {
    const teacher = users.find((u) => u._id === teacherId);
    const students = users.filter(
      (u) => u.role === "student" && u.teacherId === teacherId
    );
    setSelectedTeacherDetail({
      ...(teacher || { _id: teacherId, name: "Teacher" }),
      students,
      assignments: [], // if you later fetch from API, replace this
    });
  };

  // ---------------- Student detail loader ----------------
  const loadStudentDetail = async (studentId: string) => {
    try {
      const res = await fetch(`/api/admin/students/${studentId}`);
      const data = await res.json();
      setSelectedStudentDetail(data);
    } catch {
      // fallback from local state if API not available
      const local = users.find((u) => u._id === studentId);
      if (local) {
        setSelectedStudentDetail({
          ...local,
          assignments: [],
        });
      }
    }
  };

  // Fill teacherStudents whenever selectedStudentDetail changes
  useEffect(() => {
    if (!selectedStudentDetail) {
      setTeacherStudents([]);
      return;
    }
    const ids = new Set<string>();

    if (selectedStudentDetail.teacherId) {
      ids.add(selectedStudentDetail.teacherId);
    }
    if (Array.isArray(selectedStudentDetail.schedule)) {
      selectedStudentDetail.schedule.forEach((s: ScheduleItem) =>
        ids.add(s.teacherId)
      );
    }

    const list = users.filter(
      (u) => u.role === "teacher" && ids.has(u._id as string)
    );
    setTeacherStudents(list);
  }, [selectedStudentDetail, users]);

  // ---------------- Assign Teacher with Schedule ----------------
const assignTeacherWithSchedule = async (studentId: string) => {
  if (!studentId) {
    alert("Select a student first (open student portal).");
    return;
  }
  if (!selectedTeacherId || selectedDays.length === 0 || !startTime || !endTime) {
    alert("Select teacher, at least one day, and time");
    return;
  }

  try {
    // multiple schedules generate
    const schedules = selectedDays.map((day) => ({
      day,
      time: `${startTime}-${endTime}`,
    }));

    const res = await fetch("/api/users/assign-teacher-schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId,
        teacherId: selectedTeacherId,
        schedule: schedules, // array send
      }),
    });

    if (!res.ok) throw new Error("Failed to assign");

    const data = await res.json();
    alert(data.message);

    // update local users list
    setUsers((prev) =>
      prev.map((u) =>
        u._id === studentId
          ? {
              ...u,
              teacherId: selectedTeacherId,
              schedule: [
                ...(u.schedule || []),
                ...schedules.map((s) => ({
                  ...s,
                  teacherId: selectedTeacherId,
                  studentId,
                })),
              ],
            }
          : u
      )
    );

    // update selected student detail
    setSelectedStudentDetail((prev: any) =>
      prev && prev._id === studentId
        ? {
            ...prev,
            teacherId: selectedTeacherId,
            schedule: [
              ...(prev.schedule || []),
              ...schedules.map((s) => ({
                ...s,
                teacherId: selectedTeacherId,
                studentId,
              })),
            ],
          }
        : prev
    );

    // reset selection
    setSelectedTeacherId("");
    setSelectedDays([]);
    setStartTime("");
    setEndTime("");
  } catch (err) {
    console.error(err);
    alert("Assignment failed");
  }
};
  // ---------------- Save New Meeting ----------------
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

  const teachers = useMemo(
    () => users.filter((u) => u.role === "teacher"),
    [users]
  );
  const students = useMemo(
    () => users.filter((u) => u.role === "student"),
    [users]
  );

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
            {teachers.map((teacher) => (
              <tr key={teacher._id}>
                <td className="border p-2">{teacher.name}</td>
                <td className="border p-2">{teacher.email}</td>
                <td className="border p-2">
                  <button
                    onClick={() => loadTeacherStudents(teacher._id)}
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

      {selectedTeacherDetail && (
        <div className="bg-gray-50 p-4 rounded shadow mt-4">
          <h3 className="text-lg font-bold mb-2">
            {selectedTeacherDetail.name}'s Portal
          </h3>

          <h4 className="font-semibold mt-2">Assigned Students</h4>
          <ul>
            {selectedTeacherDetail.students?.map((student: User) => (
              <li key={student._id}>
                {student.name} - Schedule:
                {student.schedule
                  ?.filter((s) => s.teacherId === selectedTeacherDetail._id)
                  .map((s: ScheduleItem, idx: number) => (
                    <span key={idx}> {s.day} {s.time}; </span>
                  ))}
              </li>
            ))}
          </ul>

          <h4 className="font-semibold mt-2">Assignments Given</h4>
          <ul>
            {selectedTeacherDetail.assignments?.map((a: Assignment) => {
              const student = users.find((u) => u._id === a.studentId);
              return <li key={a._id}>{a.title} → {student?.name}</li>;
            })}
          </ul>
        </div>
      )}

      {/* ---------------- Students ---------------- */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <h2 className="text-xl font-semibold p-4 border-b">Students</h2>
        <table className="w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">Name</th>
              <th className="border p-2 text-left">Email</th>
              <th className="border p-2 text-left">Teacher</th>
              <th className="border p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student._id}>
                <td className="border p-2">{student.name}</td>
                <td className="border p-2">{student.email}</td>
                <td className="border p-2">
                  <select
                    value={student.teacherId || ""}
                    onChange={async (e) =>
                      handleTeacherAssign(student._id, e.target.value)
                    }
                    className="border p-1 rounded"
                  >
                    <option value="">Not Assigned</option>
                    {teachers.map((teacher) => (
                      <option key={teacher._id} value={teacher._id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border p-2">
                  <button
                    onClick={() => loadStudentDetail(student._id)}
                    className="text-indigo-600 underline"
                  >
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
        <div className="bg-gray shadow rounded-lg p-4 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {selectedStudentDetail.name}'s Portal
          </h2>

          {/* Assign teacher + schedule for this selected student */}
          <div className="border p-2 mb-4 rounded">
            <div className="font-semibold mb-2">Assign Teacher with Schedule</div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="border p-1 rounded"
              >
                <option value="">Not Assigned</option>
                {teachers.map((teacher) => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.name}
                  </option>
                ))}
              </select>


              <select
                multiple
                value={selectedDays}
                onChange={(e) =>
                  setSelectedDays(Array.from(e.target.selectedOptions, (option) => option.value))
                }
                className="border p-1 rounded"
              >
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <p>Selected Days: {selectedDays.join(", ")}</p>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="border p-1 rounded"
              />

              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="border p-1 rounded"
              />

              <button
                onClick={() =>
                  assignTeacherWithSchedule(selectedStudentDetail?._id || "")
                }
              >
                Assign
              </button>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold">Assigned Teachers</h3>
            {teacherStudents.length === 0 ? (
              <p>No teachers assigned yet.</p>
            ) : (
              <ul className="list-disc pl-5">
                {teacherStudents.map((t) => (
                  <li key={t._id}>
                    {t.name} ({t.email})
                  </li>
                ))}
              </ul>
            )}
          </div>

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
                  {selectedStudentDetail.assignments?.map((a: Assignment) => (
                    <tr key={a._id} className="hover:bg-gray-50">
                      <td className="border p-2">{a.subject}</td>
                      <td className="border p-2">
                        {teacherStudents.find((t) => t._id === a.teacherId)?.name ||
                          "Unknown"}
                      </td>
                      <td className="border p-2">
                        <a
                          href={a.url}
                          target="_blank"
                          className="text-blue-600 underline"
                        >
                          {a.filename || "View"}
                        </a>
                      </td>
                      <td className="border p-2">
                        {a.uploadedAt ? new Date(a.uploadedAt).toLocaleString() : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Quick view: schedule & assignments summary */}
          {/* <div className="bg-gray-50 p-4 rounded shadow mt-4">
            <h3 className="text-lg font-bold mb-2">
              {selectedStudentDetail.name}'s Portal
            </h3>

            <h4 className="font-semibold mt-2">Teachers</h4>
            <ul>
              {selectedStudentDetail.schedule?.map((s: ScheduleItem, idx: number) => {
                const teacher = users.find((u) => u._id === s.teacherId);
                return (
                  <li key={idx}>
                    {teacher?.name} - {s.day} {s.time}
                  </li>
                );
              })}
            </ul>

            <h4 className="font-semibold mt-2">Assignments</h4>
            <ul>
              {selectedStudentDetail.assignments?.map((a: Assignment) => {
                const teacher = users.find((u) => u._id === a.teacherId);
                return (
                  <li key={a._id}>
                    {a.title} (from {teacher?.name})
                  </li>
                );
              })}
            </ul>
          </div> */}
        </div>
      )}

      {/* ---------------- Users (All) ---------------- */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <h2 className="text-xl font-semibold p-4 border-b">Users</h2>
        <table className="w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">Name</th>
              <th className="border p-2 text-left">Email</th>
              <th className="border p-2 text-left">Role</th>
              <th className="border p-2 text-left">Class</th>
              <th className="border p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50 transition">
                <td className="border p-2">{user.name}</td>
                <td className="border p-2">{user.email}</td>
                <td className="border p-2">
                  <select
                    value={user.role}
                    onChange={(e) => {
                      const newRole = e.target.value as User["role"];
                      setUsers((prev) =>
                        prev.map((u) =>
                          u._id === user._id ? { ...u, role: newRole } : u
                        )
                      );
                    }}
                    className="border p-1 rounded"
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
                      setUsers((prev) =>
                        prev.map((u) =>
                          u._id === user._id ? { ...u, classId: e.target.value } : u
                        )
                      )
                    }
                    className="border p-1 rounded"
                  >
                    <option value="">No Class</option>
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border p-2">
                  <button
                    onClick={() => handleUserUpdate(user)}
                    className="text-blue-600 underline cursor-pointer"
                  >
                    Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---------------- Class Management ---------------- */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">Manage Classes</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="New class name"
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <button
            onClick={createClass}
            className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700"
          >
            Add
          </button>
        </div>
        <table className="w-full border rounded-lg overflow-hidden shadow-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">Class Name</th>
              <th className="border p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((cls) => (
              <tr key={cls._id}>
                <td className="border p-2">
                  <input
                    type="text"
                    value={cls.name}
                    onChange={(e) =>
                      setClasses((prev) =>
                        prev.map((c) =>
                          c._id === cls._id ? { ...c, name: e.target.value } : c
                        )
                      )
                    }
                    className="border p-1 rounded w-full"
                  />
                </td>
                <td className="border p-2 space-x-2">
                  <button
                    onClick={() => updateClass(cls._id, cls.name)}
                    className="text-blue-600 underline"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => deleteClass(cls._id)}
                    className="text-red-600 underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---------------- Assignment Upload ---------------- */}
      <AssignmentUpload
        role="admin"
        classId={selectedClassId || classes[0]?._id || ""}
      />

      {/* ---------------- Select Class ---------------- */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">Select Class</h2>
        <select
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          className="border p-2 w-full rounded"
        >
          {classes.map((cls) => (
            <option key={cls._id} value={cls._id}>
              {cls.name}
            </option>
          ))}
        </select>
      </div>

      {/* ---------------- Meetings Table ---------------- */}
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
                  <td className="border p-2 font-semibold">
                    {m.topic || "Class Meeting"}
                  </td>
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

      {/* ---------------- Attendance Table ---------------- */}
      {selectedMeetingId && (
        <div className="bg-white shadow-md rounded-lg p-4 mb-6">
          <h2 className="text-xl font-semibold mb-4">Attendance Report</h2>
          <table className="w-full border rounded-lg overflow-hidden shadow-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2 text-left">Student</th>
                <th className="border p-2 text-left">Join Time</th>
                <th className="border p-2 text-left">Leave Time</th>
                <th className="border p-2 text-left">Duration (min)</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((r, idx) => {
                const student = users.find((u) => u._id === r.studentId);
                return (
                  <tr key={idx} className="hover:bg-gray-50 transition">
                    <td className="border p-2">
                      {student?.name || r.studentId}
                    </td>
                    <td className="border p-2">
                      {r.joinTime
                        ? new Date(r.joinTime).toLocaleTimeString()
                        : "-"}
                    </td>
                    <td className="border p-2">
                      {r.leaveTime
                        ? new Date(r.leaveTime).toLocaleTimeString()
                        : "-"}
                    </td>
                    <td className="border p-2">{r.duration ?? "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}