//dashboard/student/page.tsx
"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
const ZoomJoiner = dynamic(() => import("@/components/ZoomJoiner"), {
  ssr: false,
});

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
  date: string;
  time: string;
  meetingLink: string;
  createdBy: string;
  createdAt: string;
};

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  useEffect(() => {
    if (status === "loading") return;
    if (status !== "authenticated") return;
    if (!session?.user?.classId) return;

    fetch(`/api/assignments/list?classId=${session.user.classId}`)
      .then(res => res.json())
      .then(data => {
        setAssignments(data.assignments || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [status, session]);
  // fetch meetings
  useEffect(() => {
    if (!session?.user?.classId) return;

    fetch("/api/meetings/list?classId=" + session.user.classId)
      .then(res => res.json())
      .then(data => {
        console.log("Meetings fetched:", data); // debug
        setMeetings(data.meetings || []);
      })
      .catch(err => console.error("Error fetching meetings", err));
  }, [session]);
  if (loading) return <p>Loading assignments...</p>;

  const getFileIcon = (url: string) => {
    if (url.endsWith(".pdf")) return "📄";
    if (url.match(/\.(jpg|jpeg|png|gif)$/)) return "🖼️";
    if (url.match(/\.(mp4|webm|ogg)$/)) return "🎬";
    return "📎";
  };

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold mb-4">Student Dashboard</h1>
      <h2 className="mb-4">Assignments for your class</h2>

      {assignments.length === 0 && <p>No assignments found.</p>}


      <ul className="space-y-3">
        {assignments.map(a => (
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
      {/* 📅 Meetings Section */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Meetings</h2>
        {meetings.length === 0 ? (
          <p>No meetings scheduled.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedMeeting && (
              <div className="mt-10">
                <h2 className="text-xl font-semibold mb-4">
                  Joining Meeting: {selectedMeeting.date} @ {selectedMeeting.time}
                </h2>
                <ZoomJoiner
                  meetingNumber={extractMeetingId(selectedMeeting.meetingLink)}
                  password={extractPassword(selectedMeeting.meetingLink)}
                  userName={session?.user?.name || "Student"}
                  userEmail={session?.user?.email || ""}
                />
                <button
                  onClick={() => setSelectedMeeting(null)}
                  className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                  Close Meeting
                </button>
              </div>
            )} </div>
        )}
      </section>

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
