// components/AuthForm.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

type AuthFormProps = {
  mode: "signin" | "signup";
};

export default function AuthForm({ mode }: AuthFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "signin") {
      await signIn("credentials", {
        email,
        password,
        redirect: true,
        callbackUrl: "/",
      });
    } else {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        // ✅ Auto Signin after signup
        await signIn("credentials", {
          email,
          password,
          redirect: true,
          callbackUrl: "/",
        });
      } else {
        alert("Signup failed!");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-80">
      <h2 className="text-2xl font-bold mb-4">
        {mode === "signin" ? "Sign In" : "Sign Up"}
      </h2>

      {mode === "signup" && (
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 w-full mb-4"
          required
        />
      )}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 w-full mb-4"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 w-full mb-4"
        required
      />
      <button
        type="submit"
        className="bg-blue-500 text-white p-2 w-full rounded hover:bg-blue-600"
      >
        {mode === "signin" ? "Sign In" : "Sign Up"}
      </button>
    </form>
  );
}
