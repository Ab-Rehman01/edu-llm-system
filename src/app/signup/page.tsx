// app/signup/route.ts
// app/signup/route.ts
import AuthForm from "@/components/AuthForm";

export default function SignUpPage() {
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
            Welcome to Our Institute
          </h1>
          <p className="text-white text-lg">
            Join thousands of learners and unlock your full potential with our courses and programs.
          </p>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="flex w-full md:w-2/5 items-center justify-center p-8 bg-gray-110">
        <div className="w-full max-w-md">
          <AuthForm mode="signup" />
        </div>
      </div>
    </div>
  );
}