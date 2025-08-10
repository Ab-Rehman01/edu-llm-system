// src/lib/authOptions.ts
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";
import { JWT } from "next-auth/jwt";
import { Session, User } from "next-auth";

interface UserWithRole extends User {
  role?: string;
  id: string; // id ko required string banaya
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials?: Record<string, string>) {
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
          role: user.role 
        };
      },
    }),
  ],
 callbacks: {
  async jwt({ token, user }: { token: JWT; user?: UserWithRole }) {
    if (user) token.role = user.role;
    return token;
  },
  async session({ session, token }: { session: Session; token: JWT }) {
    (session.user as UserWithRole).id = typeof token.sub === "string" ? token.sub : undefined;
    (session.user as UserWithRole).role = typeof token.role === "string" ? token.role : undefined;
    return session;
  },
},
  session: { strategy: "jwt" as const },
  secret: process.env.NEXTAUTH_SECRET,
};
