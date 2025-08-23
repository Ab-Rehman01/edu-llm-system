//src/app/api/zoom/signature/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { meetingNumber, role } = await req.json();

    if (!meetingNumber) {
      return NextResponse.json({ error: "Meeting number required" }, { status: 400 });
    }

    const sdkKey = process.env.ZOOM_SDK_KEY!;
    const sdkSecret = process.env.ZOOM_SDK_SECRET!;
    const timestamp = new Date().getTime() - 30000;

    const msg = Buffer.from(sdkKey + meetingNumber + timestamp + role).toString("base64");
    const hash = crypto
      .createHmac("sha256", sdkSecret)
      .update(msg)
      .digest("base64");

    const signature = Buffer.from(
      `${sdkKey}.${meetingNumber}.${timestamp}.${role}.${hash}`
    ).toString("base64");

    return NextResponse.json({ signature });
  } catch (err) {
    return NextResponse.json({ error: "Signature generation failed" }, { status: 500 });
  }
}

// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";

// export async function POST(req: Request) {
//   try {
//     const { meetingNumber, role = 0 } = await req.json() as {
//       meetingNumber: string | number;
//       role?: 0 | 1; // 0 attendee, 1 host
//     };

//     if (!process.env.ZOOM_SDK_KEY || !process.env.ZOOM_SDK_SECRET) {
//       return NextResponse.json({ error: "Zoom SDK env missing" }, { status: 500 });
//     }
//     if (!meetingNumber) {
//       return NextResponse.json({ error: "meetingNumber required" }, { status: 400 });
//     }

//     const iat = Math.floor(Date.now() / 1000) - 30;
//     const exp = iat + 60 * 60 * 2;      // token valid ~2 hours
//     const tokenExp = iat + 60 * 60 * 2;

//     const payload = {
//       sdkKey: process.env.ZOOM_SDK_KEY,
//       mn: String(meetingNumber),
//       role,
//       iat,
//       exp,
//       appKey: process.env.ZOOM_SDK_KEY,
//       tokenExp,
//     };

//     const signature = jwt.sign(payload, process.env.ZOOM_SDK_SECRET, {
//       algorithm: "HS256",
//       header: { typ: "JWT" },
//     });

//     return NextResponse.json({ signature });
//   } catch (e) {
//     return NextResponse.json({ error: "Failed to create signature" }, { status: 500 });
//   }
// }