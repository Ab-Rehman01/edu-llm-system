//app/api/auth/[...nextauth]/route.tsx
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // add more providers if needed
  ],
  // Optional: add callbacks, session settings, etc.
});

export { handler as GET, handler as POST };