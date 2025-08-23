// src/utils/zoom.ts
function extractMeetingId(link: string): string {
  const match = link.match(/\/j\/(\d+)/);
  return match ? match[1] : "";
}

function extractPassword(link: string): string {
  const url = new URL(link);
  return url.searchParams.get("pwd") || "";
}
// export function extractMeetingNumberAndPwd(link: string) {
//   const num = link.match(/\/j\/(\d+)/)?.[1] || link.match(/(\d{9,11})/)?.[1] || "";
//   const pwd = link.match(/[?&]pwd=([^&]+)/)?.[1] || "";
//   return { meetingNumber: num, password: pwd };
// }

