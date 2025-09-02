// components/AuthForm.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";

interface AuthFormProps {
  mode: "signup" | "signin";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (mode === "signin") {
        // ✅ Login with NextAuth credentials provider
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: true,
          callbackUrl: "/",
        });

        if (result?.error) setError("Invalid email or password");
      } else {
        // ✅ Signup API call
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!res.ok) {
          const { error } = await res.json();
          setError(error || "Signup failed");
          return;
        }

        // Auto login after signup
        await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: true,
          callbackUrl: "/",
        });
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError("Something went wrong");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {mode === "signup" && (
          <div className="relative">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder=" "
              className="peer w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <label className="absolute left-4 top-3 text-gray-400 text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:text-blue-500 peer-focus:text-xs">
              Full Name
            </label>
          </div>
        )}

        <div className="relative">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder=" "
            className="peer w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <label className="absolute left-4 top-3 text-gray-400 text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:text-blue-500 peer-focus:text-xs">
            Email
          </label>
        </div>

        <div className="relative">
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder=" "
            className="peer w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <label className="absolute left-4 top-3 text-gray-400 text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:text-blue-500 peer-focus:text-xs">
            Password
          </label>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition"
        >
          {mode === "signup" ? "Sign Up" : "Sign In"}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center my-4">
        <hr className="flex-grow border-gray-300" />
        <span className="mx-2 text-gray-400 text-sm">or</span>
        <hr className="flex-grow border-gray-300" />
      </div>

      {/* Google login */}
      <button
        onClick={() => signIn("google", { callbackUrl: "/" })}
        className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-100 transition"
      >
        <FcGoogle className="w-5 h-5" />
        {mode === "signup" ? "Sign up with Google" : "Sign in with Google"}
      </button>
    </div>
  );
}
// import { useState } from "react";
// import { signIn } from "next-auth/react";

// type AuthFormProps = {
//   mode: "signin" | "signup";
// };

// export default function AuthForm({ mode }: AuthFormProps) {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (mode === "signin") {
//       await signIn("credentials", {
//         email,
//         password,
//         redirect: true,
//         callbackUrl: "/",
//       });
//     } else {
//       const res = await fetch("/api/auth/signup", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ name, email, password }),
//       });

//       if (res.ok) {
//         // ✅ Auto Signin after signup
//         await signIn("credentials", {
//           email,
//           password,
//           redirect: true,
//           callbackUrl: "/",
//         });
//       } else {
//         alert("Signup failed!");
//       }
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-80">
//       <h2 className="text-2xl font-bold mb-4">
//         {mode === "signin" ? "Sign In" : "Sign Up"}
//       </h2>

//       {mode === "signup" && (
//         <input
//           type="text"
//           placeholder="Name"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           className="border p-2 w-full mb-4"
//           required
//         />
//       )}

//       <input
//         type="email"
//         placeholder="Email"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//         className="border p-2 w-full mb-4"
//         required
//       />
//       <input
//         type="password"
//         placeholder="Password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//         className="border p-2 w-full mb-4"
//         required
//       />
//       <button
//         type="submit"
//         className="bg-blue-500 text-white p-2 w-full rounded hover:bg-blue-600"
//       >
//         {mode === "signin" ? "Sign In" : "Sign Up"}
//       </button>
//     </form>
//   );
// }
