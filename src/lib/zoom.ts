//lib/zoom

import { createHmac } from "crypto"; // Node.js only

export function generateZoomSignature(
  apiKey: string,
  apiSecret: string,
  meetingNumber: string,
  role: number
) {
  const timestamp = new Date().getTime() - 30000;
  const msg = Buffer.from(apiKey + meetingNumber + timestamp + role).toString("base64");
  const hash = createHmac("sha256", apiSecret).update(msg).digest("base64");
  const signature = `${apiKey}.${meetingNumber}.${timestamp}.${role}.${hash}`;
  return signature;
}