// src/lib/authOptions.ts
// src/lib/authOptions.ts
// src/lib/authOptions.ts
import { User, Account, Profile, Session } from "next-auth";
import type { AdapterUser } from "next-auth/adapters";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";

interface UserWithRole extends User {
  role?: string;  // add role as optional field
  // do NOT redefine id here to avoid conflict, keep it as string required
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const client = await clientPromise;
        const db = client.db("education-system");

        const user = await db.collection("users").findOne({ email: credentials.email });
        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
      },
    }),
  ],

  callbacks: {
    async jwt(params: {
      token: JWT;
      user?: User | AdapterUser | null;
      account?: Account | null;
      profile?: Profile;
      trigger?: "signIn" | "signUp" | "update";
      isNewUser?: boolean;
      session?: any;
    }): Promise<JWT> {
      const { token, user } = params;
      if (user) {
        (token as any).role = (user as any).role;
      }
      return token;
    },

    async session(params: { session: Session; token: JWT }) {
      const { session, token } = params;
      if (session.user) {
        // Only assign id if token.sub is a string (NextAuth usually ensures this)
        if (typeof token.sub === "string") {
          (session.user as UserWithRole).id = token.sub;
        }
        (session.user as UserWithRole).role = (token as any).role;
      }
      return session;
    },
  },

  session: { strategy: "jwt" as const },
  secret: process.env.NEXTAUTH_SECRET,
};
