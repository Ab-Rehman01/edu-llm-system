//app/signin/route.tsx

"use client";
import AuthForm from "@/components/AuthForm";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen">
      
      {/* Left Column - Image with gradient overlay */}
      <div className="hidden md:flex md:w-3/5 relative">
        <img
          src="https://thumbs.dreamstime.com/b/creative-education-sketch-concrete-wall-wallpaper-freehand-drawing-school-items-back-to-concept-256429630.jpg" // Replace with your institute image
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
        <div className="w-full max-w-md">
          <AuthForm mode="signin" />
        </div>
      </div>
    </div>
  );
}