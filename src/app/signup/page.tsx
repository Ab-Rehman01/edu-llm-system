//app/signup/route.ts
import AuthForm from "@/components/AuthForm";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <AuthForm mode="signup" /> {/* ✅ Signup mode */}
    </div>
  );
}
