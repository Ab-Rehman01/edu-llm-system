//app/signin/route.tsx

"use client";
import AuthForm from "@/components/AuthForm";
import { signIn } from "next-auth/react";

export default function SignInPage() {
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
            Welcome Back
          </h1>
          <p className="text-white text-lg">
            Sign in to access your courses, track your progress, and continue learning.
          </p>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="flex w-full md:w-2/5 items-center justify-center p-8 bg-gray-100">
        <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Sign In to Your Account
          </h2>
          <AuthForm mode="signin" />

          {/* Divider */}
          <div className="flex items-center my-6">
            <hr className="flex-grow border-gray-300" />
            <span className="mx-2 text-gray-400 text-sm">or</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          {/* Google / Multi-login button */}
          <button
            onClick={() => signIn("google")}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-100 transition"
          >
            <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
            Sign in with Google
          </button>

          <p className="text-center text-gray-500 text-sm mt-4">
            Don't have an account?{" "}
            <a href="/signup" className="text-blue-500 hover:underline">
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}