// app/signup/route.ts
import AuthForm from "@/components/AuthForm";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen bg-gradient-to-r from-blue-100 to-purple-100">
      
      {/* Left Column - Image */}
      <div className="hidden md:flex md:w-2/3 lg:w-3/5">
        <img
          src="/institute-image.jpg" // Replace with your image
          alt="Institute"
          className="object-cover w-full h-full"
        />
      </div>

      {/* Right Column - Form */}
      <div className="flex w-full md:w-1/3 lg:w-2/5 items-center justify-center p-8">
        <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Create Your Account
          </h2>
          <AuthForm mode="signup" /> {/* ✅ Signup mode */}

          {/* Divider */}
          <div className="flex items-center my-6">
            <hr className="flex-grow border-gray-300" />
            <span className="mx-2 text-gray-400 text-sm">or</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          {/* Google / Multi-login button */}
          <button className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-100 transition">
            <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
            Sign up with Google
          </button>
        </div>
      </div>
    </div>
  );
}
