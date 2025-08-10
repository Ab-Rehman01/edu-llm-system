// src/types/next-auth.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role?: string;  // your custom role property
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
  }
}
