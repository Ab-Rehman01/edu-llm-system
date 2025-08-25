"use client";

import { useSession } from "next-auth/react";
import { useEffect, useMemo, useRef, useState } from "react";

type Assignment = {
  _id: string;
  url: string;
  filename?: string;
  subject: string;
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

type Platform = "zoom" | "jitsi" | null;

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected assignment/meeting
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(null);
  const joinStartedAtRef = useRef<Date | null>(null);

  // ---------------- Attendance helpers ----------------
  const saveJoin = async (m: Meeting) => {
    if (!session?.user) return;
    joinStartedAtRef.current = new Date();
    const userId = (session.user as any)._id || (session.user as any).id || session.user.email;
    try {
  await fetch("/api/attendance/join", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    meetingId: m._id,
    studentId: userId,       // studentId route me expect ho raha
    studentName: session.user.name,
  }),
});
    } catch (err) {
      console.error("Join save failed", err);
    }
  };

  const saveLeave = async () => {
    if (!selectedMeeting || !session?.user || !joinStartedAtRef.current) return;
    const leaveTime = new Date();
    const durationMs = leaveTime.getTime() - joinStartedAtRef.current.getTime();
    const userId = (session.user as any)._id || (session.user as any).id || session.user.email;

    try {
      await fetch("/api/attendance/leave", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    meetingId: selectedMeeting._id,
    studentId: userId,
  }),
});
    } catch (err) {
      console.error("Leave save failed", err);
    }

    setSelectedMeeting(null);
    setSelectedPlatform(null);
    joinStartedAtRef.current = null;
  };

  const handleJoin = async (m: Meeting, platform: Platform) => {
    setSelectedMeeting(m);
    setSelectedPlatform(platform);
    await saveJoin(m);

    // Open link in new tab
    const url = platform === "zoom" ? m.joinUrlZoom : m.joinUrlJitsi;
    if (url) window.open(url, "_blank");
  };

  // ---------------- Fetch data ----------------
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.classId) return;

    const fetchData = async () => {
      try {
        const [assignmentsRes, meetingsRes] = await Promise.all([
          fetch(`/api/assignments/list?classId=${session.user.classId}`).then((res) => res.json()),
          fetch(`/api/meetings/list?classId=${session.user.classId}`).then((res) => res.json()),
        ]);
        setAssignments(assignmentsRes.assignments || []);
        setMeetings(meetingsRes.meetings || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [status, session]);

  if (loading) return <p>Loading dashboard...</p>;

  const getFileIcon = (url: string) => {
    if (url.endsWith(".pdf")) return "📄";
    if (url.match(/\.(jpg|jpeg|png|gif)$/)) return "🖼️";
    if (url.match(/\.(mp4|webm|ogg)$/)) return "🎬";
    return "📎";
  };

  const effectiveZoomUrl = (m?: Meeting) => m?.joinUrlZoom || "";

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Student Dashboard</h1>

      {/* Assignments */}
      <h2 className="mb-4">Assignments for your class</h2>
      {assignments.length === 0 && <p>No assignments found.</p>}
      <ul className="space-y-3">
        {assignments.map((a) => (
          <li key={a._id} className="border p-3 rounded flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getFileIcon(a.url)}</span>
              <div>
                <strong>Subject:</strong> {a.subject} <br />
                <strong>Uploaded:</strong> {new Date(a.uploadedAt).toLocaleString()} <br />
                <button
                  onClick={() => setSelectedAssignment(a)}
                  className="text-blue-600 hover:underline mt-1"
                >
                  {a.filename || "View Assignment"}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Meetings */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Meetings</h2>
        {meetings.length === 0 ? (
          <p>No meetings scheduled.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meetings.map((m) => (
              <div
                key={m._id}
                className="bg-white/10 border border-white/20 rounded-2xl p-5 shadow hover:shadow-lg transition duration-300"
              >
                <p className="text-lg font-bold text-yellow-300 mb-2">
                  {(m.topic || "Class Meeting")} — {m.date} @ {m.time}
                </p>
                {m.createdBy && (
                  <p>
                    <span className="font-semibold">Created By:</span> {m.createdBy}
                  </p>
                )}
                {m.createdAt && (
                  <p>
                    <span className="font-semibold">Created At:</span>{" "}
                    {new Date(m.createdAt).toLocaleString()}
                  </p>
                )}

                <div className="flex flex-col gap-2 mt-4">
                  {m.joinUrlZoom && (
                    <button
                      onClick={() => handleJoin(m, "zoom")}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
                    >
                      Join Zoom
                    </button>
                  )}
                  {m.joinUrlJitsi && (
                    <button
                      onClick={() => handleJoin(m, "jitsi")}
                      className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg shadow hover:bg-black transition mt-2"
                    >
                      Join Jitsi
                    </button>
                  )}
                  {!m.joinUrlZoom && !m.joinUrlJitsi && (
                    <span className="text-sm text-red-200">No join link configured.</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Leave button */}
        {selectedMeeting && (
          <div className="mt-4">
            <button
              onClick={saveLeave}
              className="bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 transition"
            >
              Leave Meeting
            </button>
          </div>
        )}
      </section>

      {/* Selected Assignment View */}
      {selectedAssignment && (
        <div className="mt-6 border-t pt-4">
          <h2 className="text-xl font-semibold mb-2">
            Viewing: {selectedAssignment.filename}
          </h2>
          <p className="text-gray-600 mb-2">
            <strong>Uploaded At:</strong>{" "}
            {new Date(selectedAssignment.uploadedAt).toLocaleString()}
          </p>

          {selectedAssignment.url.endsWith(".pdf") && (
            <iframe
              src={selectedAssignment.url}
              className="w-full h-[600px] border"
              title={selectedAssignment.filename}
            />
          )}

          {selectedAssignment.url.match(/\.(jpg|jpeg|png|gif)$/) && (
            <img
              src={selectedAssignment.url}
              alt={selectedAssignment.filename}
              className="max-w-full h-auto border"
            />
          )}

          {selectedAssignment.url.match(/\.(mp4|webm|ogg)$/) && (
            <video controls className="w-full max-h-[600px] border">
              <source src={selectedAssignment.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}

          {!selectedAssignment.url.match(/\.(pdf|jpg|jpeg|png|gif|mp4|webm|ogg)$/) && (
            <p>
              File type not supported for inline view.{" "}
              <a
                href={selectedAssignment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Download
              </a>
            </p>
          )}
        </div>
      )}
    </div>
  );
}


// "use client";

// import { useSession } from "next-auth/react";
// import { useEffect, useMemo, useRef, useState } from "react";
// import dynamic from "next/dynamic";

// // keep your Zoom SDK joiner (only works if you later add a paid Zoom account)
// const ZoomJoiner = dynamic(() => import("@/components/ZoomJoiner"), { ssr: false });
// // Jitsi embed (provided below)
// const JitsiEmbed = dynamic(() => import("@/components/JitsiEmbed"), { ssr: false });

// type Assignment = {
//   _id: string;
//   url: string;
//   filename?: string;
//   subject: string;
//   uploadedAt: string;
// };

// type Meeting = {
//   _id: string;
//   classId: string;
//   topic?: string;
//   date: string;         // "YYYY-MM-DD"
//   time: string;         // "HH:mm" 24h
//   joinUrl?: string;     // existing Zoom field
//   joinUrlZoom?: string; // optional
//   joinUrlJitsi?: string;// NEW
//   createdBy?: string;
//   createdAt?: string;
// };

// type Platform = "zoom" | "jitsi" | null;

// export default function StudentDashboard() {
//   const { data: session, status } = useSession();
//   const [assignments, setAssignments] = useState<Assignment[]>([]);
//   const [meetings, setMeetings] = useState<Meeting[]>([]);
//   const [loading, setLoading] = useState(true);

//   const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
//   const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
//   const [selectedPlatform, setSelectedPlatform] = useState<Platform>(null);

//   // countdown + attendance timers
//   const [countdown, setCountdown] = useState<number | null>(null);
//   const joinStartedAtRef = useRef<Date | null>(null);

//   // --- Fetch assignments ---
//   useEffect(() => {
//     if (status !== "authenticated" || !session?.user?.classId) return;
//     fetch(`/api/assignments/list?classId=${session.user.classId}`)
//       .then((res) => res.json())
//       .then((data) => setAssignments(data.assignments || []))
//       .finally(() => setLoading(false));
//   }, [status, session]);

//   // --- Fetch meetings (class-scoped) ---
//   useEffect(() => {
//     if (!session?.user?.classId) return;
//     fetch(`/api/meetings/list?classId=${session.user.classId}`)
//       .then((res) => res.json())
//       .then((data) => setMeetings(data.meetings || []))
//       .catch((e) => console.error("Error fetching meetings", e));
//   }, [session]);

//   // compute Date of selected meeting
//   const selectedMeetingDate = useMemo(() => {
//     if (!selectedMeeting) return null;
//     // Ensure we build a proper ISO timestamp using local timezone
//     // Fallback to simple `${date}T${time}` if time-zone handling is fine for you.
//     return new Date(`${selectedMeeting.date}T${selectedMeeting.time}:00`);
//   }, [selectedMeeting]);

//   // Countdown tick
//   useEffect(() => {
//     if (!selectedMeetingDate) return;

//     const tick = () => {
//       const now = new Date();
//       const diffSec = Math.floor((selectedMeetingDate.getTime() - now.getTime()) / 1000);
//       setCountdown(diffSec > 0 ? diffSec : 0);
//     };

//     tick(); // initial
//     const id = setInterval(tick, 1000);
//     return () => clearInterval(id);
//   }, [selectedMeetingDate]);

//   // Attendance save helper (single insert that includes both join+leave)
//   async function saveAttendance(leaveNow = false) {
//     if (!selectedMeeting || !session?.user) return;
//     const classId = session.user.classId;
//     const userId =
//       // pick whatever you actually expose in session
//       // (adjust if your NextAuth session uses a different key)
//       (session.user as any)._id || (session.user as any).id || session.user.email;

//     const joinTime = joinStartedAtRef.current || new Date();
//     const leaveTime = leaveNow ? new Date() : undefined;
//     const durationMs = leaveNow ? (new Date().getTime() - joinTime.getTime()) : undefined;

//     try {
//       await fetch("/api/meetings/attendance", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           meetingId: selectedMeeting._id,
//           classId,
//           userId,
//           joinTime: joinTime.toISOString(),
//           leaveTime: leaveTime ? leaveTime.toISOString() : null,
//           durationMs: durationMs ?? null,
//         }),
//       });
//     } catch (e) {
//       console.error("attendance post failed", e);
//     }
//   }

//   // Before unload/close – try to record leave
//   useEffect(() => {
//     const handler = () => saveAttendance(true);
//     window.addEventListener("beforeunload", handler);
//     return () => window.removeEventListener("beforeunload", handler);
//   }, [selectedMeeting, session]); // rebind when meeting/session changes

//   if (loading) return <p>Loading assignments...</p>;

//   // --------- helpers ----------
//   const getFileIcon = (url: string) => {
//     if (url.endsWith(".pdf")) return "📄";
//     if (url.match(/\.(jpg|jpeg|png|gif)$/)) return "🖼️";
//     if (url.match(/\.(mp4|webm|ogg)$/)) return "🎬";
//     return "📎";
//   };

//   // parse Zoom meeting id/pwd from url
//   const extractMeetingId = (url?: string) => {
//     try {
//       if (!url) return "";
//       const match = url.match(/\/j\/(\d+)/);
//       return match ? match[1] : "";
//     } catch {
//       return "";
//     }
//   };

//   const extractPassword = (url?: string) => {
//     try {
//       if (!url) return "";
//       const params = new URL(url).searchParams;
//       return params.get("pwd") || "";
//     } catch {
//       return "";
//     }
//   };

//   // Which zoom URL to use
//   const effectiveZoomUrl = (m?: Meeting) => m?.joinUrlZoom || m?.joinUrl || "";

//   // On click join with specific platform
//   const handleJoin = (m: Meeting, platform: Platform) => {
//     setSelectedMeeting(m);
//     setSelectedPlatform(platform);
//     joinStartedAtRef.current = new Date(); // start timing
//   };

//   const handleClose = async () => {
//     await saveAttendance(true);
//     setSelectedMeeting(null);
//     setSelectedPlatform(null);
//     joinStartedAtRef.current = null;
//     setCountdown(null);
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-3xl font-bold mb-4">Student Dashboard</h1>

//       {/* Assignments */}
//       <h2 className="mb-4">Assignments for your class</h2>
//       {assignments.length === 0 && <p>No assignments found.</p>}
//       <ul className="space-y-3">
//         {assignments.map((a) => (
//           <li key={a._id} className="border p-3 rounded flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <span className="text-2xl">{getFileIcon(a.url)}</span>
//               <div>
//                 <strong>Subject:</strong> {a.subject} <br />
//                 <strong>Uploaded:</strong>{" "}
//                 {new Date(a.uploadedAt).toLocaleString()}{" "}
//                 <br />
//                 <button
//                   onClick={() => setSelectedAssignment(a)}
//                   className="text-blue-600 hover:underline mt-1"
//                 >
//                   {a.filename || "View Assignment"}
//                 </button>
//               </div>
//             </div>
//           </li>
//         ))}
//       </ul>

//       {/* Meetings */}
//       <section className="mt-10">
//         <h2 className="text-xl font-semibold mb-4">Meetings</h2>
//         {meetings.length === 0 ? (
//           <p>No meetings scheduled.</p>
//         ) : (
//           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {meetings.map((m) => {
//               const hasZoom = !!effectiveZoomUrl(m);
//               const hasJitsi = !!m.joinUrlJitsi;

//               return (
//                 <div
//                   key={m._id}
//                   className="bg-white/10 border border-white/20 rounded-2xl p-5 shadow hover:shadow-lg transition duration-300"
//                 >
//                   <p className="text-lg font-bold text-yellow-300 mb-2">
//                     {(m.topic || "Class Meeting")} — {m.date} @ {m.time}
//                   </p>
//                   {m.createdBy && (
//                     <p>
//                       <span className="font-semibold">Created By:</span>{" "}
//                       {m.createdBy}
//                     </p>
//                   )}
//                   {m.createdAt && (
//                     <p>
//                       <span className="font-semibold">Created At:</span>{" "}
//                       {new Date(m.createdAt).toLocaleString()}
//                     </p>
//                   )}

//                   <div className="flex flex-col gap-2 mt-4">
//                     {hasZoom && (
//                       <button
//                         onClick={() => handleJoin(m, "zoom")}
//                         className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
//                       >
//                         Join via Zoom
//                       </button>
//                     )}
//                     {hasJitsi && (
//                       <button
//                         onClick={() => handleJoin(m, "jitsi")}
//                         className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg shadow hover:bg-black transition"
//                       >
//                         Join via Jitsi
//                       </button>
//                     )}
//                     {!hasZoom && !hasJitsi && (
//                       <span className="text-sm text-red-200">No join link configured.</span>
//                     )}
//                   </div>
//                   </div>
//               );
//             })}
//           </div>
//         )}

//         {/* Join Area */}
//         {selectedMeeting && (
//           <div className="mt-10">
//             <h2 className="text-xl font-semibold mb-4">
//               {countdown !== null && countdown > 0
//                 ? `Meeting starts in ${Math.floor(countdown / 60)}m ${countdown % 60}s`
//                 : `Joining: ${(selectedMeeting.topic || "Meeting")} — ${selectedMeeting.date} @ ${selectedMeeting.time}`}
//             </h2>

//             {/* Show after countdown reaches 0 */}
//             {countdown === null || countdown <= 0 ? (
//               <>
//                 {selectedPlatform === "zoom" ? (
//                   <ZoomJoiner
//                     meetingNumber={extractMeetingId(effectiveZoomUrl(selectedMeeting))}
//                     password={extractPassword(effectiveZoomUrl(selectedMeeting))}
//                     userName={(session?.user?.name as string) || "Student"}
//                     userEmail={(session?.user?.email as string) || ""}
//                   />
//                 ) : selectedPlatform === "jitsi" ? (
//                   <div className="w-full h-[600px] border rounded overflow-hidden bg-black">
//                     <JitsiEmbed
//                       roomUrl={selectedMeeting.joinUrlJitsi as string}
//                       displayName={(session?.user?.name as string) || "Student"}
//                       email={(session?.user?.email as string) || ""}
//                     />
//                   </div>
//                 ) : null}
//               </>
//             ) : (
//               <div className="p-4 border rounded bg-gray-100 text-center">
//                 Please wait for the meeting to start...
//               </div>
//             )}

//             <button
//               onClick={handleClose}
//               className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg"
//             >
//               Close
//             </button>
//           </div>
//         )}
//       </section>

//       {/* Selected Assignment View */}
//       {selectedAssignment && (
//         <div className="mt-6 border-t pt-4">
//           <h2 className="text-xl font-semibold mb-2">
//             Viewing: {selectedAssignment.filename}
//           </h2>
//           <p className="text-gray-600 mb-2">
//             <strong>Uploaded At:</strong>{" "}
//             {new Date(selectedAssignment.uploadedAt).toLocaleString()}
//           </p>

//           {selectedAssignment.url.endsWith(".pdf") && (
//             <iframe
//               src={selectedAssignment.url}
//               className="w-full h-[600px] border"
//               title={selectedAssignment.filename}
//             />
//           )}

//           {selectedAssignment.url.match(/\.(jpg|jpeg|png|gif)$/) && (
//             <img
//               src={selectedAssignment.url}
//               alt={selectedAssignment.filename}
//               className="max-w-full h-auto border"
//             />
//           )}

//           {selectedAssignment.url.match(/\.(mp4|webm|ogg)$/) && (
//             <video controls className="w-full max-h-[600px] border">
//               <source src={selectedAssignment.url} type="video/mp4" />
//               Your browser does not support the video tag.
//             </video>
//           )}

//           {!selectedAssignment.url.match(/\.(pdf|jpg|jpeg|png|gif|mp4|webm|ogg)$/) && (
//             <p>
//               File type not supported for inline view.{" "}
//               <a
//                 href={selectedAssignment.url}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-blue-600 hover:underline"
//               >
//                 Download
//               </a>
//             </p>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }


// "use client";
// import { useSession } from "next-auth/react";
// import { useEffect, useState } from "react";

// type Assignment = {
//   _id: string;
//   url: string;
//   filename?: string;
//   subject: string;
//   uploadedAt: string;
// };

// type Meeting = {
//   _id: string;
//   classId: string;
//   date: string;
//   time: string;
//   meetingLink: string;
// };

// export default function StudentDashboard() {
//   const { data: session, status } = useSession();
//   const [assignments, setAssignments] = useState<Assignment[]>([]);
//   const [meetings, setMeetings] = useState<Meeting[]>([]);
//   const [loading, setLoading] = useState(true);
//   const backgroundImage = "/pexels-hai-nguyen-825252-1699414.jpg";

//   useEffect(() => {
//     if (status !== "authenticated" || !session?.user?.classId) return;

//     const fetchData = async () => {
//       try {
//         const [assignmentsRes, meetingsRes] = await Promise.all([
//           fetch(`/api/assignments/list?classId=${session.user.classId}`).then((res) => res.json()),
//           fetch(`/api/meetings?classId=${session.user.classId}`).then((res) => res.json()),
//         ]);

//         setAssignments(assignmentsRes.assignments || []);
//         setMeetings(meetingsRes.meetings || []);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [status, session]);

//   if (loading) return <p className="text-white">Loading dashboard...</p>;

//   return (
//     <div
//       className="min-h-screen w-full bg-fixed bg-center bg-cover flex flex-col p-6 relative"
//       style={{ backgroundImage: `url(${backgroundImage})` }}
//     >
//       <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-md"></div>
//       <div className="relative text-white">
//         <h1 className="text-3xl font-bold mb-2">Student Dashboard</h1>

//         {/* Assignments Section */}
//         <h2 className="mb-4">Assignments for your class</h2>
//         <ul>
//           {assignments.length === 0 && <li>No assignments found.</li>}
//           {assignments.map((a) => (
//             <li key={a._id} className="mb-3 border-b pb-2">
//               <strong>Subject:</strong> {a.subject} <br />
//               <strong>Uploaded At:</strong> {new Date(a.uploadedAt).toLocaleString()} <br />
//               <span className="text-blue-400">{a.filename || "View Assignment"}</span>
//             </li>
//           ))}
//         </ul>

//         {/* Meetings Section */}
//         <h2 className="mt-6 mb-4">Upcoming Class Meetings</h2>
//         <ul>
//           {meetings.length === 0 && <li>No meetings scheduled.</li>}
//           {meetings.map((m) => (
//             <li key={m._id} className="mb-3 border-b pb-2">
//               <strong>Date:</strong> {m.date} <br />
//               <strong>Time:</strong> {m.time} <br />
//               <a
//                 href={m.meetingLink}
//                 target="_blank"
//                 className="text-blue-400 underline"
//               >
//                 Join Meeting
//               </a>
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// }
// import RoleProtectedRoute from "@/components/RoleProtectedRoute";

// export default function StudentDashboard() {
//   return (
//     <RoleProtectedRoute allowedRoles={["student"]}>
//       <div className="p-6">
//         <h1 className="text-3xl font-bold">Student Dashboard</h1>
//         <p>Yahan apke assignments show honge.</p>
//       </div>
//     </RoleProtectedRoute>
//   );
// }

//dashboard/student/page.tsx
// "use client";
// import { useSession } from "next-auth/react";
// import { useEffect, useState } from "react";

// type Assignment = {
//   _id: string;
//   url: string;
//   filename?: string;
//   subject: string;
//   uploadedAt: string;
// };

// export default function StudentDashboard() {
//   const { data: session, status } = useSession();
//   const [assignments, setAssignments] = useState<Assignment[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

//   useEffect(() => {
//     if (status === "loading") return;
//     if (status !== "authenticated") return;
//     if (!session?.user?.classId) return;

//     fetch(`/api/assignments/list?classId=${session.user.classId}`)
//       .then(res => res.json())
//       .then(data => {
//         setAssignments(data.assignments || []);
//         setLoading(false);
//       })
//       .catch(() => setLoading(false));
//   }, [status, session]);

//   if (loading) return <p>Loading assignments...</p>;

//   const getFileIcon = (url: string) => {
//     if (url.endsWith(".pdf")) return "📄";
//     if (url.match(/\.(jpg|jpeg|png|gif)$/)) return "🖼️";
//     if (url.match(/\.(mp4|webm|ogg)$/)) return "🎬";
//     return "📎";
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-3xl font-bold mb-4">Student Dashboard</h1>
//       <h2 className="mb-4">Assignments for your class</h2>

//       {assignments.length === 0 && <p>No assignments found.</p>}

//       <ul className="space-y-3">
//         {assignments.map(a => (
//           <li key={a._id} className="border p-3 rounded flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <span className="text-2xl">{getFileIcon(a.url)}</span>
//               <div>
//                 <strong>Subject:</strong> {a.subject} <br />
//                 <strong>Uploaded:</strong> {new Date(a.uploadedAt).toLocaleString()} <br />
//                 <button
//                   onClick={() => setSelectedAssignment(a)}
//                   className="text-blue-600 hover:underline mt-1"
//                 >
//                   {a.filename || "View Assignment"}
//                 </button>
//               </div>
//             </div>
//           </li>
//         ))}
//       </ul>

//       {selectedAssignment && (
//         <div className="mt-6 border-t pt-4">
//           <h2 className="text-xl font-semibold mb-2">
//             Viewing: {selectedAssignment.filename}
//           </h2>
//           <p className="text-gray-600 mb-2">
//             <strong>Uploaded At:</strong>{" "}
//             {new Date(selectedAssignment.uploadedAt).toLocaleString()}
//           </p>

//           {selectedAssignment.url.endsWith(".pdf") && (
//             <iframe
//               src={selectedAssignment.url}
//               className="w-full h-[600px] border"
//               title={selectedAssignment.filename}
//             />
//           )}

//           {selectedAssignment.url.match(/\.(jpg|jpeg|png|gif)$/) && (
//             <img
//               src={selectedAssignment.url}
//               alt={selectedAssignment.filename}
//               className="max-w-full h-auto border"
//             />
//           )}

//           {selectedAssignment.url.match(/\.(mp4|webm|ogg)$/) && (
//             <video controls className="w-full max-h-[600px] border">
//               <source src={selectedAssignment.url} type="video/mp4" />
//               Your browser does not support the video tag.
//             </video>
//           )}

//           {!selectedAssignment.url.match(/\.(pdf|jpg|jpeg|png|gif|mp4|webm|ogg)$/) && (
//             <p>
//               File type not supported for inline view.{" "}
//               <a
//                 href={selectedAssignment.url}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-blue-600 hover:underline"
//               >
//                 Download
//               </a>
//             </p>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }
