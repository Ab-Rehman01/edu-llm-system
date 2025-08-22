// src/utils/zoom.ts
export function extractMeetingNumberAndPwd(link: string) {
  const num = link.match(/\/j\/(\d+)/)?.[1] || link.match(/(\d{9,11})/)?.[1] || "";
  const pwd = link.match(/[?&]pwd=([^&]+)/)?.[1] || "";
  return { meetingNumber: num, password: pwd };
}