// src/lib/authOptions.ts
// src/lib/authOptions.ts
// src/lib/authOptions.ts
// src/lib/authOptions.ts
// src/lib/authOptions.ts
import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";

interface UserWithRole {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
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

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        } as UserWithRole;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as UserWithRole).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.sub;
      }
      return session;
    },
  },

  session: {
    strategy: "jwt" as const,
  },

  secret: process.env.NEXTAUTH_SECRET,
};
