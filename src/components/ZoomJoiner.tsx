
//ZoominL=linejoiner.tsx
"use client";

"use client";
import { useEffect } from "react";

declare global {
  interface Window {
    ZoomMtgEmbedded: any;
  }
}

export default function ZoomJoiner({ meetingNumber, userName }: { meetingNumber: string; userName: string }) {
  useEffect(() => {
    const initZoom = async () => {
      const role = 0; // 0 = attendee, 1 = host

      // 1. Get signature from API
      const res = await fetch("/api/zoom/signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingNumber, role }),
      });
      const { signature } = await res.json();

      const sdkKey = process.env.NEXT_PUBLIC_ZOOM_SDK_KEY!;

      // 2. Load Zoom SDK
      const client = window.ZoomMtgEmbedded.createClient();

      let meetingSDKElement = document.getElementById("meetingSDKElement");
      client.init({ zoomAppRoot: meetingSDKElement, language: "en-US" });

      // 3. Join Meeting
      await client.join({
        sdkKey,
        signature,
        meetingNumber,
        password: "",
        userName,
      });
    };

    initZoom();
  }, [meetingNumber, userName]);

  return <div id="meetingSDKElement" style={{ width: "100%", height: "600px" }} />;
}
// "use client";

// import { useEffect, useRef, useState } from "react";
// import ZoomMtgEmbedded from "@zoom/meetingsdk/embedded";

// type Props = {
//   meetingId: string;        // Zoom meeting number (digits)
//   meetingPassword?: string; // optional
//   userName: string;
//   userEmail?: string;
//   classId: string;
//   dbMeetingId: string;      // Mongo _id of your meeting doc (for attendance)
//   userId: string;           // current logged-in user id/email
//   onClose?: () => void;
// };

// export default function ZoomInlineJoiner(props: Props) {
//   const {
//     meetingId, meetingPassword = "",
//     userName, userEmail,
//     classId, dbMeetingId, userId, onClose
//   } = props;

//   const containerRef = useRef<HTMLDivElement>(null);
//   const clientRef = useRef<any>(null);
//   const [joinAt, setJoinAt] = useState<number | null>(null);

//   // helper: attendance POST
//   async function logAttendance(kind: "join" | "leave") {
//     try {
//       const now = Date.now();
//       const payload: any = {
//         meetingId: dbMeetingId,
//         classId,
//         userId,
//       };
//       if (kind === "join") {
//         payload.joinTime = new Date(now).toISOString();
//       } else {
//         payload.leaveTime = new Date(now).toISOString();
//         if (joinAt) payload.durationMs = now - joinAt;
//       }
//       await fetch("/api/meetings/attendance", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//     } catch {}
//   }

//   useEffect(() => {
//     let unsubVis: any;
//     let unsubUnload: any;

//     async function go() {
//       if (!containerRef.current) return;

//       // 1) signature
//       const sigRes = await fetch("/api/zoom/signature", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ meetingNumber: meetingId, role: 0 }),
//       });
//       const { signature } = await sigRes.json();

//       // 2) init client
//       const client = ZoomMtgEmbedded.createClient();
//       clientRef.current = client;

//       await client.init({
//         zoomAppRoot: containerRef.current,
//         language: "en-US",
//         patchJsMedia: true,
//       });

//       // 3) join meeting
//       await client.join({
//         signature,
//         sdkKey: process.env.NEXT_PUBLIC_ZOOM_SDK_KEY, // optional for some versions; if needed expose safely
//         meetingNumber: meetingId,
//         password: meetingPassword || "",
//         userName,
//         userEmail,
//       });

//       setJoinAt(Date.now());
//       logAttendance("join");

//       // 4) connection-change events
//       client.on("connection-change", (payload: any) => {
//         // statuses: "Connecting", "Connected", "Reconnecting", "Closed"
//         if (payload.state === "Closed") {
//           logAttendance("leave");
//           onClose?.();
//         }
//       });

//       // 5) tab close / reload safety
//       const visHandler = () => {
//         if (document.visibilityState === "hidden") {
//           logAttendance("leave");
//         }
//       };
//       const unloadHandler = () => {
//         logAttendance("leave");
//       };

//       document.addEventListener("visibilitychange", visHandler);
//       window.addEventListener("beforeunload", unloadHandler);

//       unsubVis = () => document.removeEventListener("visibilitychange", visHandler);
//       unsubUnload = () => window.removeEventListener("beforeunload", unloadHandler);
//     }

//     go();

//     return () => {
//       unsubVis?.();
//       unsubUnload?.();
//       try {
//         clientRef.current?.leave?.();
//       } catch {}
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [meetingId]);

//   return (
//     <div className="border rounded-2xl overflow-hidden bg-black/60">
//       {/* yahan Zoom render hoga */}
//       <div id="zoom-container" ref={containerRef} className="w-full h-[75vh]" />
//     </div>
//   );
// }