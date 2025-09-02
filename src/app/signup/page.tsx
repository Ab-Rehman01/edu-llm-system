// app/signup/route.ts
// app/signup/route.ts
import AuthForm from "@/components/AuthForm";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen">
      
      {/* Left Column - Image with gradient overlay */}
      <div className="hidden md:flex md:w-3/5 relative">
        <img
          src="/institute-image.jpg" // Replace with your institute image
          alt="Institute"
          className="object-cover w-full h-full"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tl from-black/70 to-transparent flex flex-col justify-center p-10">
          <h1 className="text-white text-4xl font-bold mb-4">
            Welcome to Our Institute
          </h1>
          <p className="text-white text-lg">
            Join thousands of learners and unlock your full potential with our courses and programs.
          </p>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="flex w-full md:w-2/5 items-center justify-center p-8 bg-gray-100">
        <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Create Your Account
          </h2>
          <AuthForm mode="signup" />

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
