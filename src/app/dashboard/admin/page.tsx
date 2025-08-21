//dashboard/admin/page.tsx
"use client";

import AssignmentUpload from "@/components/AssignmentUpload";
import { useEffect, useState } from "react";

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  classId?: string;  // Add classId here
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
  meetingLink: string;
};

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  
  
   
  const [meeting, setMeeting] = useState({
    classId: "",
    date: "",
    time: "",
    meetingLink: "",
  });

  const createMeeting = async () => {
    await fetch("/api/meetings/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...meeting,
        createdBy: "admin", // TODO: actual logged-in admin ka ID dalna
      }),
    });
    alert("Meeting Created Successfully!");
    setMeeting({ classId: "", date: "", time: "", meetingLink: "" }); // reset form
  
  
  };


  // Fetch users
  useEffect(() => {
    fetch("/api/users/list")
      .then(res => res.json())
      .then(data => setUsers(data.users || data));
  }, []);

  // Fetch classes
  useEffect(() => {
    fetch("/api/classes/list")
      .then(res => res.json())
      .then(data => setClasses(data.classes || []));
  }, []);

  // meetings list ke liye state
const [meetings, setMeetings] = useState<Meeting[]>([]);

// fetch meetings
useEffect(() => {
  fetch("/api/meetings/list?classId=" + (selectedClassId || classes[0]?._id || ""))
    .then(res => res.json())
    .then(data => {
      console.log("Meetings fetched:", data); // debug
      setMeetings(data.meetings || []);
});
}, [selectedClassId, classes]);


  // Update user role or class
  const updateUser = async (userId: string, updates: Partial<{ role: string; classId: string }>) => {
  await fetch("/api/users/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, ...updates }),
  });

  setUsers(users.map(u => (u._id === userId ? { ...u, ...updates } : u)));
};

  

  // Redirect admin to selected class page
  const goToClassPage = (classId: string) => {
    window.location.href = `/dashboard/class/${classId}`; // Or use router.push if using Next.js router
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {/* Users table */}
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
          {users.map(user => (
            <tr key={user._id}>
              <td className="border p-2">{user.name}</td>
              <td className="border p-2">{user.email}</td>
              <td className="border p-2">
                <select
                  value={user.role}
                  onChange={e => updateUser(user._id, { role: e.target.value })}
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
                  onChange={e => updateUser(user._id, { classId: e.target.value })}
                  className="border p-1"
                >
                  <option value="">No Class</option>
                  {classes.map(cls => (
                    <option key={cls._id} value={cls._id}>{cls.name}</option>
                  ))}
                </select>
              </td>
              <td className="border p-2">Update</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Assignment Upload */}
      <AssignmentUpload role="admin" classId={selectedClassId || classes[0]?._id || ""} />

      {/* Classes List */}
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-2">Classes</h2>
        <ul>
          {classes.map(cls => (
            <li
              key={cls._id}
              onClick={() => goToClassPage(cls._id)}
              className="cursor-pointer text-blue-600 underline mb-1"
            >
              {cls.name}
            </li>
          ))}
        </ul>
      </div>
      
  
       

      {/* tumhara purana dashboard code */}

      {/* Zoom Link / Meeting Form */}
      <div className="mt-6 border p-4 rounded">
        <h2 className="text-xl font-bold mb-2">Create Class Meeting</h2>
        <select
          className="border p-2 mb-2 w-full"
          value={meeting.classId}
          onChange={(e) => setMeeting({ ...meeting, classId: e.target.value })}
        >
          <option value="">Select Class</option>
          {classes.map((cls) => (
            <option key={cls._id} value={cls._id}>{cls.name}</option>
          ))}
        </select>
        <input
          type="date"
          className="border p-2 mb-2 w-full"
          value={meeting.date}
          onChange={(e) => setMeeting({ ...meeting, date: e.target.value })}
        />
        <input
          type="time"
          className="border p-2 mb-2 w-full"
          value={meeting.time}
          onChange={(e) => setMeeting({ ...meeting, time: e.target.value })}
        />
        <input
          type="text"
          placeholder="Meeting Link"
          className="border p-2 mb-2 w-full"
          value={meeting.meetingLink}
          onChange={(e) => setMeeting({ ...meeting, meetingLink: e.target.value })}
        />
        <button
          onClick={createMeeting}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create Meeting
        </button>
      </div>
    

    </div>
  );
}