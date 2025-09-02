// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import clientPromise from "@/lib/mongodb";
import { compare } from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(
        credentials: Record<"email" | "password", string> | undefined
      ) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const client = await clientPromise;
          const db = client.db("test"); // apna DB name replace karo
          const user = await db.collection("users").findOne({
            email: credentials.email,
          });

          if (!user) {
            return null;
          }

          const isValid = await compare(credentials.password, user.password);
          if (!isValid) {
            return null;
          }

          // Ab return me role bhi include karna hoga
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role || "student", // fallback if role not set
          };
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };