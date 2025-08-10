// next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role?: string;  // aapka custom role property
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
  }
}
