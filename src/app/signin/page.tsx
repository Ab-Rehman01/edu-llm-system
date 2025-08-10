"use client";
import AuthForm from "@/components/AuthForm";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <AuthForm mode="signin" />
    </div>
  );
}
