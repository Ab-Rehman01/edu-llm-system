"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface Props {
  allowedRoles: string[];
  children: React.ReactNode;
}

export default function RoleProtectedRoute({ allowedRoles, children }: Props) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/signin");
      return;
    }
const role = session.user.role;

if (!role || !allowedRoles.includes(role)) {
  router.push("/signin");
}
  
  }, [session, status, router, allowedRoles]);

  if (status === "loading") return <p>Loading...</p>;

  return <>{children}</>;
}
