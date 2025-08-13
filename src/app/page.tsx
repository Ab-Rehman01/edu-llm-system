"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function HomePage() {
  const { data: session } = useSession();

  const backgroundImage = "/pexels-hai-nguyen-825252-1699414.jpg"; // aap apni image path yahan daal dein (public folder mein)

  if (session && session.user) {
    const role = (session.user as { role?: string }).role;
    let dashboardPath = "/";

    if (role === "admin") dashboardPath = "/dashboard/admin";
    else if (role === "teacher") dashboardPath = "/dashboard/teacher";
    else if (role === "student") dashboardPath = "/dashboard/student";

    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <h1 className="text-3xl font-bold mb-4 text-white drop-shadow-lg">
          Welcome, {session.user.name ?? session.user.email}!
        </h1>
        <p className="mb-6 text-white drop-shadow-md">Go to your dashboard:</p>
        <Link href={dashboardPath}>
          <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
            Go to Dashboard
          </button>
        </Link>
      </div>
    );
  }

  // Agar logged out hai to login/signup buttons show karo
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen space-y-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <h1 className="text-4xl font-bold text-white drop-shadow-lg">Welcome to Edu LLM</h1>
      <p className="text-lg text-white drop-shadow-md">Please sign in or sign up to access your portal.</p>
      <div className="flex gap-4">
        <Link href="/signin">
          <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
            Sign In
          </button>
        </Link>
        <Link href="/signup">
          <button className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
            Sign Up
          </button>
        </Link>
      </div>
    </div>
  );
}