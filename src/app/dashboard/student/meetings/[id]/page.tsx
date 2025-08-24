//dashboard/student/meetings/[id]/page.tsx

"use client";
import { useEffect } from "react";
import { ZoomMtg } from "@zoomus/websdk";

ZoomMtg.setZoomJSLib("https://source.zoom.us/2.18.2/lib", "/av");
ZoomMtg.preLoadWasm();
ZoomMtg.prepareWebSDK();

export default function StudentMeetingPage({ params }: { params: { id: string } }) {
  const meetingNumber = params.id; // Meeting ID
  const userName = "Student User";
  const userEmail = "student@example.com"; // can be dynamic
  const passWord = ""; // if meeting has password

  useEffect(() => {
    const startMeeting = async () => {
      const res = await fetch("/api/zoom/signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingNumber, role: 0 }), // role 0 = student
      });

      const { signature } = await res.json();

      ZoomMtg.init({
        leaveUrl: "/student/dashboard",
        success: () => {
          ZoomMtg.join({
            signature,
            sdkKey: process.env.NEXT_PUBLIC_ZOOM_SDK_KEY!,
            meetingNumber,
            userName,
            passWord,
            userEmail,
            success: () => {
              console.log("Joined meeting");

              // Track join
              fetch("/api/zoom/attendance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ meetingId: meetingNumber, userId: userEmail, action: "join" }),
              });
            },
           error: (err: any) => console.error(err)
          });
        },
      });

      // Track leave (when browser closed or left)
      window.addEventListener("beforeunload", () => {
        fetch("/api/zoom/attendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ meetingId: meetingNumber, userId: userEmail, action: "leave" }),
        });
      });
    };

    startMeeting();
  }, []);

  return <div id="zmmtg-root"></div>;
}