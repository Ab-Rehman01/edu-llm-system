"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function HomePage() {
  const { data: session } = useSession();

  const backgroundImage = "/pexels-hai-nguyen-825252-1699414.jpg"; // public folder mein rakhi image

  const overlayClasses =
    "bg-black/50 backdrop-blur-md p-8 rounded-lg flex flex-col items-center justify-center space-y-4";

  if (session && session.user) {
    const role = (session.user as { role?: string }).role;
    let dashboardPath = "/";

    if (role === "admin") dashboardPath = "/dashboard/admin";
    else if (role === "teacher") dashboardPath = "/dashboard/teacher";
    else if (role === "student") dashboardPath = "/dashboard/student";

    return (
      <div
        className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className={overlayClasses}>
          <h1 className="text-3xl font-bold text-white drop-shadow-lg text-center">
            Welcome, {session.user.name ?? session.user.email}!
          </h1>
          <p className="text-white text-center drop-shadow-md">Go to your dashboard:</p>
          <Link href={dashboardPath}>
            <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
              Go to Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Agar logged out hai to login/signup buttons show karo
  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className={overlayClasses}>
        <h1 className="text-4xl font-bold text-white drop-shadow-lg text-center">
          Welcome to Edu LLM
        </h1>
        <p className="text-lg text-white drop-shadow-md text-center">
          Please sign in or sign up to access your portal.
        </p>
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
    </div>
  );
}