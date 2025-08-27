"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = [
    { name: "Home", path: "/" },
    // Sign In / Sign Up sirf jab user logged out ho
    ...(!session
      ? [
          { name: "Sign In", path: "/signin" },
          { name: "Sign Up", path: "/signup" },
        ]
      : []),
    // Role-based dashboard
    ...(session?.user?.role === "admin"
      ? [{ name: "Admin Dashboard", path: "/dashboard/admin" }]
      : session?.user?.role === "teacher"
      ? [{ name: "Teacher Dashboard", path: "/dashboard/teacher" }]
      : session?.user?.role === "student"
      ? [{ name: "Student Dashboard", path: "/dashboard/student" }]
      : []),
  ];

  return (
    <nav className="bg-blue-600 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-lg font-bold">Moosa Online Institute</h1>
        <ul className="flex gap-6 items-center">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                className={`hover:underline ${
                  pathname === item.path ? "font-bold underline" : ""
                }`}
              >
                {item.name}
              </Link>
            </li>
          ))}

          {session && (
            <li>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
