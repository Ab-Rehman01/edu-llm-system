// api/zoom/route.ts (Next.js API Route)
import { insertDoc, getDocs } from "@/lib/mongodb";

export async function POST(req: Request) {
  const body = await req.json();

  await insertDoc("meetings", {
    meetingNumber: body.meetingNumber,
    userName: body.userName,
    createdAt: new Date(),
  });

  return Response.json({ success: true });
}

export async function GET() {
  const meetings = await getDocs("meetings");
  return Response.json(meetings);
}