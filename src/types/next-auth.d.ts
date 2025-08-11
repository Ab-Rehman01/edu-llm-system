// src/types/next-auth.d.ts
// import { DefaultSession } from "next-auth";

// declare module "next-auth" {
//   interface Session {
//     user: {
//       role?: string;
//     } & DefaultSession["user"];
//   }

//   interface User {
//     role?: string;
//   }
// }

// declare module "next-auth/jwt" {
//   interface JWT {
//     role?: string;
//   }
// }
import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    classId?: string; // 👈 yaha add kiya
  }

  interface Session {
    user: User;
  }
}
