// src/lib/authOptions.ts
// src/lib/authOptions.ts
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import clientPromise from "@/lib/mongodb";
import type { NextAuthOptions } from "next-auth";
import { compare } from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const client = await clientPromise;
        const user = await client.db().collection("users").findOne({ email: credentials?.email });

        if (!user) throw new Error("User not found");

        const isValid = await compare(credentials!.password, user.password);
        if (!isValid) throw new Error("Invalid password");

        return {
          id: user._id.toString(),
          email: user.email,
          role: user.role || "student",
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role || "student";
      return token;
    },
    async session({ session, token }) {
      if (token) (session.user as any).role = token.role;
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};

// // src/lib/authOptions.ts
// import type { NextAuthOptions } from "next-auth";
// import type { JWT } from "next-auth/jwt";
// import type { Session, User } from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import bcrypt from "bcryptjs";
// import clientPromise from "@/lib/mongodb";

// interface DBUser {
//   _id: string;
//   name: string;
//   email: string;
//   password: string;
//   role?: string;
//   classId?: string; // ✅ Added classId
// }

// export const authOptions: NextAuthOptions = {
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "text" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) return null;

//         const client = await clientPromise;
//         const db = client.db("education-system");

//         const user = (await db
//           .collection("users")
//           .findOne({ email: credentials.email })) as DBUser | null;

//         if (!user) return null;

//         const isValid = await bcrypt.compare(credentials.password, user.password);
//         if (!isValid) return null;

//         return {
//           id: user._id.toString(),
//           name: user.name,
//           email: user.email,
//           role: user.role || "user",
//           classId: user.classId ? user.classId.toString() : null, // ✅ Include classId
//         } as User & { classId?: string | null };
//       },
//     }),
//   ],

//   callbacks: {
//     async jwt({ token, user }: { token: JWT & { classId?: string | null }; user?: User & { classId?: string | null } }) {
//       if (user) {
//         token.role = user.role;
//         token.classId = user.classId || null; // ✅ Save in token
//       }
//       return token;
//     },
//     async session({ session, token }: { session: Session & { user: any }; token: JWT & { classId?: string | null } }) {
//       if (session.user) {
//         session.user.role = token.role as string;
//         session.user.classId = token.classId || null; // ✅ Pass to session
//       }
//       return session;
//     },
//   },

//   session: {
//     strategy: "jwt",
//   },

//   secret: process.env.NEXTAUTH_SECRET,
// };
