//app/api/auth/[...nextauth]/route.tsx
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";

const handler = NextAuth({
  adapter: MongoDBAdapter(clientPromise), // ✅ MongoDB storage enabled
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt", // you can use "database" if you want sessions in MongoDB
  },
  callbacks: {
    async session({ session, token, user }) {
      // Add MongoDB user id to session (optional but useful)
      if (session.user) {
        // @ts-ignore
        session.user.id = user.id;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };